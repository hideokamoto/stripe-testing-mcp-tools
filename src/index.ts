#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources, tools, and prompts.
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Stripe from 'stripe';
import { object, z } from 'zod';

/**
 * Create an MCP server
 */
const server = new McpServer({
  name: 'Stripe Testing tools',
  version: '0.1.0',
});

/**
 * Stripe APIキーをバリデーションする純粋関数
 * @param apiKey Stripe APIキー
 * @throws Error APIキーが無効な場合
 */
export function validateStripeApiKey(apiKey?: string): void {
  if (!apiKey) {
    throw new Error('No Stripe secret key found');
  }
  if (apiKey.includes('live')) {
    throw new Error('You cannot use a live Stripe secret key for testing');
  }
}

const createStripeClient = (apiKey?: string) => {
  validateStripeApiKey(apiKey);
  const stripe = new Stripe(apiKey!, {
    apiVersion: '2025-04-30.basil',
    appInfo: { name: 'stripe-testing-tools-mcp', version: '0.1.0' },
  });
  return stripe;
};

/**
 * stripeのtest clockを使ったシュミレーションを実行するMCP Toolを作りたい。
 * APIがあるので、それを利用して時間を動かす感じ。
 */

server.registerTool(
  'create_stripe_test_clock',
  {
    title: 'Create Stripe Test Clock',
    description: 'Create a new Stripe test clock for time-based testing',
    inputSchema: {
      frozen_time: z.number().describe('Unix timestamp for the initial frozen time of the test clock'),
      name: z.string().optional().describe('Optional name for the test clock'),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
    },
  },
  async ({ frozen_time, name }) => {
    const stripe = createStripeClient(process.env.STRIPE_API_KEY);
    const params = {
      frozen_time,
      name,
    };
    const testClock = await stripe.testHelpers.testClocks.create(params);
    return {
      content: [{ type: 'text', text: `Test clock ${testClock.id} has been created. Initial time: ${new Date(testClock.frozen_time * 1000).toISOString()}` }],
    };
  }
);

server.registerTool(
  'advance_stripe_test_clock',
  {
    title: 'Advance Stripe Test Clock',
    description: 'Advance a Stripe test clock to a specific time to simulate time progression',
    inputSchema: {
      test_clock_id: z.string().describe('The ID of the test clock to advance'),
      frozen_time: z.number().describe('Unix timestamp to advance the clock to'),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
    },
  },
  async ({ test_clock_id, frozen_time }) => {
    const stripe = createStripeClient(process.env.STRIPE_API_KEY);
    const testClock = await stripe.testHelpers.testClocks.advance(test_clock_id, {
      frozen_time,
    });
    return {
      content: [{ type: 'text', text: `Test clock ${testClock.id} has been advanced to ${new Date(testClock.frozen_time * 1000).toISOString()}. Status: ${testClock.status}` }],
    };
  }
);

server.registerTool(
  'create_stripe_test_subscription',
  {
    title: 'Create Stripe Test Subscription',
    description: 'Create a new Stripe subscription for testing purposes',
    inputSchema: {
      customer: z.string().describe('The ID of the customer to create the subscription for.'),
      proration_behavior: z
        .enum(['create_prorations', 'none', 'always_invoice'])
        .optional()
        .describe('Determines how to handle prorations when the subscription items change.'),
      payment_method_id: z
      .string()
      .optional()
      .describe('The payment method to use for the subscription'),
      items: z
        .array(
          z.object({
            price: z.string().optional().describe('The ID of the price.'),
            quantity: z
              .number()
              .int()
              .min(1)
              .optional()
              .describe('The quantity of the plan to subscribe to.'),
          })
        )
        .describe('A list of subscription items.'),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
    },
  },
  async ({ customer, items, proration_behavior: prorationBehavior, payment_method_id: paymentMethodId }) => {
    const stripe = createStripeClient(process.env.STRIPE_API_KEY);
    const subscriptionCreationParams: Stripe.SubscriptionCreateParams = {
      customer: customer,
      items: items,
    };
    if (prorationBehavior) {
      subscriptionCreationParams.proration_behavior = prorationBehavior;
    }
    if (paymentMethodId) {
      subscriptionCreationParams.default_payment_method = paymentMethodId;
    }
    const subscription = await stripe.subscriptions.create(subscriptionCreationParams);
    return {
      content: [{ type: 'text', text: `Created subscription ${subscription.id}` }],
    };
  }
);

