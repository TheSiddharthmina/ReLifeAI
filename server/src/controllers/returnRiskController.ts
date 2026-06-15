import { Request, Response } from 'express';
import * as returnRiskService from '../services/returnRiskService';

/**
 * POST /api/return-risk/predict
 */
export async function predictReturnRisk(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body;

    // Validate
    const errors = returnRiskService.validateInput(input);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }

    // Run prediction
    const prediction = await returnRiskService.predictReturnRisk(input);

    res.status(201).json({
      success: true,
      data: {
        productId: prediction.productId,
        returnProbability: prediction.returnProbability,
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence,
        riskFactors: prediction.riskFactors,
        mitigationSuggestions: prediction.mitigationSuggestions,
        modelResults: prediction.modelResults.map((m) => ({
          modelName: m.modelName,
          probability: m.probability,
          confidence: m.confidence,
        })),
        selectedModel: prediction.selectedModel,
        metadata: prediction.metadata,
      },
    });
  } catch (error: any) {
    console.error('[Engine 4] Error in predictReturnRisk:', error);
    res.status(500).json({ success: false, error: 'Failed to predict return risk' });
  }
}

/**
 * GET /api/return-risk/:productId
 */
export async function getPrediction(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const prediction = await returnRiskService.getPredictionByProductId(String(productId));

    if (!prediction) {
      res.status(404).json({ success: false, error: 'No prediction found for this product' });
      return;
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error: any) {
    console.error('[Engine 4] Error in getPrediction:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve prediction' });
  }
}

/**
 * GET /api/return-risk/dashboard/stats
 */
export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const stats = await returnRiskService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Engine 4] Error in getDashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard stats' });
  }
}

/**
 * GET /api/return-risk/high-risk
 */
export async function getHighRisk(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const products = await returnRiskService.getHighRiskProducts(limit);
    res.status(200).json({ success: true, data: { count: products.length, products } });
  } catch (error: any) {
    console.error('[Engine 4] Error in getHighRisk:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve high risk products' });
  }
}

/**
 * POST /api/return-risk/retrain
 */
export async function retrainModels(req: Request, res: Response): Promise<void> {
  try {
    console.log('[Engine 4] Starting model retraining...');
    const result = await returnRiskService.retrainModels();
    console.log('[Engine 4] Retraining complete:', result.bestModel);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Engine 4] Error in retrainModels:', error);
    res.status(500).json({ success: false, error: 'Failed to retrain models' });
  }
}
