import { createApp } from './app.js';
import config from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`  MedSathi API Server (Phase 1 Foundation)    `);
  console.log(`  Status  : Active                             `);
  console.log(`  Port    : ${config.port}                     `);
  console.log(`  Health  : http://localhost:${config.port}/api/health `);
  console.log(`===============================================`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down MedSathi API Server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
