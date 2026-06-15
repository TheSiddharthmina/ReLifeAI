import { Router } from 'express';
import { analyzeIntercept, getIntercept, getDashboard } from '../controllers/interceptController';

const router = Router();

router.post('/analyze', analyzeIntercept);
router.get('/dashboard/stats', getDashboard);
router.get('/:productId', getIntercept);

router.get('/health', (_req: any, res: any) => {
  res.json({
    engine: 'Engine 5: Return Intercept Engine',
    version: '5.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
