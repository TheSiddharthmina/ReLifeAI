import { Router } from 'express';
import { chatWithProduct, getTrustScore, generateScore, getDashboard } from '../controllers/trustController';

const router = Router();

router.post('/chat', chatWithProduct);
router.post('/generate', generateScore);
router.get('/dashboard/stats', getDashboard);
router.get('/:productId', getTrustScore);

router.get('/health', (_req: any, res: any) => {
  res.json({ engine: 'Engine 7: AI Trust Assistant', version: '7.0.0', status: 'operational', features: ['RAG Chat', 'Trust Score', 'Failure Prediction', 'Remaining Life'], timestamp: new Date().toISOString() });
});

export default router;
