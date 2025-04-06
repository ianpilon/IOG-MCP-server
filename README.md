# IOG Model Context Protocol (MCP) Server

A standalone implementation of the IOG Model Context Protocol (MCP) server that can be integrated with systems like Windsurf.

## Features

- **Tool Registry**: Includes calculator and search functionality
- **Data Retrieval**: Tools for accessing personas and products data
- **Standard MCP Endpoints**: For tool discovery and execution
- **JSON Schema Definitions**: For all tools and parameters
- **Windsurf Integration**: Example code for connecting to Windsurf

## Installation

```bash
# Clone the repository or copy these files to your project
# Install dependencies
npm install
```

## Usage

### Starting the MCP Server

```bash
npm start
# or
node iog_mcp_server.js
```

The server will run on http://localhost:3001 by default.

### Available Endpoints

- **GET /mcp/tools**: Returns a list of available tools and their definitions
- **POST /mcp/execute**: Executes a tool with the provided parameters

### Integrating with Windsurf

The `windsurf_integration.js` file provides a complete example of how to integrate this MCP server with Windsurf:

```javascript
const WindsurfMCPIntegration = require('./windsurf_integration');

async function main() {
  const integration = new WindsurfMCPIntegration();
  await integration.initialize();
  await integration.registerWithWindsurf();
  
  // Now you can use the tools through Windsurf
}

main();
```

## Data Sources

To use the data retrieval tools, you need to provide data files:

- `personas.json`: Information about IOG personas
- `products.json`: Basic information about IOG products
- `IOG Products/`: Directory containing detailed Markdown files for products

## Customizing

You can extend the tool registry in `iog_mcp_server.js` by adding new tools to the `tools` object.

## License

MIT
