import { Router } from 'express';
import { register, getMatches, notify, getDashboard } from '../controllers/reverseMarketplaceController';

const router = Router();

router.post('/register', register);
router.get('/matches', getMatches);
router.post('/notify', notify);
router.get('/dashboard/stats', getDashboard);

router.get('/health', (_req: any, res: any) => {
  res.json({ engine: 'Engine 8: Reverse Marketplace', version: '8.0.0', status: 'operational', timestamp: new Date().toISOString() });
});

export default router;
