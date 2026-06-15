import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { config } from './config';

import returnRiskRoutes from './routes/returnRiskRoutes';

import interceptRoutes from './routes/interceptRoutes';

import buyerMatchRoutes from './routes/buyerMatchRoutes';

import trustRoutes from './routes/trustRoutes';

import reverseMarketplaceRoutes from './routes/reverseMarketplaceRoutes';

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req: any, _res: any, next: any) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

app.use('/api', apiRouter);

app.use('/api/return-risk', returnRiskRoutes);

app.use('/api/intercept', interceptRoutes);

app.use('/api/buyer-match', buyerMatchRoutes);

app.use('/api/trust', trustRoutes);

app.use('/api/reverse-marketplace', reverseMarketplaceRoutes);

app.get('/api/engines', (_req: any, res: any) => {
  res.json({
    service: 'ReLife AI',
    engines: {
      engine1: { name: 'Product Passport', path: '/api', status: 'active' },
      engine4: { name: 'Return Risk Prediction', path: '/api/return-risk', status: 'active' },
      engine5: { name: 'Return Intercept', path: '/api/intercept', status: 'active' },
      engine6: { name: 'Buyer Discovery', path: '/api/buyer-match', status: 'active' },
      engine7: { name: 'AI Trust Assistant', path: '/api/trust', status: 'active' },
      engine8: { name: 'Reverse Marketplace', path: '/api/reverse-marketplace', status: 'active' },
    },
  });
});

app.use((_req: any, res: any) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Internal server error' });
});

export default app;
