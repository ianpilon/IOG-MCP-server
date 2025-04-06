// Example Windsurf application using the IOG MCP server
const axios = require('axios');

// Windsurf application configuration
const WINDSURF_APP_CONFIG = {
  appName: 'IOG Crypto Education App',
  modelProvider: 'deepseek',
  modelName: 'deepseek-coder',
  mcpServerUrl: 'http://localhost:3001'
};

/**
 * This class represents a Windsurf application that uses the IOG MCP server
 * to provide personalized cryptocurrency education based on user personas
 */
class WindsurfCryptoEducationApp {
  constructor() {
    this.mcpTools = null;
    this.mcpServerUrl = WINDSURF_APP_CONFIG.mcpServerUrl;
  }

  /**
   * Initialize the application by discovering available MCP tools
   */
  async initialize() {
    try {
      // Discover available tools from the MCP server
      const response = await axios.get(`${this.mcpServerUrl}/mcp/tools`);
      this.mcpTools = response.data.tools;
      console.log('MCP tools discovered:', Object.keys(this.mcpTools));
      return true;
    } catch (error) {
      console.error('Failed to initialize MCP integration:', error.message);
      return false;
    }
  }

  /**
   * Process a user query using Windsurf and the IOG MCP
   * @param {string} userQuery - The user's question or request
   * @param {object} context - Additional context about the user
   * @returns {object} - The processed response
   */
  async processUserQuery(userQuery, context = {}) {
    console.log(`Processing query: "${userQuery}"`);
    
    try {
      // Step 1: Analyze the query to determine which tools might be needed
      const toolsNeeded = await this.analyzeQueryForTools(userQuery);
      
      // Step 2: Execute the tools in sequence through the MCP server
      const toolResults = await this.executeToolSequence(toolsNeeded, userQuery, context);
      
      // Step 3: Generate a response using the tool results
      const response = await this.generateResponse(userQuery, toolResults, context);
      
      return response;
    } catch (error) {
      console.error('Error processing user query:', error);
      return {
        success: false,
        error: error.message,
        response: 'I encountered an error while processing your request.'
      };
    }
  }

  /**
   * Analyze the user query to determine which tools might be needed
   * In a real Windsurf app, this would use the model to decide
   */
  async analyzeQueryForTools(query) {
    const lowerQuery = query.toLowerCase();
    const toolsNeeded = [];
    
    // Simple rule-based tool selection (in a real app, this would use the model)
    if (lowerQuery.includes('calculate') || /[0-9][\s]*[\+\-\*\/][\s]*[0-9]/.test(lowerQuery)) {
      toolsNeeded.push({
        name: 'calculator',
        params: { expression: this.extractCalculationExpression(lowerQuery) }
      });
    }
    
    if (lowerQuery.includes('persona') || lowerQuery.includes('user type')) {
      toolsNeeded.push({
        name: 'getPersona',
        params: { name: this.extractPersonaName(lowerQuery) }
      });
    }
    
    if (lowerQuery.includes('product') || 
        lowerQuery.includes('realfi') || 
        lowerQuery.includes('lace') || 
        lowerQuery.includes('midnight')) {
      toolsNeeded.push({
        name: 'getProduct',
        params: { 
          name: this.extractProductName(lowerQuery),
          detailed: lowerQuery.includes('details') || lowerQuery.includes('more information')
        }
      });
    }
    
    // If no specific tools identified, use search as fallback
    if (toolsNeeded.length === 0) {
      toolsNeeded.push({
        name: 'search',
        params: { query: lowerQuery }
      });
    }
    
    return toolsNeeded;
  }

