import { ImpactMetrics, IImpactMetrics, ILifecycleDecision } from '../models';

export async function recordDecisionImpact(decision: ILifecycleDecision, category: string): Promise<void> {
  let metrics = await ImpactMetrics.findOne();
  if (!metrics) {
    metrics = await ImpactMetrics.create({ totalProductsProcessed: 0, totalCarbonSaved: 0, totalWasteDiverted: 0, totalRecoveredValue: 0, categoryBreakdown: [], lifecycleBreakdown: [] });
  }
  metrics.totalProductsProcessed += 1;
  metrics.totalCarbonSaved += decision.carbonSaved;
  metrics.totalWasteDiverted += decision.wasteDiverted;
  metrics.totalRecoveredValue += decision.estimatedRecoveredValue;
  const cat = metrics.categoryBreakdown.find((c: any) => c.category === category);
  if (cat) { cat.count += 1; } else { metrics.categoryBreakdown.push({ category, count: 1 }); }
  const lc = metrics.lifecycleBreakdown.find((l: any) => l.decision === decision.decision);
  if (lc) { lc.count += 1; lc.totalValue += decision.estimatedRecoveredValue; } else { metrics.lifecycleBreakdown.push({ decision: decision.decision, count: 1, totalValue: decision.estimatedRecoveredValue }); }
  metrics.lastUpdated = new Date();
  await metrics.save();
}

export async function getDashboardMetrics(): Promise<IImpactMetrics | null> {
  let metrics = await ImpactMetrics.findOne();
  if (!metrics) {
    metrics = await ImpactMetrics.create({ totalProductsProcessed: 0, totalCarbonSaved: 0, totalWasteDiverted: 0, totalRecoveredValue: 0, categoryBreakdown: [], lifecycleBreakdown: [] });
  }
  return metrics;
}
