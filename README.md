# Stripe Testing Tools MCP Server

<a href="https://www.producthunt.com/products/stripe-testing-tools-mcp-server?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-stripe&#0045;testing&#0045;tools&#0045;mcp&#0045;server" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=976365&theme=light&t=1763732445814" alt="Stripe&#0032;Testing&#0032;Tools&#0032;MCP&#0032;Server - Supercharge&#0032;Stripe&#0032;testing&#0032;with&#0032;time&#0032;simulation | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=stripe-test-mcp&config=eyJjb21tYW5kIjoibnB4IHN0cmlwZS10ZXN0LW1jcCIsImVudiI6eyJTVFJJUEVfQVBJX0tFWSI6InNrX3Rlc3RfeW91cl90ZXN0X2tleV9oZXJlIn19)

A Model Context Protocol (MCP) server that provides testing and debugging tools for Stripe integrations. This server enables developers to efficiently test Stripe workflows, manage test data, and simulate time-based scenarios using Stripe's test helpers.

## Features

### Time Simulation Tools

- **Test Clock Management** - Create and advance Stripe test clocks for time-based testing
- **Subscription Testing** - Test billing cycles and subscription renewals by controlling time

### Customer Management

- **Bulk Customer Creation** - Create multiple test customers with customizable properties
- **Customer Cleanup** - Delete test customers to maintain clean test environments
- **Test Clock Association** - Link customers to test clocks for time-controlled testing

### Product Management

- **Product Archiving** - Archive test products by ID or URL
- **Product Deletion** - Permanently delete test products to clean up test data

### Subscription Testing

- **Test Subscription Creation** - Create subscriptions with configurable proration behavior
- **Time-based Testing** - Test subscription billing cycles using test clocks

## Available Tools

### Test Clock Tools

#### `create_stripe_test_clock`

Creates a new Stripe test clock for time simulation.

**Parameters:**

- `frozen_time` (required): Unix timestamp for the initial frozen time
- `name` (optional): Name for the test clock

**Example:**

```
Create a test clock starting at January 1, 2024:
frozen_time: 1704067200
name: "New Year Test Clock"
```

#### `advance_stripe_test_clock`

Advances an existing test clock to a new time.

**Parameters:**

- `test_clock_id` (required): The ID of the test clock to advance
- `frozen_time` (required): Unix timestamp to advance the clock to

### Customer Management Tools

#### `create_stripe_test_customers`

Creates one or more test customers.

**Parameters:**

- `number` (optional, default: 1): Number of customers to create
- `payment_method_id` (optional): Payment method to associate with customers
- `name` (optional): Name for the customers
- `email` (optional): Email for the customers
- `description` (optional): Description for the customers
- `test_clock` (optional): Test clock ID to associate with customers (max 3 customers per clock)

#### `delete_stripe_test_customers`

Deletes test customers by their IDs.

**Parameters:**

- `customer_ids` (required): Array of customer IDs to delete

### Product Management Tools

#### `archive_stripe_test_products`

Archives test products (sets active: false).

**Parameters:**

- `product_ids` (optional): Array of product IDs to archive
- `urls` (optional): Array of product URLs to archive

#### `delete_stripe_test_products`

Permanently deletes test products.

**Parameters:**

- `product_ids` (optional): Array of product IDs to delete
- `urls` (optional): Array of product URLs to delete

### Subscription Tools

#### `create_stripe_test_subscription`

Creates a test subscription for a customer.

**Parameters:**

- `customer` (required): Customer ID to create the subscription for
- `items` (required): Array of subscription items with price and quantity
- `proration_behavior` (optional): How to handle prorations (`create_prorations`, `none`, `always_invoice`)
- `payment_method_id` (optional): Payment method ID to set as the subscription's default payment method

## Setup

### Prerequisites

1. A Stripe account with test mode enabled
2. Node.js and npm installed
3. Claude Desktop or another MCP-compatible client

### Installation

No installation is required! You can use this MCP server directly with npx:

```bash
npx stripe-test-mcp
```

This will automatically download and run the latest version of the server.

### Configuration

#### Environment Variables

Set your Stripe test API key as an environment variable:

```bash
export STRIPE_API_KEY=sk_test_your_test_key_here
```

