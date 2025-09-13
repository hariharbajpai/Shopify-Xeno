#!/usr/bin/env node

/**
 * Utility script to fetch data from Shopify and store it in Prisma
 * This script uses the existing services to perform the data ingestion
 */

import { ingestDirectAll, ingestDirectProducts, ingestDirectCustomers, ingestDirectOrders } from '../services/ingest.service.js';
import { env } from '../utils/env.js';

// Check if required environment variables are set
function validateEnvironment() {
  const requiredVars = ['DEV_SHOP_DOMAIN', 'DEV_ADMIN_TOKEN'];
  const missing = requiredVars.filter(varName => !env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
}

// Main function to run the ingestion
async function runIngestion(type = 'all') {
  console.log(`Starting Shopify data ingestion for ${env.DEV_SHOP_DOMAIN}...`);
  
  try {
    let result;
    
    switch (type) {
      case 'products':
        result = await ingestDirectProducts();
        console.log(`Successfully ingested ${result.products} products`);
        break;
        
      case 'customers':
        result = await ingestDirectCustomers();
        console.log(`Successfully ingested ${result.customers} customers`);
        break;
        
      case 'orders':
        result = await ingestDirectOrders();
        console.log(`Successfully ingested ${result.orders} orders`);
        break;
        
      case 'all':
      default:
        result = await ingestDirectAll();
        console.log(`Successfully ingested:
          - ${result.products} products
          - ${result.customers} customers
          - ${result.orders} orders
        `);
        break;
    }
    
    console.log('Ingestion completed successfully!');
    return result;
  } catch (error) {
    console.error('Ingestion failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// CLI argument parsing
async function main() {
  validateEnvironment();
  
  const args = process.argv.slice(2);
  const type = args[0] || 'all';
  
  if (!['all', 'products', 'customers', 'orders'].includes(type)) {
    console.error('Invalid argument. Usage: node shopify-ingest.js [all|products|customers|orders]');
    process.exit(1);
  }
  
  await runIngestion(type);
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runIngestion };