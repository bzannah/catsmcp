# catsmcp

## Overview

The Fictional Cats MCP (Model Context Protocol) provides AI models with the ability to access and retrieve fictional cat data. This MCP allows models to either get a random cat or retrieve a specified number of cats from the Fictional Cats API.

## Installation

To use this MCP in your application, you'll need to integrate it with an MCP-compatible client. The MCP is defined in a JSON file that follows the Model Context Protocol specification.

## Features

This MCP provides two main functions:

1. **get_random_cat**: Retrieves a single random cat
2. **get_cats**: Retrieves a specified number of cats

## Usage Examples

### Using get_random_cat

This function retrieves a single random cat from the database. It doesn't require any parameters.

```javascript
// Example client code
const result = await client.call('get_random_cat');
console.log(result);
```

Example response:
```json
{
  "uuid": "f60dd86b-6061-448a-9a25-16774f5acdea",
  "name": "Zoey",
  "description": "A sock thief with a hidden collection under the bed. Enjoys playing with toys. Fur is fluffy and siamese.",
  "image": "https://i.ibb.co/PZFbJ7J2/5.png",
  "date_created": "2024-10-11T23:52:07+00:00"
}
```

### Using get_cats

This function retrieves multiple cats from the database. It requires a parameter `n` to specify how many cats to retrieve.

```javascript
// Example client code
const result = await client.call('get_cats', { n: 3 });
console.log(result);
```

Example response:
```json
[
  {
    "uuid": "835a97e8-0238-4705-81a0-ef5cb8edb88f",
    "name": "Winston",
    "description": "A social butterfly who greets all visitors with a friendly meow. Enjoys watching birds. Fur is smooth and tabby.",
    "image": "https://i.ibb.co/4n13WPTM/10.png",
    "date_created": "2024-10-19T23:52:07+00:00"
  },
  {
    "uuid": "c4b781d0-1e52-47dd-b72e-bbf9b5220147",
    "name": "Whiskers",
    "description": "A vertical explorer who scales the tallest furniture. Has gentle gold eyes. Enjoys napping in sunbeams.",
    "image": "https://i.ibb.co/Z12FSs1g/1.png",
    "date_created": "2024-09-17T23:52:07+00:00"
  },
  {
    "uuid": "fde8f5af-90f8-4f23-8c14-60cc5d7b5a9a",
    "name": "Winston",
    "description": "A vocal feline who talks all day long about everything and nothing. Enjoys watching birds. Personality is friendly.",
    "image": "https://i.ibb.co/Z12FSs1g/1.png",
    "date_created": "2024-05-24T23:52:07+00:00"
  }
]
```

## Function Reference

### get_random_cat

Retrieves a random cat from the Fictional Cats API.

**Parameters**: None

**Returns**: A cat object with the following properties:
- `uuid` (string): Unique identifier for the cat
- `name` (string): The cat's name
- `description` (string): Text description of the cat's characteristics and personality
- `image` (string): URL to the cat's image
- `date_created` (string): Timestamp when the cat was created in ISO 8601 format

### get_cats

Retrieves a specified number of cats from the Fictional Cats API.

**Parameters**:
- `n` (integer, required): The number of cats to retrieve

**Returns**: An array of cat objects, each with the following properties:
- `uuid` (string): Unique identifier for the cat
- `name` (string): The cat's name
- `description` (string): Text description of the cat's characteristics and personality
- `image` (string): URL to the cat's image
- `date_created` (string): Timestamp when the cat was created in ISO 8601 format

## Error Handling

The MCP handles the following error scenarios:

1. **API Connection Errors**: If the Fictional Cats API is unavailable, the MCP will return an appropriate error message.
2. **Invalid Parameters**: If invalid parameters are provided (e.g., a negative number for `n`), the MCP will return an error.

## Implementation Details

This MCP is implemented as a JSON file following the Model Context Protocol specification. It defines the server information, tool definitions, and API endpoint configurations.

The MCP connects to the Fictional Cats API at:
- Base URL: `https://fictionalcats.netlify.app/.netlify/functions/api`
- Random cat endpoint: `/cats/random`
- Multiple cats endpoint: `/cats?n={n}`

## Publishing

This MCP can be published to MCP registries like smithery.ai to make it available to AI models and applications that support the Model Context Protocol.
