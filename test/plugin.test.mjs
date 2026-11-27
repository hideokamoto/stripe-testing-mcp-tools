// Checks the Claude Code plugin files (.claude-plugin/plugin.json and .mcp.json)
// against the rules of the Claude plugin directory that a schema check alone
// does not catch (https://claude.com/docs/plugins/pre-submission-checklist):
//
// - a package launcher (npx) must run an exact version, not a range or latest
//   (unpinned launchers block a submission);
// - credentials are asked for through `userConfig` with `sensitive: true` and
//   referenced as `${user_config.KEY}`, never read from the user's environment;
// - `version` in plugin.json is what Claude Code keys plugin updates on, so it
//   names the same release as the server the plugin runs.
//
// The last test compares the pinned version with the npm `latest` dist-tag.
// semantic-release publishes from main without committing the version back,
// so after each release the pin in .mcp.json and the version in plugin.json
// have to be raised in a follow-up commit; this test is what says so.
//
// Run with `pnpm run test:plugin` (node:test, no build step needed).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = path => JSON.parse(readFileSync(join(root, path), 'utf8'));

const pkg = readJson('package.json');
const plugin = readJson('.claude-plugin/plugin.json');
const mcp = readJson('.mcp.json');

const LAUNCHERS = new Set(['npx', 'bunx', 'pnpm', 'yarn', 'uvx', 'pipx', 'uv']);
const EXACT_SEMVER = /^\d+\.\d+\.\d+$/;

// Returns the version that `<name>@<version>` pins, or undefined when the
// argument names the package without an exact version.
function pinnedVersion(arg, name) {
  if (!arg.startsWith(`${name}@`)) return undefined;
  const version = arg.slice(name.length + 1);
  return EXACT_SEMVER.test(version) ? version : undefined;
}

const servers = Object.entries(mcp.mcpServers ?? {});

test('.mcp.json declares the stripe-test-mcp server', () => {
  assert.ok(mcp.mcpServers?.[pkg.name], `.mcp.json has no "${pkg.name}" server`);
});

test('every package launcher in .mcp.json runs an exact version', () => {
  for (const [name, server] of servers) {
    if (!LAUNCHERS.has(server.command)) continue;
    const packages = (server.args ?? []).filter(arg => !arg.startsWith('-'));
    assert.ok(packages.length > 0, `server "${name}" runs ${server.command} with no package`);
    for (const arg of packages) {
      assert.match(
        arg,
        /^(@[^/@]+\/)?[^@]+@\d+\.\d+\.\d+$/,
        `server "${name}" runs "${arg}"; pin it to an exact version such as ${pkg.name}@1.2.3`
      );
    }
  }
});

test('the plugin runs this repository package, and plugin.json names the same version', () => {
  const args = mcp.mcpServers[pkg.name].args ?? [];
  const pinned = args.map(arg => pinnedVersion(arg, pkg.name)).find(Boolean);
  assert.ok(pinned, `.mcp.json does not run ${pkg.name}@<exact version>`);
  assert.equal(
    plugin.version,
    pinned,
    `plugin.json version (${plugin.version}) differs from the pinned server (${pkg.name}@${pinned})`
  );
});

test('MCP server env values come only from sensitive userConfig options', () => {
  const options = plugin.userConfig ?? {};
  for (const [name, server] of servers) {
    for (const [key, value] of Object.entries(server.env ?? {})) {
      const ref = /^\$\{user_config\.([A-Za-z_][A-Za-z0-9_]*)\}$/.exec(value);
      assert.ok(
        ref,
        `server "${name}" sets ${key}="${value}"; ask for it through userConfig and use \${user_config.KEY}`
      );
      const option = options[ref[1]];
      assert.ok(
        option,
        `server "${name}" uses user_config.${ref[1]}, which plugin.json does not declare`
      );
      if (/KEY|TOKEN|SECRET|PASSWORD/i.test(key)) {
        assert.equal(
          option.sensitive,
          true,
          `userConfig.${ref[1]} holds ${key}; set "sensitive": true`
        );
      }
    }
  }
});

test('the pinned server is the latest release on npm', () => {
  const args = mcp.mcpServers[pkg.name].args ?? [];
  const pinned = args.map(arg => pinnedVersion(arg, pkg.name)).find(Boolean);
  const latest = execFileSync('npm', ['view', pkg.name, 'dist-tags.latest'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  assert.equal(
    pinned,
    latest,
    `npm latest is ${pkg.name}@${latest}, but .mcp.json pins ${pinned}. ` +
      `Set "${pkg.name}@${latest}" in .mcp.json and "version": "${latest}" in .claude-plugin/plugin.json.`
  );
});