  /**
   * Execute a sequence of tools through the MCP server
   */
  async executeToolSequence(toolsNeeded, query, context) {
    const results = [];
    
    for (const tool of toolsNeeded) {
      console.log(`Executing tool: ${tool.name}`);
      try {
        // Call the MCP server to execute the tool
        const response = await axios.post(`${this.mcpServerUrl}/mcp/execute`, {
          tool: tool.name,
          params: tool.params
        });
        
        results.push({
          tool: tool.name,
          success: true,
          result: response.data
        });
      } catch (error) {
        console.error(`Error executing tool ${tool.name}:`, error.message);
        results.push({
          tool: tool.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Generate a response using the tool results
   * In a real Windsurf app, this would use the model to generate the response
   */
  async generateResponse(query, toolResults, context) {
    // In a real implementation, this would call the Windsurf API to generate a response
    // using the model and the tool results
    
    // For this example, we'll simulate a response based on the tool results
    let responseText = '';
    
    // Check if we have any successful tool results
    const successfulResults = toolResults.filter(r => r.success);
    if (successfulResults.length === 0) {
      return {
        success: false,
        response: 'I was unable to find the information you requested.'
      };
    }
    
    // Process calculator results
    const calculatorResult = toolResults.find(r => r.tool === 'calculator' && r.success);
    if (calculatorResult) {
      responseText += `The calculation result is: ${calculatorResult.result.result}\n\n`;
    }
    
    // Process persona results
    const personaResult = toolResults.find(r => r.tool === 'getPersona' && r.success);
    if (personaResult) {
      if (personaResult.result.persona) {
        const personaName = Object.keys(personaResult.result.persona)[0];
        const personaDesc = personaResult.result.persona[personaName];
        responseText += `About the "${personaName}" persona: ${personaDesc}\n\n`;
      } else if (personaResult.result.personas) {
        responseText += 'Available personas:\n';
        Object.entries(personaResult.result.personas).forEach(([name, desc]) => {
          responseText += `- ${name}: ${desc.substring(0, 50)}...\n`;
        });
        responseText += '\n';
      }
    }
    
    // Process product results
    const productResult = toolResults.find(r => r.tool === 'getProduct' && r.success);
    if (productResult) {
      if (productResult.result.product) {
        const productName = Object.keys(productResult.result.product)[0];
        const productDesc = productResult.result.product[productName];
        responseText += `About ${productName.toUpperCase()}: ${productDesc}\n\n`;
        
        if (productResult.result.details) {
          responseText += `Detailed information:\n${productResult.result.details.substring(0, 200)}...\n\n`;
        }
      } else if (productResult.result.products) {
        responseText += 'IOG Products:\n';
        Object.entries(productResult.result.products).forEach(([name, desc]) => {
          responseText += `- ${name.toUpperCase()}: ${desc.substring(0, 50)}...\n`;
        });
        responseText += '\n';
      }
    }
    
    // Process search results
    const searchResult = toolResults.find(r => r.tool === 'search' && r.success);
    if (searchResult) {
      responseText += `Search results: ${searchResult.result.results.join(', ')}\n\n`;
    }
    
    // Add personalization based on user context if available
    if (context.userPersona) {
      responseText += `This information is tailored for a ${context.userPersona} audience.`;
    }
    
    return {
      success: true,
      response: responseText.trim(),
      toolResults: successfulResults
    };
  }

  // Helper methods to extract parameters from queries
  extractCalculationExpression(query) {
    // Simple regex to extract a mathematical expression
    // In a real app, this would be more sophisticated
    const match = query.match(/[0-9][\s\d\+\-\*\/\(\)]*[0-9]/);
    return match ? match[0] : '42';
  }

  extractPersonaName(query) {
    const personas = ['crypto zero', 'crypto novice', 'crypto savvy', 'crypto literate', 
                     'crypto traders', 'builder', 'dapp developers', 'stakepool operators'];
    
    for (const persona of personas) {
      if (query.toLowerCase().includes(persona)) {
        return persona;
      }
    }
    
    return 'all';
  }

  extractProductName(query) {
    const products = ['realfi', 'lace', 'midnight'];
    
    for (const product of products) {
      if (query.toLowerCase().includes(product)) {
        return product;
      }
    }
    
    return 'all';
  }
}

// Example usage
async function runExample() {
  const app = new WindsurfCryptoEducationApp();
  await app.initialize();
  
  // Example 1: Query about a product
  const response1 = await app.processUserQuery(
    "What is RealFi and how does it work?",
    { userPersona: 'crypto novice' }
  );
  console.log('\nExample 1 Response:');
  console.log(response1.response);
  
  // Example 2: Query involving calculation
  const response2 = await app.processUserQuery(
    "If I stake 1000 ADA for 5 years with a 5% annual return, how much will I have?",
    { userPersona: 'crypto zero' }
  );
  console.log('\nExample 2 Response:');
  console.log(response2.response);
  
  // Example 3: Query about a persona
  const response3 = await app.processUserQuery(
    "What's the difference between a crypto novice and crypto savvy persona?",
    { userPersona: 'builder' }
  );
  console.log('\nExample 3 Response:');
  console.log(response3.response);
  
  // Example 4: Multi-part query using multiple tools
  const response4 = await app.processUserQuery(
    "Tell me about Midnight and which personas would be most interested in privacy features?",
    { userPersona: 'crypto literate' }
  );
  console.log('\nExample 4 Response:');
  console.log(response4.response);
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample().catch(error => {
    console.error('Example execution failed:', error);
  });
}

module.exports = WindsurfCryptoEducationApp;
