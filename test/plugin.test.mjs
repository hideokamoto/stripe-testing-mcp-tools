// Checks the Claude Code plugin manifest (.claude-plugin/plugin.json)
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
// so after each release the pinned server and `version` in plugin.json have
// to be raised in a follow-up commit; this test is what says so.
//
// The MCP server is declared inline in plugin.json (`mcpServers`), not in a
// .mcp.json at the repository root: Claude Code also reads a root .mcp.json as
// project-scoped config when this repository is opened directly, and project
// scope does not resolve `${user_config.*}`. The first test keeps it that way.
//
// Run with `pnpm run test:plugin` (node:test, no build step needed).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = path => JSON.parse(readFileSync(join(root, path), 'utf8'));

const pkg = readJson('package.json');
const plugin = readJson('.claude-plugin/plugin.json');

const LAUNCHERS = new Set(['npx', 'bunx', 'pnpm', 'yarn', 'uvx', 'pipx', 'uv']);
const EXACT_SEMVER = /^\d+\.\d+\.\d+$/;

// Returns the version that `<name>@<version>` pins, or undefined when the
// argument names the package without an exact version.
function pinnedVersion(arg, name) {
  if (!arg.startsWith(`${name}@`)) return undefined;
  const version = arg.slice(name.length + 1);
  return EXACT_SEMVER.test(version) ? version : undefined;
}

const mcpServers = plugin.mcpServers ?? {};
const servers = Object.entries(mcpServers);

test('plugin.json declares the stripe-test-mcp server inline, with no root .mcp.json', () => {
  assert.ok(
    !existsSync(join(root, '.mcp.json')),
    'a root .mcp.json is also loaded as project-scoped config, where ${user_config.*} is not resolved; declare servers in plugin.json'
  );
  assert.ok(mcpServers[pkg.name], `plugin.json mcpServers has no "${pkg.name}" server`);
});

test('every package launcher in plugin.json runs an exact version', () => {
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
  const args = mcpServers[pkg.name].args ?? [];
  const pinned = args.map(arg => pinnedVersion(arg, pkg.name)).find(Boolean);
  assert.ok(pinned, `plugin.json mcpServers does not run ${pkg.name}@<exact version>`);
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
  const args = mcpServers[pkg.name].args ?? [];
  const pinned = args.map(arg => pinnedVersion(arg, pkg.name)).find(Boolean);
  const latest = execFileSync('npm', ['view', pkg.name, 'dist-tags.latest'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  assert.equal(
    pinned,
    latest,
    `npm latest is ${pkg.name}@${latest}, but plugin.json pins ${pinned}. ` +
      `Set "${pkg.name}@${latest}" in mcpServers and "version": "${latest}" in .claude-plugin/plugin.json.`
  );
});
