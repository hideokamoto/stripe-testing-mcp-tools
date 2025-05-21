#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources, tools, and prompts.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger } from "./logger.js";
import Stripe from 'stripe';
import { z } from "zod";

const STRIPE_API_VERSION: Stripe.StripeConfig['apiVersion'] =  '2025-04-30.basil'
/**
 * Create an MCP server
 */
const server = new McpServer({
  name: "Stripe Testing tools",
  version: "0.1.0",
});

const createStripeClient = (apiKey?: string) => {
  if (!apiKey) {
    throw new Error("No Stripe secret key found")
  }
  if (apiKey.includes("live")) {
    throw new Error("You cannot use a live Stripe secret key for testing")
  }
  const stripe = new Stripe(apiKey, { apiVersion: '2025-04-30.basil', appInfo: { name: "stripe-testing-tools-mcp" , version: "0.1.0" } });
  return stripe
}

server.tool(
  "create_stripe_test_subscription",
  {
    customer: z.string().describe("The ID of the customer to create the subscription for."),
    proration_behavior: z
      .enum(['create_prorations', 'none', 'always_invoice'])
      .optional()
      .describe(
        'Determines how to handle prorations when the subscription items change.'
      ),
    items: z
      .array(
        z.object({
          price: z
            .string()
            .optional()
            .describe('The ID of the price.'),
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
  async ({customer, items, proration_behavior: prorationBehavior}) => {
    const stripe = createStripeClient(process.env.STRIPE_API_KEY)
    const subscriptionCreationParams: Stripe.SubscriptionCreateParams = {
      customer: customer,
      items: items,
    }
    if (prorationBehavior) {
      subscriptionCreationParams.proration_behavior = prorationBehavior
    }

    const subscription = await stripe.subscriptions.create(subscriptionCreationParams)
    return {
      content: [{ type: "text", text: `Created subscription ${subscription.id}` }]
    }
  }
)

server.tool(
  "create_stripe_test_customers",
  {
    number: z.number().default(1).describe("The number of customers to create"),
    payment_method_id: z.string().optional().describe("The payment method to use for the customers"),
    name: z.string().optional().describe("The name of the customers"),
    email: z.string().optional().describe("The email of the customers"),
    description: z.string().optional().describe("The description of the customers"),
  },
  async ({ number, payment_method_id: paymentMethodId, name, email, description }) => {
    const stripe = createStripeClient(process.env.STRIPE_API_KEY)
    const customerCreationParams: Stripe.CustomerCreateParams = {
      metadata: {
        generator: "stripe-testing-tools-mcp"
      }
    }
    if (paymentMethodId) {
      customerCreationParams.payment_method = paymentMethodId
    }
    if (name) {
      customerCreationParams.name = name
    }
    if (email) {
      customerCreationParams.email = email
    }
    if (description) {
      customerCreationParams.description = description
    }

    const customerIds: string[] = []
    for (let i = 0; i < number; i++) {
      const customer = await stripe.customers.create(customerCreationParams)
      customerIds.push(customer.id)
    }
    return {
      content: [{
        type: "text",
        text: `Created ${customerIds.length} customers: ${customerIds.join(", ")}`
      }]
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

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
