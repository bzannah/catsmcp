// test_server.js
const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Helper function to make JSON-RPC requests
async function makeRpcRequest(method, params = {}) {
  try {
    const response = await axios.post(SERVER_URL, {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    });
    return response.data;
  } catch (error) {
    console.error(`Error making RPC request to ${method}:`, error.message);
    throw error;
  }
}

// Test the tools/list method
async function testToolsList() {
  console.log('\n🧪 Testing tools/list method...');
  try {
    const result = await makeRpcRequest('tools/list');
    
    if (!result.result || !result.result.tools) {
      console.error('❌ tools/list did not return expected structure');
      return false;
    }
    
    const tools = result.result.tools;
    if (!Array.isArray(tools) || tools.length !== 2) {
      console.error(`❌ Expected 2 tools, got ${tools.length}`);
      return false;
    }
    
    const toolNames = tools.map(tool => tool.name);
    if (!toolNames.includes('get_random_cat') || !toolNames.includes('get_cats')) {
      console.error(`❌ Missing expected tools. Found: ${toolNames.join(', ')}`);
      return false;
    }
    
    console.log('✅ tools/list test passed');
    return true;
  } catch (error) {
    console.error('❌ tools/list test failed:', error.message);
    return false;
  }
}

// Test the get_random_cat method
async function testGetRandomCat() {
  console.log('\n🧪 Testing get_random_cat method...');
  try {
    const result = await makeRpcRequest('get_random_cat');
    
    if (result.error) {
      console.error(`❌ get_random_cat returned error: ${result.error.message}`);
      return false;
    }
    
    const cat = result.result;
    const requiredFields = ['uuid', 'name', 'description', 'image', 'date_created'];
    const missingFields = requiredFields.filter(field => !cat.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      console.error(`❌ Response missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    console.log('✅ get_random_cat test passed');
    console.log('📋 Sample cat:', cat);
    return true;
  } catch (error) {
    console.error('❌ get_random_cat test failed:', error.message);
    return false;
  }
}

// Test the get_cats method
async function testGetCats() {
  console.log('\n🧪 Testing get_cats method...');
  try {
    const n = 3;
    const result = await makeRpcRequest('get_cats', { n });
    
    if (result.error) {
      console.error(`❌ get_cats returned error: ${result.error.message}`);
      return false;
    }
    
    const cats = result.result;
    if (!Array.isArray(cats)) {
      console.error('❌ Response is not an array as expected');
      return false;
    }
    
    if (cats.length !== n) {
      console.error(`❌ Expected ${n} cats, but got ${cats.length}`);
      return false;
    }
    
    const requiredFields = ['uuid', 'name', 'description', 'image', 'date_created'];
    let allValid = true;
    
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i];
      const missingFields = requiredFields.filter(field => !cat.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.error(`❌ Cat ${i+1} missing required fields: ${missingFields.join(', ')}`);
        allValid = false;
        break;
      }
    }
    
    if (!allValid) {
      return false;
    }
    
    console.log('✅ get_cats test passed');
    console.log(`📋 Retrieved ${cats.length} cats successfully`);
    return true;
  } catch (error) {
    console.error('❌ get_cats test failed:', error.message);
    return false;
  }
}

// Test invalid parameters
async function testInvalidParams() {
  console.log('\n🧪 Testing invalid parameters...');
  try {
    const result = await makeRpcRequest('get_cats', { n: -1 });
    
    if (!result.error || result.error.code !== -32602) {
      console.error('❌ Expected invalid params error, but got:', result);
      return false;
    }
    
    console.log('✅ Invalid parameters test passed');
    return true;
  } catch (error) {
    console.error('❌ Invalid parameters test failed:', error.message);
    return false;
  }
}

// Test invalid method
async function testInvalidMethod() {
  console.log('\n🧪 Testing invalid method...');
  try {
    const result = await makeRpcRequest('non_existent_method');
    
    if (!result.error || result.error.code !== -32601) {
      console.error('❌ Expected method not found error, but got:', result);
      return false;
    }
    
    console.log('✅ Invalid method test passed');
    return true;
  } catch (error) {
    console.error('❌ Invalid method test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Cats MCP Server tests...');
  
  // Test health endpoint
  try {
    const healthResponse = await axios.get(`${SERVER_URL}/health`);
    console.log(`\n🏥 Health check: ${healthResponse.status === 200 ? '✅ OK' : '❌ Failed'}`);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.log('Make sure the server is running on http://localhost:3000');
    return;
  }
  
  // Run all JSON-RPC tests
  const tests = [
    testToolsList,
    testGetRandomCat,
    testGetCats,
    testInvalidParams,
    testInvalidMethod
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const passed = await test();
    if (passed) passedTests++;
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! The server is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests();
