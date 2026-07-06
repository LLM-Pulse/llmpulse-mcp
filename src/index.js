#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

const DEFAULT_ENDPOINT = 'https://api.llmpulse.ai/api/v1/mcp';
const ENDPOINT = process.env.LLMPULSE_MCP_ENDPOINT || DEFAULT_ENDPOINT;
const API_KEY = process.env.LLMPULSE_API_KEY || '';
const AUTH_HEADER = API_KEY.startsWith('Bearer ') ? API_KEY : `Bearer ${API_KEY}`;

const STATUS_TOOL = {
  name: 'llmpulse_mcp_status',
  title: 'LLM Pulse MCP status',
  description:
    'Check whether this wrapper is configured with an LLM Pulse API key and show setup details for the hosted MCP endpoint.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};

function textResult(text) {
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}

function requireApiKey() {
  if (!API_KEY) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'Set LLMPULSE_API_KEY to proxy calls to the hosted LLM Pulse MCP endpoint.'
    );
  }
}

function parseSseJson(text) {
  for (const block of text.split(/\n\n+/)) {
    const data = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');

    if (data && data !== '[DONE]') {
      return JSON.parse(data);
    }
  }

  throw new Error('No JSON-RPC payload found in event stream response.');
}

async function proxyRequest(method, params = {}) {
  requireApiKey();

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-06-18'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    })
  });

  const body = await response.text();

  if (!response.ok) {
    throw new McpError(
      ErrorCode.InternalError,
      `LLM Pulse MCP endpoint returned HTTP ${response.status}: ${body.slice(0, 500)}`
    );
  }

  const payload = body.trim().startsWith('event:') || body.includes('\ndata:')
    ? parseSseJson(body)
    : JSON.parse(body);

  if (payload.error) {
    throw new McpError(
      payload.error.code || ErrorCode.InternalError,
      payload.error.message || 'LLM Pulse MCP endpoint returned an error.',
      payload.error.data
    );
  }

  return payload.result || {};
}

async function listTools() {
  if (!API_KEY) {
    return { tools: [STATUS_TOOL] };
  }

  const result = await proxyRequest('tools/list');
  const tools = result.tools || [];

  if (tools.some((tool) => tool.name === STATUS_TOOL.name)) {
    return result;
  }

  return { ...result, tools: [STATUS_TOOL, ...tools] };
}

async function callTool(params) {
  if (params.name === STATUS_TOOL.name) {
    const status = API_KEY
      ? `Configured. Proxying authenticated MCP calls to ${ENDPOINT}.`
      : [
          'Not configured with an API key.',
          'Set LLMPULSE_API_KEY to an LLM Pulse API key to expose the hosted MCP tools through this wrapper.',
          `Endpoint: ${ENDPOINT}`,
          'API keys are available from LLM Pulse on Scale plans and above.'
        ].join('\n');

    return textResult(status);
  }

  return proxyRequest('tools/call', params);
}

const server = new Server(
  {
    name: 'llmpulse-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: { listChanged: false },
      resources: { listChanged: false, subscribe: false },
      prompts: { listChanged: false }
    },
    instructions:
      'Use this server to access LLM Pulse AI visibility analytics. Set LLMPULSE_API_KEY to enable the full hosted tool set.'
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => listTools());
server.setRequestHandler(CallToolRequestSchema, async (request) => callTool(request.params));
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  if (!API_KEY) {
    return { resources: [] };
  }

  return proxyRequest('resources/list');
});
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
  if (!API_KEY) {
    return { resourceTemplates: [] };
  }

  return proxyRequest('resources/templates/list');
});
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  if (!API_KEY) {
    return { prompts: [] };
  }

  return proxyRequest('prompts/list');
});

const transport = new StdioServerTransport();
await server.connect(transport);
