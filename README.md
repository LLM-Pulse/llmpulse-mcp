# LLM Pulse MCP Server

LLM Pulse is an AI visibility analytics platform for monitoring brand mentions, citations, sentiment, competitor share of voice, and GEO performance across AI search engines.

This repository contains a small runnable wrapper for the hosted LLM Pulse MCP server. It does not contain the private LLM Pulse application source code.

## Hosted MCP Endpoint

```text
https://api.llmpulse.ai/api/v1/mcp
```

Transport: Streamable HTTP

Authentication: Bearer token

The hosted endpoint also supports OAuth 2.0 with automatic discovery and dynamic client registration for compatible clients.

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

## Gemini CLI

Install the extension from GitHub:

```bash
gemini extensions install https://github.com/LLM-Pulse/llmpulse-mcp
```

Gemini CLI connects to the hosted endpoint and opens the LLM Pulse OAuth flow when authentication is required.

## GitHub Copilot and VS Code

In VS Code, run **Chat: Install Plugin From Source** from the Command Palette and enter:

```text
https://github.com/LLM-Pulse/llmpulse-mcp
```

The Agent Plugin registers the hosted LLM Pulse MCP server for GitHub Copilot and uses its OAuth sign-in flow.

## Kiro Power and Agent Plugin

This repository is also a portable Agent Plugin. In Kiro, choose **Powers → Add Custom Power → Import power from GitHub** and enter:

```text
https://github.com/LLM-Pulse/llmpulse-mcp
```

Kiro connects to the hosted server and handles the OAuth sign-in flow.

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
- Privacy policy: https://llmpulse.ai/privacy

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
