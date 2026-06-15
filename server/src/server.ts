import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import apiRouter from './routes/api';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.use((_req: any, res: any) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Internal server error' });
});

async function start() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`ReLife AI Server running on port ${PORT}`);
      console.log('AWS Vision Pipeline: S3 → Rekognition → Bedrock');
    });
  } catch (error) {
    console.error('Failed to connect DB:', error);
    process.exit(1);
  }
}
start();
