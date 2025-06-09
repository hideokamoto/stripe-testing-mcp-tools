# Stripe Testing Tools MCP Server

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

## Development

### Local Development

If you want to contribute or modify the server locally:

1. Clone the repository:
```bash
git clone <repository-url>
cd stripe-testing-tools
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

4. For development with auto-rebuild:
```bash
npm run watch
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. Use the MCP Inspector:

```bash
npm run inspector
```

The Inspector provides a web interface for testing and debugging MCP tools.

## Security

- Only Stripe test API keys are accepted
- Live API keys are rejected to prevent accidental charges
- All operations are performed in Stripe's test mode

## Error Handling

- Missing API keys will throw descriptive error messages
- Live API keys are blocked with security warnings
- Test clock customer limits are enforced (max 3 customers per clock)
- Invalid parameters are validated using Zod schemas
