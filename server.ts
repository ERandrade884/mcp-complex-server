import { McpServer } from './node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp.js';
import { StdioServerTransport } from './node_modules/@modelcontextprotocol/sdk/dist/cjs/server/stdio.js';
import { z } from 'zod';

interface EchoInput {
    message: string;
}

async function main() {
    const server = new McpServer({
        name: 'mcp-complex-server',
        version: '1.0.0',
        capabilities: {
            resources: {},
            tools: {},
            prompts: {},
        },
    });

    server.tool(
        'echo',
        {
            message: z.string(),
        },
        async (args: EchoInput) => {
            return {
                content: [{ type: 'text', text: `Echo: ${args.message}` }],
            };
        }
    );

    const transport = new StdioServerTransport();
    transport.start();
    console.log('MCP Server started successfully!');
}

main().catch(console.error);