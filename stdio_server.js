// stdio_server.js
const fs = require('fs');
const readline = require('readline');

// Read the MCP configuration
const mcpConfig = JSON.parse(fs.readFileSync('./cats_mcp.json', 'utf8'));

// Base URL for the Fictional Cats API
const baseUrl = mcpConfig.api.baseUrl;
const axios = require('axios');

// JSON-RPC error responses
const PARSE_ERROR = { code: -32700, message: 'Parse error' };
const INVALID_REQUEST = { code: -32600, message: 'Invalid Request' };
const METHOD_NOT_FOUND = { code: -32601, message: 'Method not found' };
const INVALID_PARAMS = { code: -32602, message: 'Invalid params' };
const INTERNAL_ERROR = { code: -32603, message: 'Internal error' };

// Create readline interface for STDIO
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Log to stderr for debugging (won't interfere with STDIO protocol)
const log = (message) => {
  console.error(`[LOG] ${message}`);
};

log('Fictional Cats MCP STDIO Server starting...');
log(`Server information: ${mcpConfig.server.name} v${mcpConfig.server.version}`);
log(`Available tools: ${Object.keys(mcpConfig.tools).join(', ')}`);

// Process each line from stdin as a JSON-RPC request
rl.on('line', async (line) => {
  log(`Received request: ${line}`);
  
  let request;
  let response;
  
  try {
    request = JSON.parse(line);
    
    // Check if the request is a valid JSON-RPC request
    if (!request.jsonrpc || request.jsonrpc !== '2.0' || !request.method) {
      response = {
        jsonrpc: '2.0',
        error: INVALID_REQUEST,
        id: request.id || null
      };
    } else {
      const { method, params, id } = request;
      
      // Handle tools/list method to return available tools
      if (method === 'tools/list') {
        response = {
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
        };
      }
      // Handle get_random_cat method
      else if (method === 'get_random_cat') {
        try {
          const endpoint = `${baseUrl}${mcpConfig.api.endpoints.get_random_cat.path}`;
          log(`Fetching from endpoint: ${endpoint}`);
          const apiResponse = await axios.get(endpoint);
          
          response = {
            jsonrpc: '2.0',
            result: apiResponse.data,
            id
          };
        } catch (error) {
          log(`Error fetching random cat: ${error.message}`);
          response = {
            jsonrpc: '2.0',
            error: {
              code: INTERNAL_ERROR.code,
              message: `Error fetching random cat: ${error.message}`
            },
            id
          };
        }
      }
      // Handle get_cats method
      else if (method === 'get_cats') {
        // Validate parameters
        if (!params || typeof params.n !== 'number' || params.n < 1) {
          response = {
            jsonrpc: '2.0',
            error: INVALID_PARAMS,
            id
          };
        } else {
          try {
            const endpoint = `${baseUrl}${mcpConfig.api.endpoints.get_cats.path}?n=${params.n}`;
            log(`Fetching from endpoint: ${endpoint}`);
            const apiResponse = await axios.get(endpoint);
            
            response = {
              jsonrpc: '2.0',
              result: apiResponse.data,
              id
            };
          } catch (error) {
            log(`Error fetching cats: ${error.message}`);
            response = {
              jsonrpc: '2.0',
              error: {
                code: INTERNAL_ERROR.code,
                message: `Error fetching cats: ${error.message}`
              },
              id
            };
          }
        }
      }
      // If method is not found
      else {
        response = {
          jsonrpc: '2.0',
          error: METHOD_NOT_FOUND,
          id
        };
      }
    }
  } catch (error) {
    log(`Parse error: ${error.message}`);
    response = {
      jsonrpc: '2.0',
      error: PARSE_ERROR,
      id: null
    };
  }
  
  // Send the response
  console.log(JSON.stringify(response));
});

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  rl.close();
  process.exit(0);
});

log('STDIO server ready to process requests');
