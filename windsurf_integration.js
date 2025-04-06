// Example code for integrating the IOG MCP with Windsurf

const axios = require('axios');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3001';
const WINDSURF_API_URL = 'https://api.windsurf.example.com'; // Replace with actual Windsurf API URL
const WINDSURF_API_KEY = 'YOUR_WINDSURF_API_KEY'; // Replace with your actual API key

/**
 * Windsurf MCP Integration Class
 * This class provides methods to integrate the IOG MCP with Windsurf
 */
class WindsurfMCPIntegration {
  constructor() {
    this.mcpTools = null;
  }

  /**
   * Initialize the integration by fetching available MCP tools
   */
  async initialize() {
    try {
      const response = await axios.get(`${MCP_SERVER_URL}/mcp/tools`);
      this.mcpTools = response.data.tools;
      console.log('MCP tools loaded successfully:', Object.keys(this.mcpTools));
      return true;
    } catch (error) {
      console.error('Failed to initialize MCP integration:', error.message);
      return false;
    }
  }

  /**
   * Execute a tool through the MCP server
   * @param {string} toolName - The name of the tool to execute
   * @param {object} params - The parameters for the tool
   * @returns {Promise<object>} - The result of the tool execution
   */
  async executeTool(toolName, params) {
    try {
      const response = await axios.post(`${MCP_SERVER_URL}/mcp/execute`, {
        tool: toolName,
        params
      });
      return response.data;
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error.message);
      throw error;
    }
  }

  /**
   * Register the MCP tools with Windsurf
   * This would connect to Windsurf's API to register the tools
   */
  async registerWithWindsurf() {
    if (!this.mcpTools) {
      throw new Error('MCP tools not initialized. Call initialize() first.');
    }

    try {
      // This is a simplified example - the actual Windsurf API may have different requirements
      const response = await axios.post(
        `${WINDSURF_API_URL}/register-tools`,
        {
          tools: this.mcpTools
        },
        {
          headers: {
            'Authorization': `Bearer ${WINDSURF_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Tools registered with Windsurf successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to register tools with Windsurf:', error.message);
      throw error;
    }
  }

  /**
   * Create a Windsurf-compatible handler for MCP tool calls
   * This would be used to handle tool calls from Windsurf
   */
  createWindsurfHandler() {
    return async (req, res) => {
      try {
        const { tool_name, parameters } = req.body;
        
        if (!tool_name || !this.mcpTools[tool_name]) {
          return res.status(404).json({
            error: `Tool '${tool_name}' not found or not available`
          });
        }

        const result = await this.executeTool(tool_name, parameters);
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: error.message || 'An error occurred while executing the tool'
        });
      }
    };
  }
}

// Example usage
async function main() {
  const integration = new WindsurfMCPIntegration();
  
  // Initialize the integration
  const initialized = await integration.initialize();
  if (!initialized) {
    console.error('Failed to initialize. Exiting...');
    return;
  }
  
  // Example: Execute the calculator tool
  try {
    const calculationResult = await integration.executeTool('calculator', {
      expression: '2 + 2 * 10'
    });
    console.log('Calculation result:', calculationResult);
  } catch (error) {
    console.error('Calculator execution failed:', error.message);
  }
  
  // Example: Get product information
  try {
    const productResult = await integration.executeTool('getProduct', {
      name: 'realfi',
      detailed: true
    });
    console.log('Product information:', productResult);
  } catch (error) {
    console.error('Product retrieval failed:', error.message);
  }
  
  // Register tools with Windsurf (this would be implemented based on Windsurf's actual API)
  try {
    await integration.registerWithWindsurf();
    console.log('Ready to use IOG MCP tools with Windsurf!');
  } catch (error) {
    console.error('Windsurf registration failed:', error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Main execution failed:', error);
  });
}

module.exports = WindsurfMCPIntegration;
