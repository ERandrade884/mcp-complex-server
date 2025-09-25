import { McpServer } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { z } from 'zod';

// Create the server instance
const server = new McpServer({
    name: 'mcp-complex-server',
    version: '1.0.0',
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    },
});

// Add a simple echo tool
server.tool(
    'echo',
    {
        title: 'Echo Tool',
        description: 'Echos back the input string.',
        inputSchema: z.object({
            message: z.string(),
        }),
    },
    async ({ message }) => {
        return {
            content: [{ type: 'text', text: `Echo: ${message}` }],
        };
    }
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.listen(transport);

console.log('MCP Server started successfully!');