# LLM Pulse MCP Server

LLM Pulse is an AI visibility analytics platform for monitoring brand mentions, citations, sentiment, competitor share of voice, and GEO performance across AI search engines.

This repository contains a small runnable wrapper for the hosted LLM Pulse MCP server. It does not contain the private LLM Pulse application source code.

## Hosted MCP Endpoint

```text
https://api.llmpulse.ai/api/v1/mcp
```

Transport: Streamable HTTP

Authentication: Bearer token

Create an LLM Pulse API key in the app, then send it as:

```text
Authorization: Bearer llmpulse_your_key_here
```

API keys are available on Scale plans and above.

## Local MCP Wrapper

Run the wrapper with an API key to expose the hosted LLM Pulse MCP tools through stdio:

```bash
npm install
LLMPULSE_API_KEY=llmpulse_your_key_here npm start
```

Without `LLMPULSE_API_KEY`, the wrapper still starts and exposes a read-only setup/status tool. This lets registries verify that the server starts and responds to MCP introspection without requiring a secret.

## Docker

```bash
docker build -t llmpulse-mcp .
docker run --rm -i -e LLMPULSE_API_KEY=llmpulse_your_key_here llmpulse-mcp
```

## What It Provides

- Project and competitor dimensions
- AI visibility, mention rate, citation rate, and weighted visibility metrics
- Brand mentions, citations, sources, sentiments, and prompt execution data
- Share of voice and top source analytics
- Recommendation, GEO Writer, Search Console, and AI traffic data where plan access allows

## Documentation

- API docs: https://api.llmpulse.ai/api-docs
- OpenAPI: https://api.llmpulse.ai/openapi.json
- Product site: https://llmpulse.ai

## Example MCP Client Configuration

```json
{
  "mcpServers": {
    "llm-pulse": {
      "type": "streamable-http",
      "url": "https://api.llmpulse.ai/api/v1/mcp",
      "headers": {
        "Authorization": "Bearer llmpulse_your_key_here"
      }
    }
  }
}
```

## Support

Questions? Contact `info@llmpulse.ai`.
