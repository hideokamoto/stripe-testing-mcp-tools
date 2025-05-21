#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources, tools, and prompts.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Type alias for a note object.
 */
type Note = { title: string, content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
  "1": { title: "First Note", content: "This is note 1" },
  "2": { title: "Second Note", content: "This is note 2" }
};

/**
 * Create an MCP server
 */
const server = new McpServer({
  name: "Stripe Testing tools",
  version: "0.1.0",
});

/**
 * Define notes resource
 */
server.resource(
  "notes",
  new ResourceTemplate("note:///{id}", {
    list: async () => {
      return {
        resources: Object.entries(notes).map(([id, note]) => ({
          uri: `note:///${id}`,
          mimeType: "text/plain",
          name: note.title,
          description: `A text note: ${note.title}`
        }))
      };
    }
  }),
  async (uri, params) => {
    const id = String(params.id);
    const note = notes[id];
    
    if (!note) {
      throw new Error(`Note ${id} not found`);
    }
    
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: "text/plain",
        text: note.content
      }]
    };
  }
);

/**
 * Define create_note tool
 */
server.tool(
  "create_note",
  {
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required")
  },
  async ({ title, content }: { title: string, content: string }) => {
    const id = String(Object.keys(notes).length + 1);
    notes[id] = { title, content };
    
    return {
      content: [{
        type: "text",
        text: `Created note ${id}: ${title}`
      }]
    };
  }
);

/**
 * Define summarize_notes prompt
 */
server.prompt(
  "summarize_notes",
  {},
  async () => {
    const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
      type: "resource" as const,
      resource: {
        uri: `note:///${id}`,
        mimeType: "text/plain",
        text: note.content
      }
    }));
    
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Please summarize the following notes:"
          }
        },
        ...embeddedNotes.map(note => ({
          role: "user" as const,
          content: note
        })),
        {
          role: "user",
          content: {
            type: "text",
            text: "Provide a concise summary of all the notes above."
          }
        }
      ]
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
