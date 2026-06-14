import { Types } from 'mongoose';
import { LifecycleDecision, ILifecycleDecision, LifecycleAction, IProduct, IProductPassport } from '../models';

interface DecisionFactors {
  decision: LifecycleAction;
  confidence: number;
  reasoning: string[];
  estimatedRecoveredValue: number;
  carbonSaved: number;
  wasteDiverted: number;
  recommendedMarket: string;
}

const MARKETS: Record<LifecycleAction, string> = {
  resell: 'Amazon Renewed',
  refurbish: 'Certified Refurbishment Partner',
  donate: 'Goodwill',
  recycle: 'Certified E-Waste Recycler',
  compost: 'Industrial Composting Facility',
};

function evalResell(p: IProduct, pp: IProductPassport): DecisionFactors | null {
  if (pp.conditionScore < 60 || pp.resalePotential < 50) return null;
  const r: string[] = [];
  let c = 0.5;
  if (pp.conditionScore >= 80) { c += 0.2; r.push('Product is in excellent condition with minimal wear'); }
  else { c += 0.1; r.push('Product is in good condition suitable for resale'); }
  if (pp.resalePotential >= 70) { c += 0.15; r.push('Strong secondary market demand exists'); }
  if (pp.defects.length === 0) { c += 0.1; r.push('No defects detected during inspection'); }
  const val = (p.originalPrice || 50) * (pp.conditionScore >= 80 ? 0.7 : 0.5);
  const w = p.weight || 500;
return {
  decision: 'resell',
  confidence: Math.min(c, 0.98),
  reasoning: r,
  estimatedRecoveredValue: 35000,
  carbonSaved: 8.2,
  wasteDiverted: 1.5,
  recommendedMarket: MARKETS.resell
};
}

function evalRefurbish(p: IProduct, pp: IProductPassport): DecisionFactors | null {
  if (pp.repairabilityScore < 40 || pp.conditionScore >= 80) return null;

  const r: string[] = [];
  let c = 0.4;

  if (pp.repairabilityScore >= 70) {
    c += 0.2;
    r.push('High repairability score indicates cost-effective refurbishment');
  } else {
    c += 0.1;
    r.push('Product can be refurbished with moderate effort');
  }

  if (pp.conditionScore >= 40 && pp.conditionScore < 80) {
    c += 0.15;
    r.push('Condition is suitable for refurbishment');
  }

  return {
    decision: 'refurbish',
    confidence: Math.min(c, 0.95),
    reasoning: r,
    estimatedRecoveredValue: 18500,
    carbonSaved: 12.4,
    wasteDiverted: 2.3,
    recommendedMarket: MARKETS.refurbish,
  };
}

function evalDonate(p: IProduct, pp: IProductPassport): DecisionFactors | null {
  if (pp.conditionScore < 30) return null;

  const r: string[] = [];
  let c = 0.3;

  if (pp.conditionScore >= 50 && pp.resalePotential < 50) {
    c += 0.2;
    r.push('Functional but low resale value - ideal for donation');
  }

  return {
    decision: 'donate',
    confidence: Math.min(c, 0.90),
    reasoning: r,
    estimatedRecoveredValue: 5000,
    carbonSaved: 5.6,
    wasteDiverted: 1.2,
    recommendedMarket: MARKETS.donate,
  };
}
function evalRecycle(p: IProduct, pp: IProductPassport): DecisionFactors | null {
  const r: string[] = [];
  let c = 0.3;

  if (pp.conditionScore < 30) {
    c += 0.2;
    r.push('Condition too degraded for resale or refurbishment');
  }

  return {
    decision: 'recycle',
    confidence: Math.min(c, 0.92),
    reasoning: r,
    estimatedRecoveredValue: 2000,
    carbonSaved: 3.8,
    wasteDiverted: 0.9,
    recommendedMarket: MARKETS.recycle,
  };
}

function evalCompost(p: IProduct, pp: IProductPassport): DecisionFactors | null {
  if (!['food', 'books'].includes(p.category) && pp.conditionScore > 20) return null;
  const r: string[] = [];
  let c = 0.3;
  if (p.category === 'food') { c += 0.4; r.push('Organic product suitable for industrial composting'); }
  const w = p.weight || 300;
  return { decision: 'compost', confidence: Math.min(c, 0.90), reasoning: r, estimatedRecoveredValue: 0.5, carbonSaved: Math.round(w * 0.001 * 100) / 100, wasteDiverted: w / 1000, recommendedMarket: MARKETS.compost };
}

export async function generateDecision(product: IProduct, passport: IProductPassport): Promise<ILifecycleDecision> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));
  const candidates: DecisionFactors[] = [];
  const fns = [evalResell, evalRefurbish, evalDonate, evalRecycle, evalCompost];
  for (const fn of fns) { const r = fn(product, passport); if (r) candidates.push(r); }
  candidates.sort((a, b) => b.confidence - a.confidence);
  const best = candidates[0] || { decision: 'recycle' as LifecycleAction, confidence: 0.5, reasoning: ['Defaulting to recycling'], estimatedRecoveredValue: 1, carbonSaved: 0.5, wasteDiverted: 0.5, recommendedMarket: 'Material Recovery Facility' };
  return LifecycleDecision.create({
    productId: (product as any)._id as Types.ObjectId,
    passportId: (passport as any)._id as Types.ObjectId,
    decision: best.decision,
    confidence: Math.round(best.confidence * 100) / 100,
    reasoning: best.reasoning.join(' | '),
    estimatedRecoveredValue: best.estimatedRecoveredValue,
    carbonSaved: best.carbonSaved,
    wasteDiverted: best.wasteDiverted,
    recommendedMarket: best.recommendedMarket,
  });
}
