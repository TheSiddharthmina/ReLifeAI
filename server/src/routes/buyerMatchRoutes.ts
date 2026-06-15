import { Router } from 'express';
import { matchBuyers, getTopBuyers, getDashboard } from '../controllers/buyerMatchController';

const router = Router();

router.post('/product/:id', (req, res) => {
  req.body.productId = req.params.id;
  matchBuyers(req, res);
});
router.get('/top-buyers/:id', getTopBuyers);
router.get('/dashboard/stats', getDashboard);

router.get('/health', (_req: any, res: any) => {
  res.json({ engine: 'Engine 6: Buyer Discovery & Retention', version: '6.0.0', status: 'operational', timestamp: new Date().toISOString() });
});

export default router;
