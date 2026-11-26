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
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
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
