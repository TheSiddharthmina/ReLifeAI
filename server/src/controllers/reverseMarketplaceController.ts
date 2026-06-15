import { Request, Response } from 'express';
import * as rmService from '../services/reverseMarketplaceService';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const errors = rmService.validateRegisterInput(req.body);
    if (errors.length > 0) { res.status(400).json({ success: false, details: errors }); return; }

    const requirement = await rmService.registerRequirement(req.body);

    const matches = await rmService.findMatches((requirement as any)._id.toString());

    res.status(201).json({
      success: true,
      data: {
        requirementId: (requirement as any)._id,
        status: requirement.status,
        matchesFound: matches.length > 0 ? matches[0].totalMatches : 0,
        topMatch: matches.length > 0 && matches[0].matchedProducts.length > 0 ? matches[0].matchedProducts[0] : null,
        message: matches.length > 0 ? `Found ${matches[0].totalMatches} matching products!` : 'Requirement registered. You will be notified when matches appear.',
      },
    });
  } catch (error: any) {
    console.error('[Engine 8] Register error:', error);
    res.status(500).json({ success: false, error: 'Failed to register requirement' });
  }
}

export async function getMatches(req: Request, res: Response): Promise<void> {
  try {
    const matches = await rmService.findMatches();
    res.status(200).json({
      success: true,
      data: { totalMatches: matches.length, matches },
    });
  } catch (error: any) {
    console.error('[Engine 8] Get matches error:', error);
    res.status(500).json({ success: false, error: 'Failed to get matches' });
  }
}

export async function notify(req: Request, res: Response): Promise<void> {
  try {
    const { matchId } = req.body;
    if (!matchId) { res.status(400).json({ success: false, error: 'matchId is required' }); return; }

    const result = await rmService.sendNotification(matchId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Engine 8] Notify error:', error);
    res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const stats = await rmService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Engine 8] Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard' });
  }
}