server.registerTool('archive_stripe_test_products', {
  title: 'Archive Stripe Test Products',
  description: 'Archive (deactivate) Stripe products for testing purposes',
  inputSchema: {
    product_ids: z.array(z.string()).optional().describe('The IDs of the products to archive'),
    urls: z.array(z.string()).optional().describe('The URLs of the products to archive'),
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },
}, async ({ product_ids: productIds, urls }) => {
  const stripe = createStripeClient(process.env.STRIPE_API_KEY);
  let productIdsToDelete: string[] = []
  if (productIds) {
    productIdsToDelete = productIds
  }
  if (urls) {
    for await (const url of urls) {
      const { data: products } = await stripe.products.list({url})
      productIdsToDelete.push(...products.map(product => product.id))
    }
  }
  for (const productId of productIdsToDelete) {
    await stripe.products.update(productId, {active: false});
  }
  return {
    content: [{ type: 'text', text: `Archived ${productIdsToDelete.length} products` }],
  }
})

server.registerTool('delete_stripe_test_products', {
  title: 'Delete Stripe Test Products',
  description: 'Permanently delete Stripe products for testing purposes',
  inputSchema: {
    product_ids: z.array(z.string()).optional().describe('The IDs of the products to delete'),
    urls: z.array(z.string()).optional().describe('The URLs of the products to delete'),
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },
}, async ({ product_ids: productIds, urls }) => {
  const stripe = createStripeClient(process.env.STRIPE_API_KEY);
  let productIdsToDelete: string[] = []
  if (productIds) {
    productIdsToDelete = productIds
  }
  if (urls) {
    for await (const url of urls) {
      const { data: products } = await stripe.products.list({url})
      productIdsToDelete.push(...products.map(product => product.id))
    }
  }
  for (const productId of productIdsToDelete) {
    await stripe.products.del(productId);
  }
  return {
    content: [{ type: 'text', text: `Deleted ${productIdsToDelete.length} products` }],
  }
})

server.registerTool('delete_stripe_test_customers', {
  title: 'Delete Stripe Test Customers',
  description: 'Permanently delete Stripe customers for testing purposes',
  inputSchema: {
    customer_ids: z.array(z.string()).describe('The IDs of the customers to delete'),
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },
}, async ({ customer_ids: customerIds }) => {
  const stripe = createStripeClient(process.env.STRIPE_API_KEY);
  for (const customerId of customerIds) {
    await stripe.customers.del(customerId);
  }
  return {
    content: [{ type: 'text', text: `Deleted ${customerIds.length} customers` }],
  }
})

server.registerTool(
  'create_stripe_test_customers',
  {
    title: 'Create Stripe Test Customers',
    description: 'Create one or more Stripe test customers for testing purposes',
    inputSchema: {
      number: z.number().default(1).describe('The number of customers to create'),
      payment_method_id: z
        .string()
        .optional()
        .describe('The payment method to use for the customers'),
      name: z.string().optional().describe('The name of the customers'),
      email: z.string().optional().describe('The email of the customers'),
      description: z.string().optional().describe('The description of the customers'),
      test_clock: z.string().optional().describe('The ID of the test clock to associate with the customers'),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
    },
  },
  async ({ number, payment_method_id: paymentMethodId, name, email, description, test_clock }) => {
    const stripe = createStripeClient(process.env.STRIPE_API_KEY);
    const customerCreationParams: Stripe.CustomerCreateParams = {
      metadata: {
        generator: 'stripe-testing-tools-mcp',
      },
    };
    if (paymentMethodId) {
      customerCreationParams.payment_method = paymentMethodId;
      customerCreationParams.invoice_settings = {
        default_payment_method: paymentMethodId,
      }
    }
    if (name) {
      customerCreationParams.name = name;
    }
    if (email) {
      customerCreationParams.email = email;
    }
    if (description) {
      customerCreationParams.description = description;
    }
    if (test_clock) {
      if (number > 3) {
        return {
          content: [{
            type: 'text',
            text: "You can not associate more than 3 customers to a test clock."
          }]
        }
      }
      customerCreationParams.test_clock = test_clock;
    }

    const customerIds: string[] = [];
    for (let i = 0; i < number; i++) {
      const customer = await stripe.customers.create(customerCreationParams);
      customerIds.push(customer.id);
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: `Created ${customerIds.length} customers: ${customerIds.join(', ')}${test_clock ? `\nAssociated with test clock ${test_clock}` : ''}`,
            customerIds,
          })
        },
      ],
    };
  }
);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});
