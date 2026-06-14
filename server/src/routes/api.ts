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

// Product Analysis (with image upload)
router.post('/analyze-product', upload.array('images', 5), analyzeProduct);

// Lifecycle Decision
router.post('/generate-decision', generateDecision);

// Product Data
router.get('/products', listProducts);
router.get('/product/:id', getProduct);

// Dashboard
router.get('/dashboard', getDashboard);

// Health check
router.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', service: 'relife-ai', timestamp: new Date().toISOString() });
});

export default router;
