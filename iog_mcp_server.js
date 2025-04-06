const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Tool registry - this is where you define the tools available in your MCP
const tools = {
  // Calculator tool
  calculator: async (params) => {
    try {
      const { expression } = params;
      // Safely evaluate the expression
      const result = Function('"use strict";return (' + expression + ')')();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Search tool
  search: async (params) => {
    const { query } = params;
    // In a real implementation, this would connect to a search API
    return { 
      success: true, 
      results: [`Search results for: ${query}`] 
    };
  },
  
  // Data retrieval tool for accessing personas
  getPersona: async (params) => {
    try {
      const { name } = params;
      const personasPath = path.join(__dirname, 'personas.json');
      const data = await fs.readFile(personasPath, 'utf8');
      const personas = JSON.parse(data);
      
      if (name && name.toLowerCase() !== 'all') {
        // Return specific persona
        const persona = Object.entries(personas).find(
          ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        
        if (!persona) {
          return { success: false, error: `Persona '${name}' not found` };
        }
        
        return { success: true, persona: { [persona[0]]: persona[1] } };
      } else {
        // Return all personas
        return { success: true, personas };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Data retrieval tool for accessing products
  getProduct: async (params) => {
    try {
      const { name } = params;
      const productsPath = path.join(__dirname, 'products.json');
      const data = await fs.readFile(productsPath, 'utf8');
      const products = JSON.parse(data);
      
      if (name && name.toLowerCase() !== 'all') {
        // Return specific product
        const product = Object.entries(products).find(
          ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        
        if (!product) {
          return { success: false, error: `Product '${name}' not found` };
        }
        
        // If detailed info is requested, get the markdown file
        if (params.detailed) {
          try {
            const mdPath = path.join(
              __dirname, 
              'IOG Products', 
              `${name.charAt(0).toUpperCase() + name.slice(1)}.md`
            );
            const content = await fs.readFile(mdPath, 'utf8');
            return { 
              success: true, 
              product: { [product[0]]: product[1] },
              details: content 
            };
          } catch (mdError) {
            // Return basic info if markdown not found
            return { success: true, product: { [product[0]]: product[1] } };
          }
        }
        
        return { success: true, product: { [product[0]]: product[1] } };
      } else {
        // Return all products
        return { success: true, products };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// MCP endpoint for tool execution
app.post('/mcp/execute', async (req, res) => {
  try {
    const { tool, params } = req.body;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool name is required' });
    }
    
    if (!tools[tool]) {
      return res.status(404).json({ error: `Tool '${tool}' not found` });
    }
    
    const result = await tools[tool](params || {});
    res.json(result);
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({ error: error.message });
  }
});

// MCP endpoint to get available tools
app.get('/mcp/tools', (req, res) => {
  const toolDefinitions = {
    calculator: {
      name: 'calculator',
      description: 'Performs mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'The mathematical expression to evaluate'
          }
        },
        required: ['expression']
      }
    },
    search: {
      name: 'search',
      description: 'Searches for information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query'
          }
        },
        required: ['query']
      }
    },
    getPersona: {
      name: 'getPersona',
      description: 'Retrieves information about IOG personas',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the persona to retrieve, or "all" for all personas'
          }
        }
      }
    },
    getProduct: {
      name: 'getProduct',
      description: 'Retrieves information about IOG products',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the product to retrieve, or "all" for all products'
          },
          detailed: {
            type: 'boolean',
            description: 'Whether to retrieve detailed information about the product'
          }
        }
      }
    }
  };
  
  res.json({ tools: toolDefinitions });
});

// Start the server
app.listen(PORT, () => {
  console.log(`IOG MCP Server running on http://localhost:${PORT}`);
});
