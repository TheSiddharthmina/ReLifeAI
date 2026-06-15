import { Request, Response } from 'express';
import * as buyerMatchService from '../services/buyerMatchService';

export async function matchBuyers(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body;
    const errors = buyerMatchService.validateInput(input);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }

    const result = await buyerMatchService.matchBuyersToProduct(input);

    res.status(201).json({
      success: true,
      data: {
        productId: result.productId,
        topBuyers: result.topBuyers,
        matchQuality: result.matchQuality,
        retentionPrediction: result.retentionPrediction,
        totalBuyersEvaluated: result.totalBuyersEvaluated,
        avgMatchScore: result.avgMatchScore,
        bestMatchScore: result.bestMatchScore,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('[Engine 6] Error in matchBuyers:', error);
    res.status(500).json({ success: false, error: 'Failed to match buyers' });
  }
}

export async function getTopBuyers(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await buyerMatchService.getTopBuyers(String(id));
    if (!result) {
      res.status(404).json({ success: false, error: 'No buyer match found for this product' });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Engine 6] Error in getTopBuyers:', error);
    res.status(500).json({ success: false, error: 'Failed to get top buyers' });
  }
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const stats = await buyerMatchService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Engine 6] Error in getDashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard' });
  }
}
