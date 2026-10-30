import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = process.env.PORT || 5000;

try {
  await connectDatabase();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`EventSphere API listening on port ${port}`);
  });

  async function shutDown(signal) {
    console.log(`${signal} received. Closing API and MongoDB connection...`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutDown('SIGINT'));
  process.on('SIGTERM', () => shutDown('SIGTERM'));
} catch (error) {
  console.error(`EventSphere could not start: ${error.message}`);
  process.exit(1);
}
