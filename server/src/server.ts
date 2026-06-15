import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { config } from './config';

async function start() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`ReLife AI Server running on http://localhost:${config.port}`);
    console.log('Core Platform: Product Passport + Lifecycle Decision + Impact Dashboard');
    console.log('AI Engines: Return Risk, Intercept, Buyer Discovery, Trust Assistant, Reverse Marketplace');
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
