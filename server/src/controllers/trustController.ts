import { Request, Response } from 'express';
import * as trustService from '../services/trustService';

export async function chatWithProduct(req: Request, res: Response): Promise<void> {
  try {
    const errors = trustService.validateChatInput(req.body);
    if (errors.length > 0) { res.status(400).json({ success: false, details: errors }); return; }

    const result = await trustService.chat(req.body);

    res.status(200).json({
      success: true,
      data: {
        productId: req.body.productId,
        question: req.body.question,
        answer: result.response,
        trustScore: result.trustScore,
        sources: result.sources,
      },
    });
  } catch (error: any) {
    console.error('[Engine 7] Chat error:', error);
    res.status(500).json({ success: false, error: 'Chat failed' });
  }
}

export async function getTrustScore(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    let score = await trustService.getTrustScore(String(productId));
    if (!score) {
      // Generate on-the-fly
      score = await trustService.generateTrustScore({ productId: String(productId), category: 'electronics', conditionScore: 75 });
    }
    res.status(200).json({ success: true, data: score });
  } catch (error: any) {
    console.error('[Engine 7] Trust score error:', error);
    res.status(500).json({ success: false, error: 'Failed to get trust score' });
  }
}

export async function generateScore(req: Request, res: Response): Promise<void> {
  try {
    const errors = trustService.validateScoreInput(req.body);
    if (errors.length > 0) { res.status(400).json({ success: false, details: errors }); return; }

    const result = await trustService.generateTrustScore(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Engine 7] Generate score error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate trust score' });
  }
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const stats = await trustService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Engine 7] Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard' });
  }
}
