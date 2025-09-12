import app from '../index.js';

// Create a handler for Vercel
export default async function handler(request, response) {
  return new Promise((resolve) => {
    // Set CORS headers for preflight requests
    if (request.method === 'OPTIONS') {
      response.status(200)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        .end();
      return resolve();
    }

    // Pass the request and response to the Express app
    app(request, response, () => {
      // If Express didn't handle the request, return 404
      response.status(404).json({ error: 'Not found' });
      resolve();
    });
  });
}

// Enable streaming for large responses
export const config = {
  api: {
    bodyParser: false,
  },
};