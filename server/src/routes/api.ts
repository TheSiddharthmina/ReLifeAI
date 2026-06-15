import { Router } from 'express';
import multer from 'multer';
import {
  analyzeProduct,
  generateDecision,
  getProduct,
  listProducts,
} from '../controllers/productController';
import { getDashboard } from '../controllers/dashboardController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

const router = Router();

router.post('/analyze-product', upload.array('images', 5), analyzeProduct);


router.post('/generate-decision', generateDecision);


router.get('/products', listProducts);
router.get('/product/:id', getProduct);


router.get('/dashboard', getDashboard);


router.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', service: 'relife-ai', timestamp: new Date().toISOString() });
});

export default router;

router.get('/analytics', async (_req, res) => {
  res.json({
    success: true,
    data: {
      productsAnalyzed: 4,
      productsResold: 2,
      productsRefurbished: 2,
      valueRecovered: 21000,
      carbonSaved: 6,
      warehouseSaved: 4448,
      marketplaceRevenue: 6800
    }
  });
});