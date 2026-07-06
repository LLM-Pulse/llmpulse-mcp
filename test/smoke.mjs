import { spawn } from 'node:child_process';
import { once } from 'node:events';
import readline from 'node:readline';

const child = spawn(process.execPath, ['src/index.js'], {
  cwd: new URL('..', import.meta.url),
  stdio: ['pipe', 'pipe', 'inherit']
});

const lines = readline.createInterface({ input: child.stdout });
const iterator = lines[Symbol.asyncIterator]();

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

async function readJson() {
  const { value, done } = await iterator.next();

  if (done) {
    throw new Error('Server exited before sending a response.');
  }

  return JSON.parse(value);
}

send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: {
      name: 'llmpulse-mcp-smoke',
      version: '1.0.0'
    }
  }
});

const init = await readJson();

if (init.error) {
  throw new Error(`initialize failed: ${JSON.stringify(init.error)}`);
}

send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });

const checks = [
  {
    id: 2,
    method: 'tools/list',
    assert(result) {
      if (!result.tools.some((tool) => tool.name === 'llmpulse_mcp_status')) {
        throw new Error('Expected llmpulse_mcp_status in tools/list.');
      }
    }
  },
  {
    id: 3,
    method: 'resources/list',
    assert(result) {
      if (!Array.isArray(result.resources)) {
        throw new Error('Expected resources/list to return resources.');
      }
    }
  },
  {
    id: 4,
    method: 'resources/templates/list',
    assert(result) {
      if (!Array.isArray(result.resourceTemplates)) {
        throw new Error('Expected resources/templates/list to return resourceTemplates.');
      }
    }
  },
  {
    id: 5,
    method: 'prompts/list',
    assert(result) {
      if (!Array.isArray(result.prompts)) {
        throw new Error('Expected prompts/list to return prompts.');
      }
    }
  }
];

for (const check of checks) {
  send({ jsonrpc: '2.0', id: check.id, method: check.method, params: {} });

  const response = await readJson();

  if (response.error) {
    throw new Error(`${check.method} failed: ${JSON.stringify(response.error)}`);
  }

  check.assert(response.result);
}

child.kill('SIGTERM');
await once(child, 'exit');