**Important:** Only test keys are allowed. The server will reject live API keys for security.

#### Cursor

Click this link for adding this MCP server:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=stripe-test-mcp&config=eyJjb21tYW5kIjoibnB4IHN0cmlwZS10ZXN0LW1jcCIsImVudiI6eyJTVFJJUEVfQVBJX0tFWSI6InNrX3Rlc3RfeW91cl90ZXN0X2tleV9oZXJlIn19)

#### Claude Desktop Configuration

Add the server to your Claude Desktop configuration:

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "stripe-test-mcp": {
      "command": "npx",
      "args": ["stripe-test-mcp"],
      "env": {
        "STRIPE_API_KEY": "sk_test_your_test_key_here"
      }
    }
  }
}
```

## Usage Examples

### Time-based Subscription Testing

1. **Create a test clock:**

   ```
   Use create_stripe_test_clock with frozen_time: 1704067200 (Jan 1, 2024)
   ```

2. **Create customers associated with the test clock:**

   ```
   Use create_stripe_test_customers with test_clock: clock_id_from_step_1
   ```

3. **Create subscriptions for the customers:**

   ```
   Use create_stripe_test_subscription with customer IDs and subscription items
   ```

4. **Advance time to trigger billing:**
   ```
   Use advance_stripe_test_clock to move forward by billing cycle periods
   ```

### Clean Up Test Data

1. **Delete test customers:**

   ```
   Use delete_stripe_test_customers with customer IDs
   ```

2. **Archive test products:**
   ```
   Use archive_stripe_test_products with product IDs or URLs
   ```

## Agent Skills / Plugin

This repository ships as a **Claude Code plugin** so that agents can use the
Stripe testing tools with the right procedures and guardrails built in.

### Two lanes for Stripe testing

This repository offers two complementary ways to set up Stripe test data — pick
the one that matches your intent:

- **Imperative lane (MCP tools)** — call the Stripe API right now to create and
  advance test clocks, customers, and subscriptions. Best when you want to run
  something and see the result immediately. Provided by the `stripe-test-mcp`
  MCP server (above).
- **Declarative lane (`stripe-fixtures` skill)** — generate `stripe fixtures`
  JSON you run with the Stripe CLI. Best for test datasets you want to keep in
  source control or reproduce in CI. The skill authors and statically validates
  the JSON; you execute it.

### What the plugin bundles

- **`.claude-plugin/plugin.json`** - the plugin manifest, including the MCP
  server definition (`npx -y stripe-test-mcp@<version>` under `mcpServers`,
  pinned to the release named by `version`), so the tools connect automatically
  when the plugin loads. The server gets your Stripe key from the plugin's
  `stripe_api_key` option, not from your shell environment. The repository has
  no root `.mcp.json`, so opening it directly in Claude Code starts no project
  server; to try the plugin from a checkout, run `claude --plugin-dir .`.
- **`skills/`** - four Agent Skills that encode the recommended workflows:
  - `stripe-billing-cycle-test` - simulate a subscription billing cycle with a
    test clock (clock -> customer -> subscription -> advance -> verify).
  - `stripe-test-clock-constraints` - reference for test-clock limits and
    pitfalls (max 3 customers per clock, creation-time-only attachment,
    forward-only async advance, Unix-second timestamps).
  - `stripe-test-data-lifecycle` - setup, verification, and cleanup workflow
    using the delete/archive tools.
  - `stripe-fixtures` - author and statically validate `stripe fixtures` JSON
    (multi-step subscriptions, test clocks, `expected_error_type` failure paths,
    Connect destination charges, bulk creation) through guided conversation. See
    [`skills/stripe-fixtures/README.md`](skills/stripe-fixtures/README.md).

When this plugin is installed in Claude Code, the MCP tools become available
and Claude can load the relevant skill automatically based on the task, or you
can invoke one directly (for example `/stripe-test-mcp:stripe-billing-cycle-test`
or `/stripe-test-mcp:stripe-fixtures`).

When you enable the plugin, Claude Code asks for a **Stripe test secret key**
(`sk_test_...` or `rk_test_...`). The field is marked sensitive, so Claude Code
masks it and keeps it in your system's secure credential store, not in
`settings.json`. The server rejects live keys.

### What the plugin runs and sends

- **Runs:** `npx -y stripe-test-mcp@<version>`, which downloads that exact
  version of this package from the npm registry (`registry.npmjs.org`) and
  starts it over stdio. Nothing else is started, and the plugin has no hooks.
- **Sends:** only requests to the Stripe API (`api.stripe.com`), authenticated
  with the test key you entered, and only when Claude calls one of the tools
  listed above. The server contacts no other host. The Stripe Node.js SDK adds
  its standard client headers (`User-Agent`, and `X-Stripe-Client-Telemetry`
  with the previous request's ID and latency) to those same requests.
- **Changes:** the tools create test clocks, customers and subscriptions, advance
  test clocks, archive or delete test products, and delete test customers in your
  Stripe test mode. Each tool declares `readOnlyHint: false`, and the delete and
  archive tools also declare `destructiveHint: true`.
- **Skills:** the four skills are Markdown instructions and reference JSON. The
  `stripe-fixtures` skill writes fixture JSON for you to run with the Stripe CLI
  yourself; it doesn't run the CLI.

## Landing site

The `site/` directory holds the marketing landing page (Astro, EN + JA) for the
`stripe-fixtures` skill. It is a self-contained project that manages its own
dependencies with pnpm and deploys to Cloudflare Workers static assets. See
[`site/README.md`](site/README.md) for development and deploy instructions.

## Development

### Local Development

If you want to contribute or modify the server locally:

1. Clone the repository:

```bash
git clone <repository-url>
cd stripe-testing-tools
```

2. Install dependencies (the repository uses pnpm; the version is pinned by `packageManager` in `package.json`, so `corepack enable` picks it up):

```bash
pnpm install
```

3. Build the server:

```bash
pnpm run build
```

4. For development with auto-rebuild:

```bash
pnpm run watch
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. Use the MCP Inspector:

