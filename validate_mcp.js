// validate_mcp.js
const fs = require('fs');
const axios = require('axios');

// Read the MCP JSON file
const mcpData = JSON.parse(fs.readFileSync('./cats_mcp.json', 'utf8'));

async function validateMCP() {
  console.log('Validating Cats MCP functionality...');
  
  // Test get_random_cat
  console.log('\nTesting get_random_cat:');
  try {
    const randomCatEndpoint = `${mcpData.api.baseUrl}${mcpData.api.endpoints.get_random_cat.path}`;
    console.log(`Calling endpoint: ${randomCatEndpoint}`);
    
    const randomCatResponse = await axios.get(randomCatEndpoint);
    const randomCat = randomCatResponse.data;
    
    console.log('Random cat retrieved successfully:');
    console.log(JSON.stringify(randomCat, null, 2));
    
    // Validate response structure against MCP schema
    const requiredFields = mcpData.tools.get_random_cat.returns.required;
    const missingFields = requiredFields.filter(field => !randomCat.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      console.error(`Error: Response missing required fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ Response structure matches MCP schema');
    }
  } catch (error) {
    console.error('Error testing get_random_cat:', error.message);
  }
  
  // Test get_cats
  console.log('\nTesting get_cats:');
  try {
    const n = 3; // Number of cats to retrieve
    const catsEndpoint = `${mcpData.api.baseUrl}${mcpData.api.endpoints.get_cats.path}?n=${n}`;
    console.log(`Calling endpoint: ${catsEndpoint}`);
    
    const catsResponse = await axios.get(catsEndpoint);
    const cats = catsResponse.data;
    
    console.log(`${cats.length} cats retrieved successfully.`);
    
    // Validate response structure against MCP schema
    if (!Array.isArray(cats)) {
      console.error('Error: Response is not an array as expected');
    } else if (cats.length !== n) {
      console.error(`Error: Expected ${n} cats, but got ${cats.length}`);
    } else {
      const requiredFields = Object.keys(mcpData.tools.get_cats.returns.items.properties);
      let allValid = true;
      
      for (let i = 0; i < cats.length; i++) {
        const cat = cats[i];
        const missingFields = requiredFields.filter(field => !cat.hasOwnProperty(field));
        
        if (missingFields.length > 0) {
          console.error(`Error in cat ${i+1}: Missing required fields: ${missingFields.join(', ')}`);
          allValid = false;
          break;
        }
      }
      
      if (allValid) {
        console.log('✅ Response structure matches MCP schema');
      }
    }
  } catch (error) {
    console.error('Error testing get_cats:', error.message);
  }
  
  console.log('\nMCP validation complete!');
}

validateMCP();
