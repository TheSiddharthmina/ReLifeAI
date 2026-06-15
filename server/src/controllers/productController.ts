import { Request, Response } from 'express';
import { Product } from '../models';
import { ProductPassport } from '../models';
import { LifecycleDecision } from '../models';
import { visionService, passportService, lifecycleService, impactService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/errors';
import { EnginePipeline } from '../services/enginePipeline';

export async function analyzeProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, category, description, condition, returnReason, brand, originalPrice, weight } = req.body;

    console.log('[Engine 1] Received analyze-product request:', { name, category, condition });


    if (!name || !category || !condition || !returnReason) {
      throw new ValidationError('Missing required fields: name, category, condition, returnReason');
    }

const files = ((req as any).files || []) as Express.Multer.File[];
    const imageUrls = files && files.length > 0
      ? files.map((f: Express.Multer.File) => f.originalname)
      : [];

    console.log('[Engine 1] Images received:', imageUrls.length);

    const product = await Product.create({
      name,
      category,
      description: description || '',
      condition,
      returnReason,
      imageUrls,
      brand: brand || undefined,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
    });

    await EnginePipeline.processProduct(product);
   console.log('[Engine 1] Product created:', product._id);



console.log('[Engine 1] Uploaded files:', files.length);

const visionAnalysis = await visionService.analyzeProduct(
  product,
  files as any
);

console.log('[Engine 1] Vision analysis complete:', {
  conditionScore: visionAnalysis.conditionScore,
  defects: visionAnalysis.defects.length,
});

    const passport = await passportService.generatePassport(product, visionAnalysis);

    console.log('[Engine 1] Passport generated:', passport._id);

    sendSuccess(res, { product, passport }, 201);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      sendError(res, error.message, error.statusCode);
    } else {
      console.error('[Engine 1] Error in analyzeProduct:', error);
      sendError(res, 'Failed to analyze product', 500);
    }
  }
}


export async function generateDecision(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.body;

    if (!productId) {
      throw new ValidationError('Missing required field: productId');
    }


    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const passport = await ProductPassport.findOne({ productId });
    if (!passport) {
      throw new NotFoundError('Product Passport - please analyze the product first');
    }

   
    const existingDecision = await LifecycleDecision.findOne({ productId });
    if (existingDecision) {
      sendSuccess(res, { decision: existingDecision });
      return;
    }

    
    const decision = await lifecycleService.generateDecision(product, passport);

   
    await impactService.recordDecisionImpact(decision, product.category);

    sendSuccess(res, { decision }, 201);
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      sendError(res, error.message, error.statusCode);
    } else {
      console.error('[Engine 2] Error in generateDecision:', error);
      sendError(res, 'Failed to generate decision', 500);
    }
  }
}


export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const passport = await ProductPassport.findOne({ productId: id });
    const decision = await LifecycleDecision.findOne({ productId: id });

    sendSuccess(res, {
      product,
      passport: passport || null,
      decision: decision || null,
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(res, error.message, error.statusCode);
    } else {
      console.error('Error in getProduct:', error);
      sendError(res, 'Failed to fetch product', 500);
    }
  }
}

export async function listProducts(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = parseInt(req.query.skip as string) || 0;

    const products = await Product.find()
    
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();

    sendSuccess(res, { products, total, limit, skip });
  } catch (error: any) {
    console.error('Error in listProducts:', error);
    sendError(res, 'Failed to fetch products', 500);
  }
}
