import { Request, Response } from 'express';
import * as interceptService from '../services/interceptService';

/**
 * POST /api/intercept/analyze
 */
export async function analyzeIntercept(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body;

    const errors = interceptService.validateInput(input);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }

    const result = await interceptService.analyzeIntercept(input);

    res.status(201).json({
      success: true,
      data: {
        productId: result.productId,
        interceptRecommended: result.interceptRecommended,
        demandScore: result.demandScore,
        interceptConfidence: result.interceptConfidence,
        topBuyers: result.topBuyers,
        costSavings: result.costSavings,
        reasoning: result.reasoning,
        interceptStatus: result.interceptStatus,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('[Engine 5] Error in analyzeIntercept:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze intercept opportunity' });
  }
}

/**
 * GET /api/intercept/:productId
 */
export async function getIntercept(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const result = await interceptService.getInterceptByProductId(String(productId));

    if (!result) {
      res.status(404).json({ success: false, error: 'No intercept analysis found for this product' });
      return;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Engine 5] Error in getIntercept:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve intercept data' });
  }
}

/**
 * GET /api/intercept/dashboard/stats
 */
export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const stats = await interceptService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Engine 5] Error in getDashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard stats' });
  }
}
