import { Request, Response } from 'express';
import { impactService } from '../services';
import { sendSuccess, sendError } from '../utils/response';

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await impactService.getDashboardMetrics();
    sendSuccess(res, {
      totalProductsProcessed: metrics?.totalProductsProcessed || 0,
      totalRecoveredValue: metrics?.totalRecoveredValue || 0,
      totalCarbonSaved: metrics?.totalCarbonSaved || 0,
      totalWasteDiverted: metrics?.totalWasteDiverted || 0,
      categoryBreakdown: metrics?.categoryBreakdown || [],
      lifecycleBreakdown: metrics?.lifecycleBreakdown || [],
    });
  } catch (error: any) { console.error('Error in getDashboard:', error); sendError(res, 'Failed to fetch dashboard metrics', 500); }
}
