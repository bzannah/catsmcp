const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

// Read the MCP configuration
const mcpConfig = JSON.parse(fs.readFileSync('./cats_mcp.json', 'utf8'));

const app = express();
app.use(bodyParser.json());

// Base URL for the Fictional Cats API
const baseUrl = mcpConfig.api.baseUrl;

// JSON-RPC error responses
const PARSE_ERROR = { code: -32700, message: 'Parse error' };
const INVALID_REQUEST = { code: -32600, message: 'Invalid Request' };
const METHOD_NOT_FOUND = { code: -32601, message: 'Method not found' };
const INVALID_PARAMS = { code: -32602, message: 'Invalid params' };
const INTERNAL_ERROR = { code: -32603, message: 'Internal error' };

// Handle JSON-RPC requests
app.post('/', async (req, res) => {
  // Check if the request is a valid JSON-RPC request
  if (!req.body.jsonrpc || req.body.jsonrpc !== '2.0' || !req.body.method) {
    return res.json({
      jsonrpc: '2.0',
      error: INVALID_REQUEST,
      id: req.body.id || null
    });
  }

  const { method, params, id } = req.body;

  // Handle tools/list method to return available tools
  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      result: {
        tools: Object.keys(mcpConfig.tools).map(toolName => ({
          name: toolName,
          description: mcpConfig.tools[toolName].description,
          parameters: mcpConfig.tools[toolName].parameters,
          returns: mcpConfig.tools[toolName].returns
        }))
      },
      id
    });
  }

  // Handle get_random_cat method
  if (method === 'get_random_cat') {
    try {
      const endpoint = `${baseUrl}${mcpConfig.api.endpoints.get_random_cat.path}`;
      const response = await axios.get(endpoint);
      
      return res.json({
        jsonrpc: '2.0',
        result: response.data,
        id
      });
    } catch (error) {
      console.error('Error fetching random cat:', error.message);
      return res.json({
        jsonrpc: '2.0',
        error: {
          code: INTERNAL_ERROR.code,
          message: `Error fetching random cat: ${error.message}`
        },
        id
      });
    }
  }

  // Handle get_cats method
  if (method === 'get_cats') {
    // Validate parameters
    if (!params || typeof params.n !== 'number' || params.n < 1) {
      return res.json({
        jsonrpc: '2.0',
        error: INVALID_PARAMS,
        id
      });
    }

    try {
      const endpoint = `${baseUrl}${mcpConfig.api.endpoints.get_cats.path}?n=${params.n}`;
      const response = await axios.get(endpoint);
      
      return res.json({
        jsonrpc: '2.0',
        result: response.data,
        id
      });
    } catch (error) {
      console.error('Error fetching cats:', error.message);
      return res.json({
        jsonrpc: '2.0',
        error: {
          code: INTERNAL_ERROR.code,
          message: `Error fetching cats: ${error.message}`
        },
        id
      });
    }
  }

  // If method is not found
  return res.json({
    jsonrpc: '2.0',
    error: METHOD_NOT_FOUND,
    id
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fictional Cats MCP Server running on port ${PORT}`);
  console.log(`Server information: ${mcpConfig.server.name} v${mcpConfig.server.version}`);
  console.log(`Available tools: ${Object.keys(mcpConfig.tools).join(', ')}`);
});
