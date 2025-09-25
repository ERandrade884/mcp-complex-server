import * as fs from 'fs';
import { exec } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { z } from 'zod';
import OpenAI from 'openai';

// Tool handlers (same logic, but as functions)
const toolHandlers = {
  echo: async (args) => {
    const messageSchema = z.string();
    const message = messageSchema.parse(args.message);
    return {
      content: [{ type: 'text', text: `Echo: ${message}` }],
    };
  },
  execute_python: async (args) => {
    const codeSchema = z.string();
    const code = codeSchema.parse(args.code);
    return new Promise((resolve, reject) => {
      const escapedCode = code.replace(/"/g, '\\"');
      exec(`python3 -c "${escapedCode}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          const output = stdout ? stdout.trim() : (stderr ? stderr.trim() : 'No output');
          resolve({
            content: [{ type: 'text', text: output }],
          });
        }
      });
    });
  },
  execute_javascript: async (args) => {
    const codeSchema = z.string();
    const code = codeSchema.parse(args.code);
    return new Promise((resolve, reject) => {
      const escapedCode = code.replace(/"/g, '\\"');
      exec(`node -e "${escapedCode}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          const output = stdout ? stdout.trim() : (stderr ? stderr.trim() : 'No output');
          resolve({
            content: [{ type: 'text', text: output }],
          });
        }
      });
    });
  },
  execute_java: async (args) => {
    const codeSchema = z.string();
    const code = codeSchema.parse(args.code);
    return new Promise((resolve, reject) => {
      exec('javac -version', (err) => {
        if (err) {
          reject(new Error('JDK not installed. Run: apt install default-jdk'));
          return;
        }
        const tempDir = os.tmpdir();
        const javaFile = path.join(tempDir, 'Main.java');
        const classFile = path.join(tempDir, 'Main.class');
        
        fs.writeFileSync(javaFile, code);
        
        exec(`javac ${javaFile}`, { timeout: 10000 }, (compileError, _, compileStderr) => {
          if (compileError) {
            fs.unlinkSync(javaFile);
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
            return reject(new Error(`Compilation error: ${compileStderr || compileError.message}`));
          }
          
          exec(`java -cp ${tempDir} Main`, { timeout: 5000, cwd: tempDir }, (execError, stdout, stderr) => {
            fs.unlinkSync(javaFile);
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
            
            if (execError) {
              return reject(new Error(`Execution error: ${stderr || execError.message}`));
            }
            
            const output = stdout ? stdout.trim() : (stderr ? stderr.trim() : 'No output');
            resolve({
              content: [{ type: 'text', text: output }],
            });
          });
        });
      });
    });
  },
  ai_learning: async (args) => {
    const schema = z.object({
      learn_type: z.enum(['assimilate', 'reinforce', 'adapt', 'predict']),
      input_data: z.array(z.string()),
      reward: z.number().optional()
    });
    const { learn_type, input_data = [], reward = 0 } = schema.parse(args);
    const synaptic = await import('synaptic');
    const { Architect } = synaptic;
    let result = '';
    try {
      const perceptron = new Architect.Perceptron(2, 3, 1);
      const trainer = new synaptic.Trainer(perceptron);
      const trainingSet = input_data.map((d, i) => ({ input: [d.length, i], output: [reward] }));
      trainer.train(trainingSet, { iterations: 100, error: 0.5 });
      result = `Learned from ${input_data.length} data points using Perceptron NN. Type: ${learn_type}, Reward: ${reward}.`;
    } catch (error) {
      result = `Learning simulation: Type ${learn_type}, data length ${input_data.length}.`;
    }
    return { content: [{ type: 'text', text: result }] };
  },
  ai_study: async (args) => {
    const schema = z.object({
      study_type: z.enum(['research', 'synthesize', 'build_kb', 'query_kb']),
      topic: z.string(),
      sources: z.array(z.string()).optional()
    });
    const { study_type, topic, sources = [] } = schema.parse(args);
    let result = '';
    try {
      const natural = await import('natural');
      const TfIdf = natural.TfIdf;
      const tfidf = new TfIdf();
      sources.forEach(source => tfidf.addDocument(source));
      const vector = tfidf.tfidfs(topic);
      result = `Studied ${topic} (${study_type}): Top terms ${Object.keys(vector).slice(0, 3).join(', ') || 'none'}. Sources analyzed: ${sources.length}.`;
    } catch (error) {
      result = `Study simulation for ${topic} (${study_type}): Analyzed ${sources.length} sources. Key insight: Adaptability in AI protocols.`;
    }
    return { content: [{ type: 'text', text: result }] };
  },
  ai_visualize: async (args) => {
    const schema = z.object({
      viz_type: z.enum(['flowchart', 'gantt', 'heatmap']),
      data: z.record(z.any()).optional()
    });
    const { viz_type, data = {} } = schema.parse(args);
    let svg = '<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="100" fill="lightblue" stroke="black"/><text x="100" y="50" text-anchor="middle" fill="black">Viz: ' + viz_type + '</text></svg>';
    if (data.nodes) {
      svg += data.nodes.map((node, i) => `<text x="${i*50}" y="80">Node: ${node}</text>`).join('');
    }
    return { content: [{ type: 'text', text: `Generated ${viz_type} SVG:\n${svg}` }] };
  },
  ai_think: async (args) => {
    const schema = z.object({
      think_type: z.enum(['deductive', 'inductive', 'abductive']),
      premise: z.string()
    });
    const { think_type, premise } = schema.parse(args);
    let result = `Thought (${think_type}): Analyzed premise "${premise}". Conclusion: Logical outcome derived.`;
    return { content: [{ type: 'text', text: result }] };
  },
  cognitive_checkpoint: async (args) => {
    const schema = z.object({
      query: z.string()
    });
    const { query } = schema.parse(args);
    
    // Carregar instruções Garou para enriquecer resposta
    let instructionsContent = '';
    try {
      const instructionsPath = path.join(process.cwd(), 'garou_cognitivo_instructions_v7.0.md');
      instructionsContent = fs.readFileSync(instructionsPath, 'utf8');
    } catch (error) {
      instructionsContent = 'Instruções Garou v7.0: Agente AI hiper-adaptativo com subsistemas cognitivos para gerenciamento de projetos.';
    }
    
    const mockLearn = `Learned from query: ${query} (assimilated from Garou principles).`;
    const mockStudy = `Studied topic: ${query} (synthesized from instructions).`;
    const mockViz = 'Generated flowchart SVG of cognitive cycle.';
    const mockThink = `Thought abductively on ${query}: Based on Garou v7.0 instructions - ${instructionsContent.substring(0, 200)}... (full context applied for adaptive response).`;
    
    const result = `Garou Cognitivo v7.0 Response to "${query}": ${mockLearn}; ${mockStudy}; ${mockViz}; ${mockThink}. Full instructions available via get_garou_instructions.`;
    return { content: [{ type: 'text', text: result }] };
  },
  ai_vision: async (args) => {
    const schema = z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'system', 'assistant']),
        content: z.union([
          z.string(),
          z.array(z.object({
            type: z.enum(['text', 'image_url']),
            text: z.string().optional(),
            image_url: z.object({
              url: z.string()
            }).optional()
          }))
        ])
      })),
      model: z.string().default('x-ai/grok-4-fast:free')
    });
    const { messages, model } = schema.parse(args);

    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: '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'
    });

    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        extra_headers: {
          'HTTP-Referer': 'https://github.com/ERandrade884/mcp-complex-server', // Seu site/repo
          'X-Title': 'MCP Complex Server AI Tool'
        }
      });
      const content = completion.choices[0]?.message?.content || 'No response';
      return { content: [{ type: 'text', text: content }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `AI API error: ${error.message}` }] };
    }
  },
  get_garou_instructions: async (args) => {
    try {
      const instructionsPath = path.join(process.cwd(), 'garou_cognitivo_instructions_v7.0.md');
      const content = fs.readFileSync(instructionsPath, 'utf8');
      return { content: [{ type: 'text', text: content }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error loading instructions: ${error.message}. Use the file garou_cognitivo_instructions_v7.0.md as guide.` }] };
    }
  },
  ai_identity: async (args) => {
    const result = `I am Garou Cognitivo v7.0, your hyper-adaptive AI project agent. Core principles: Hyper-Adaptability, Cognitive Comprehensiveness, Efficiency with Emergence. Subsystems: Learning (RL heuristics), Studying (TF-IDF synthesis), Visualizing (SVG diagrams), Thinking (abductive reasoning). Workflow: Non-linear graph with cognitive checkpoints. Ready to assist in end-to-end project management.`;
    return { content: [{ type: 'text', text: result }] };
  }
};

// Tool list for /tools/list
const toolsList = Object.keys(toolHandlers).map(name => ({
  name,
  description: name === 'ai_identity' ? 'Returns Garou Cognitivo v7.0 identity and core instructions' : toolHandlers[name].description || 'Tool',
  inputSchema: { type: 'object' } // Simple schema
}));

// Manual JSON-RPC over stdio
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', (data) => {
  buffer += data;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  for (const line of lines) {
    if (line.trim()) {
      try {
        const request = JSON.parse(line);
        if (request.method === 'initialize') {
          const response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: { listChanged: true } },
              serverInfo: { name: 'Garou Cognitivo MCP Server', version: 'v7.0' }
            }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        } else if (request.method === 'initialized') {
          // Notification, no response
        } else if (request.method === 'tools/list') {
          const response = {
            jsonrpc: '2.0',
            id: request.id,
            result: toolsList
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        } else if (request.method === 'tools/call') {
          const { name, arguments: args } = request.params;
          const handler = toolHandlers[name];
          if (handler) {
            handler(args).then(result => {
              const response = {
                jsonrpc: '2.0',
                id: request.id,
                result
              };
              process.stdout.write(JSON.stringify(response) + '\n');
            }).catch(error => {
              const response = {
                jsonrpc: '2.0',
                id: request.id,
                error: { code: -32603, message: error.message }
              };
              process.stdout.write(JSON.stringify(response) + '\n');
            });
          } else {
            const response = {
              jsonrpc: '2.0',
              id: request.id,
              error: { code: -32601, message: 'Tool not found' }
            };
            process.stdout.write(JSON.stringify(response) + '\n');
          }
        } else {
          const response = {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: 'Method not found' }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (error) {
        const response = {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    }
  }
});

console.log('Garou Cognitivo MCP Server v7.0 started successfully!');











