import { spawn } from 'child_process';

// Função para enviar request MCP e aguardar response
function sendRequest(serverProcess, request) {
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
}

function callTool(serverProcess, toolName, args = {}, requestId) {
  const request = {
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  };

  sendRequest(serverProcess, request);

  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (data) => {
      const chunk = data.toString();
      console.log('Raw server output:', chunk); // Debug raw
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === requestId) {
              serverProcess.stdout.removeListener('data', onData);
              resolve(response.result || response);
            }
          } catch (e) {
            console.log('Parse error on line:', line); // Debug
          }
        }
      }
    };
    serverProcess.stdout.on('data', onData);

    setTimeout(() => {
      serverProcess.stdout.removeListener('data', onData);
      reject(new Error('Timeout'));
    }, 10000);
  });
}

// Lista de tools para testar
const toolsToTest = [
  { name: 'echo', args: { message: 'Teste MCP!' } },
  { name: 'execute_python', args: { code: 'print("Hello from Python!")' } },
  { name: 'execute_javascript', args: { code: 'console.log("Hello from JS!");' } },
  { name: 'execute_java', args: { code: 'public class Main { public static void main(String[] args) { System.out.println("Hello from Java!"); } }' } },
  { name: 'ai_learning', args: { learn_type: 'assimilate', input_data: ['data1', 'data2'], reward: 1 } },
  { name: 'ai_study', args: { study_type: 'research', topic: 'MCP Protocol', sources: ['source1', 'source2'] } },
  { name: 'ai_visualize', args: { viz_type: 'flowchart', data: { nodes: ['start', 'end'] } } },
  { name: 'ai_think', args: { think_type: 'deductive', premise: 'All MCP tools work.' } },
  { name: 'cognitive_checkpoint', args: { query: 'Test full cycle' } },
  { name: 'ai_vision', args: { 
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What is in this image?"
          },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
            }
          }
        ]
      }
    ],
    model: "x-ai/grok-4-fast:free"
  } },
  { name: 'get_garou_instructions', args: {} },
  { name: 'ai_identity', args: {} },
  // Adicionar ao final para teste de pergunta
  { name: 'cognitive_checkpoint', args: { query: 'Como Garou v7.0 gerencia um projeto de AI?' } }
];

// Iniciar servidor
const serverProcess = spawn('node', ['server.js'], { stdio: ['pipe', 'pipe', 'inherit'] });

serverProcess.on('error', (err) => console.error('Erro ao iniciar servidor:', err));
serverProcess.on('close', (code) => console.log(`Servidor fechado com código ${code}`));

// Handshake MCP
async function initialize() {
  // Enviar initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  sendRequest(serverProcess, initRequest);

  // Aguardar response
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (data) => {
      const chunk = data.toString();
      console.log('Raw init output:', chunk); // Debug
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === 1) {
              serverProcess.stdout.removeListener('data', onData);
              resolve(response);
            }
          } catch (e) {
            console.log('Init parse error:', line);
          }
        }
      }
    };
    serverProcess.stdout.on('data', onData);

    setTimeout(() => {
      serverProcess.stdout.removeListener('data', onData);
      reject(new Error('Init timeout'));
    }, 5000);
  });
}

// Enviar initialized notification após init
function sendInitialized() {
  const initialized = {
    jsonrpc: '2.0',
    id: 0,
    method: 'initialized',
    params: {}
  };
  sendRequest(serverProcess, initialized);
}

// Testar tools
async function runTests() {
  try {
    console.log('Iniciando handshake MCP...');
    const initResponse = await initialize();
    console.log('Initialize response:', JSON.stringify(initResponse, null, 2));
    sendInitialized();
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay pós-initialized

    console.log('\nIniciando testes das tools...\n');
    let requestId = 2;
    for (const test of toolsToTest) {
      try {
        console.log(`Testando ${test.name} com args:`, JSON.stringify(test.args));
        const result = await callTool(serverProcess, test.name, test.args, requestId++);
        console.log(`Resultado:`, JSON.stringify(result, null, 2));
        console.log('---');
      } catch (error) {
        console.error(`Erro no teste de ${test.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Erro no handshake:', error.message);
  } finally {
    setTimeout(() => serverProcess.kill(), 1000);
  }
}

runTests().catch(console.error);