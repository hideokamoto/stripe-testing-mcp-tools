// Checks the package as npm publishes it, so a release can't ship a broken
// `npx stripe-test-mcp` entry point.
//
// `npm publish` normalizes package.json before packing (the same fixes
// `npm pkg fix` applies) and only warns about what it changed. A bin path that
// npm rewrites, or one that points at a file missing from the tarball, would
// otherwise only show up as a warning in the release log.
//
// Run with `pnpm run test:package` (node:test, no build step needed: `npm pack`
// runs the `prepare` script, which builds).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function npm(args, cwd) {
  return execFileSync('npm', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

test('package.json declares the stripe-test-mcp bin', () => {
  assert.equal(typeof pkg.bin, 'object');
  assert.equal(typeof pkg.bin['stripe-test-mcp'], 'string');
});

test('npm pkg fix leaves package.json unchanged (npm publish would not auto-correct it)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pkg-fix-'));
  try {
    copyFileSync(join(root, 'package.json'), join(dir, 'package.json'));
    npm(['pkg', 'fix'], dir);
    const fixed = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    assert.deepEqual(fixed, pkg);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('every bin target is in the tarball, executable, and starts with a node shebang', () => {
  const [report] = JSON.parse(npm(['pack', '--dry-run', '--json'], root));
  const files = new Map(report.files.map(file => [file.path, file]));

  for (const [name, target] of Object.entries(pkg.bin)) {
    const file = files.get(target);
    assert.ok(file, `bin "${name}" points at ${target}, which is not in the tarball`);
    assert.ok(file.mode & 0o111, `bin "${name}" (${target}) is not executable in the tarball`);
    const firstLine = readFileSync(join(root, target), 'utf8').split('\n', 1)[0];
    assert.equal(firstLine, '#!/usr/bin/env node', `bin "${name}" (${target}) has no node shebang`);
  }
});

// Sends an MCP initialize request to the server at `entry` over stdio and
// resolves with the serverInfo it answers with.
function initialize(entry) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry], {
      env: { ...process.env, STRIPE_API_KEY: 'sk_test_package_check' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('the server did not answer initialize within 15s'));
    }, 15000);
    let stdout = '';
    child.stdout.on('data', chunk => {
      stdout += chunk;
      const line = stdout.split('\n').find(l => l.includes('"id":1'));
      if (line) {
        clearTimeout(timer);
        child.kill();
        resolve(JSON.parse(line).result.serverInfo);
      }
    });
    child.on('error', reject);
    child.stdin.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'package-check', version: '0.0.0' },
        },
      }) + '\n'
    );
  });
}

// semantic-release writes the release version into package.json right before
// `npm publish`, and never commits it back. The server must report the version
// of the package it is running from, not one written into the source.
test('the published server reports the version in its package.json', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pkg-version-'));
  try {
    const [report] = JSON.parse(npm(['pack', '--json', '--pack-destination', dir], root));
    execFileSync('tar', ['xzf', join(dir, report.filename), '-C', dir]);
    const packed = join(dir, 'package');
    const manifestPath = join(packed, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.version = '99.98.97';
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    // The tarball has no dependencies; use the ones this repo installed.
    symlinkSync(join(root, 'node_modules'), join(packed, 'node_modules'), 'dir');

    const serverInfo = await initialize(join(packed, pkg.bin['stripe-test-mcp']));
    assert.equal(serverInfo.version, '99.98.97');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