```bash
pnpm run inspector
```

The Inspector provides a web interface for testing and debugging MCP tools.

### Releasing

Releases are automated. Merging to `main` runs semantic-release on CircleCI
(`workflows/publish/npm-polyrepo-semantic-release.yaml` in
`hideokamoto/circleci-configurations`): it decides the next version from the
Conventional Commits since the last `v*` tag, pushes the tag, publishes to npm via
OIDC trusted publishing, and creates the GitHub Release. Do not bump `version` in
`package.json` or publish by hand.

`pnpm run test:package` checks the package the way npm publishes it: `npm pkg fix`
must leave `package.json` unchanged (otherwise `npm publish` rewrites it and only
warns), and the `stripe-test-mcp` bin must be in the tarball, executable and start
with a node shebang, and the packed server must report the version written in its
`package.json` (semantic-release sets it only at publish time). It runs in the
CircleCI `package` job, as part of `pnpm test`,
and as `prepublishOnly`, so a release stops before publishing a package whose
`npx stripe-test-mcp` would not start.

The Claude Code plugin pins the server it runs (`stripe-test-mcp@<version>` under
`mcpServers` in `.claude-plugin/plugin.json`) and names the same release as
`version` in the same file, because the Claude plugin directory refuses an unpinned `npx` and Claude Code keys
plugin updates on `version`. semantic-release does not commit back to `main`, so
after each release raise both to the new version in a follow-up `chore:` commit
(a `chore:` commit doesn't start another release). The CircleCI `plugin` job runs
`pnpm run test:plugin`, which fails until the pin matches npm `latest` and prints
the two values to set, and then runs Claude Code's
`claude plugin validate --profile directory`.

## Security

- Only Stripe test API keys are accepted
- Live API keys are rejected to prevent accidental charges
- All operations are performed in Stripe's test mode

## Error Handling

- Missing API keys will throw descriptive error messages
- Live API keys are blocked with security warnings
- Test clock customer limits are enforced (max 3 customers per clock)
- Invalid parameters are validated using Zod schemas

## License

This project is licensed under the [MIT License](LICENSE).

The `skills/stripe-fixtures` skill and the `site/` landing page were merged in
from the former `stripe-fixtures-skills` repository, which was licensed under
**Apache-2.0**. That skill keeps its original `license: Apache-2.0` declaration
in its `SKILL.md` front matter; everything else in this repository is MIT.
