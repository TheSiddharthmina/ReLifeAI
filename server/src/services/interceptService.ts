import { DemandScore, IDemandScore, IBuyerSignal } from '../models/DemandScore';
import { ReturnIntercept, IReturnIntercept, IRankedBuyer, ICostSavings } from '../models/ReturnIntercept';


const SIGNAL_WEIGHTS = {
  wishlist: 30,
  search: 20,
  view: 15,
  cart_abandon: 25,
  similar_interest: 10,
};

function calculateDemandHeat(signals: IBuyerSignal[]): number {
  if (signals.length === 0) return 0;

  let score = 0;
  const signalCounts = { wishlist: 0, search: 0, view: 0, cart_abandon: 0, similar_interest: 0 };

  for (const signal of signals) {
    signalCounts[signal.signalType]++;
  }

  score += Math.min(signalCounts.wishlist * SIGNAL_WEIGHTS.wishlist, 30);
  score += Math.min(signalCounts.search * SIGNAL_WEIGHTS.search * 0.5, 20);
  score += Math.min(signalCounts.view * SIGNAL_WEIGHTS.view * 0.3, 15);
  score += Math.min(signalCounts.cart_abandon * SIGNAL_WEIGHTS.cart_abandon, 25);
  score += Math.min(signalCounts.similar_interest * SIGNAL_WEIGHTS.similar_interest * 0.5, 10);

  const now = Date.now();
  const recentSignals = signals.filter((s) => now - new Date(s.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000);
  if (recentSignals.length > signals.length * 0.5) {
    score *= 1.15;
  }

  return Math.min(Math.round(score), 100);
}


function generateBuyerSignals(category: string, brand: string): IBuyerSignal[] {
  const buyerPool = [
    { id: 'B001', name: 'Rahul Sharma' },
    { id: 'B002', name: 'Priya Patel' },
    { id: 'B003', name: 'Amit Kumar' },
    { id: 'B004', name: 'Sneha Reddy' },
    { id: 'B005', name: 'Vikram Singh' },
    { id: 'B006', name: 'Anita Gupta' },
    { id: 'B007', name: 'Rohan Mehta' },
    { id: 'B008', name: 'Deepa Nair' },
  ];

  const signalTypes: IBuyerSignal['signalType'][] = ['wishlist', 'search', 'view', 'cart_abandon', 'similar_interest'];
  const signals: IBuyerSignal[] = [];

  const numBuyers = 3 + Math.floor(Math.random() * 5);
  const selectedBuyers = buyerPool.sort(() => Math.random() - 0.5).slice(0, numBuyers);

  for (const buyer of selectedBuyers) {
    const numSignals = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numSignals; i++) {
      const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
      signals.push({
        buyerId: buyer.id,
        buyerName: buyer.name,
        signalType,
        signalStrength: 0.5 + Math.random() * 0.5,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        metadata: {
          searchQuery: signalType === 'search' ? `${brand} ${category}` : undefined,
          viewDuration: signalType === 'view' ? Math.floor(30 + Math.random() * 120) : undefined,
          cartValue: signalType === 'cart_abandon' ? Math.floor(5000 + Math.random() * 50000) : undefined,
        },
      });
    }
  }

  return signals;
}

function rankBuyers(signals: IBuyerSignal[]): IRankedBuyer[] {
  const buyerMap = new Map<string, { name: string; signals: IBuyerSignal[] }>();

  for (const signal of signals) {
    if (!buyerMap.has(signal.buyerId)) {
      buyerMap.set(signal.buyerId, { name: signal.buyerName, signals: [] });
    }
    buyerMap.get(signal.buyerId)!.signals.push(signal);
  }

  const ranked: IRankedBuyer[] = [];

  for (const [buyerId, data] of buyerMap.entries()) {
    const signalTypes = [...new Set(data.signals.map((s) => s.signalType))];
    const avgStrength = data.signals.reduce((sum, s) => sum + s.signalStrength, 0) / data.signals.length;

    let matchScore = avgStrength * 60;
    matchScore += signalTypes.length * 10;

    if (signalTypes.includes('cart_abandon')) matchScore += 15;
    if (signalTypes.includes('wishlist')) matchScore += 10;

    const estimatedConversion = Math.min(matchScore / 100, 0.95);

    ranked.push({
      buyerId,
      buyerName: data.name,
      matchScore: Math.round(Math.min(matchScore, 100)),
      signals: signalTypes,
      estimatedConversion: Math.round(estimatedConversion * 100) / 100,
      contactPriority: 0, 
    });
  }

  ranked.sort((a, b) => b.matchScore - a.matchScore);
  ranked.forEach((buyer, i) => { buyer.contactPriority = i + 1; });

  return ranked.slice(0, 5); 
}


function calculateCostSavings(productPrice: number, returnAge: number): ICostSavings {
  const warehouseHandling = Math.round(150 + productPrice * 0.02);
  const storageCostPerDay = 25;
  const storageCost = Math.round(storageCostPerDay * Math.max(14 - returnAge, 7));
  const reverseLogistics = Math.round(200 + productPrice * 0.01);
  const inventoryAging = Math.round(productPrice * 0.005 * (30 - returnAge));
  const totalSaved = warehouseHandling + storageCost + reverseLogistics + inventoryAging;

  return { warehouseHandling, storageCost, reverseLogistics, inventoryAging, totalSaved };
}


function shouldIntercept(demandScore: number, returnAge: number, conditionScore: number): { recommended: boolean; confidence: number; reasoning: string[] } {
  const reasoning: string[] = [];
  let confidence = 0.5;

  if (returnAge > 7) {
    return { recommended: false, confidence: 0.9, reasoning: ['Return age exceeds 7-day intercept window'] };
  }

  if (demandScore >= 80) {
    confidence += 0.25;
    reasoning.push(`Very high demand (${demandScore}/100) — multiple interested buyers identified`);
  } else if (demandScore >= 60) {
    confidence += 0.15;
    reasoning.push(`Good demand (${demandScore}/100) — interested buyers available`);
  } else if (demandScore < 40) {
    return { recommended: false, confidence: 0.7, reasoning: [`Low demand score (${demandScore}/100) — insufficient buyer interest`] };
  }

  if (conditionScore >= 80) {
    confidence += 0.15;
    reasoning.push(`Excellent condition (${conditionScore}/100) — no refurbishment needed`);
  } else if (conditionScore >= 60) {
    confidence += 0.08;
    reasoning.push(`Good condition (${conditionScore}/100) — minimal preparation required`);
  } else {
    confidence -= 0.1;
    reasoning.push(`Moderate condition (${conditionScore}/100) — may need minor inspection`);
  }

  if (returnAge <= 3) {
    confidence += 0.1;
    reasoning.push(`Very fresh return (${returnAge} days) — product is essentially new`);
  } else {
    reasoning.push(`Return within intercept window (${returnAge} days)`);
  }

  reasoning.push('Direct buyer reassignment bypasses warehouse processing');
  reasoning.push('Significant cost savings in logistics and storage');

  const recommended = demandScore >= 40 && conditionScore >= 50;

  return { recommended, confidence: Math.min(confidence, 0.98), reasoning };
}


export function validateInput(input: any): string[] {
  const errors: string[] = [];
  if (!input) { errors.push('Input data is required'); return errors; }
  if (!input.productId) errors.push('productId is required');
  if (!input.category) errors.push('category is required');
  if (input.returnAge === undefined) errors.push('returnAge is required (days since return)');
  else if (typeof input.returnAge !== 'number' || input.returnAge < 0) errors.push('returnAge must be non-negative');
  if (input.conditionScore === undefined) errors.push('conditionScore is required');
  else if (input.conditionScore < 0 || input.conditionScore > 100) errors.push('conditionScore must be 0-100');
  if (input.productPrice === undefined) errors.push('productPrice is required');
  else if (input.productPrice < 0) errors.push('productPrice must be non-negative');
  return errors;
}


export async function analyzeIntercept(input: any): Promise<IReturnIntercept> {
  const startTime = Date.now();

  const signals = generateBuyerSignals(input.category, input.brand || 'Unknown');

  const demandHeatScore = calculateDemandHeat(signals);

  await DemandScore.findOneAndUpdate(
    { productId: input.productId },
    {
      productId: input.productId,
      category: input.category,
      brand: input.brand || 'Unknown',
      demandHeatScore,
      wishlistCount: signals.filter((s) => s.signalType === 'wishlist').length,
      searchCount: signals.filter((s) => s.signalType === 'search').length,
      viewCount: signals.filter((s) => s.signalType === 'view').length,
      cartAbandonCount: signals.filter((s) => s.signalType === 'cart_abandon').length,
      similarInterestCount: signals.filter((s) => s.signalType === 'similar_interest').length,
      buyerSignals: signals,
      trendDirection: demandHeatScore >= 70 ? 'rising' : demandHeatScore >= 40 ? 'stable' : 'declining',
      lastCalculatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  const topBuyers = rankBuyers(signals);

  const { recommended, confidence, reasoning } = shouldIntercept(
    demandHeatScore,
    input.returnAge,
    input.conditionScore
  );

  const costSavings = calculateCostSavings(input.productPrice, input.returnAge);

  const processingTimeMs = Date.now() - startTime;

  const intercept = await ReturnIntercept.create({
    productId: input.productId,
    interceptRecommended: recommended,
    demandScore: demandHeatScore,
    interceptConfidence: Math.round(confidence * 100) / 100,
    topBuyers,
    costSavings,
    returnAge: input.returnAge,
    productCondition: input.conditionScore >= 80 ? 'excellent' : input.conditionScore >= 60 ? 'good' : 'fair',
    interceptStatus: recommended ? 'pending' : 'failed',
    assignedBuyerId: null,
    reasoning,
    metadata: {
      engineVersion: '5.0.0',
      processingTimeMs,
      buyersEvaluated: signals.length,
      signalsProcessed: signals.length,
    },
  });

  return intercept;
}


export async function getInterceptByProductId(productId: string): Promise<IReturnIntercept | null> {
  return ReturnIntercept.findOne({ productId }).sort({ createdAt: -1 });
}

export async function getDashboardStats() {
  const total = await ReturnIntercept.countDocuments();
  const intercepted = await ReturnIntercept.countDocuments({ interceptRecommended: true });
  const completed = await ReturnIntercept.countDocuments({ interceptStatus: 'completed' });

  const [savings] = await ReturnIntercept.aggregate([
    { $match: { interceptRecommended: true } },
    {
      $group: {
        _id: null,
        totalWarehouseSaved: { $sum: '$costSavings.warehouseHandling' },
        totalStorageSaved: { $sum: '$costSavings.storageCost' },
        totalLogisticsSaved: { $sum: '$costSavings.reverseLogistics' },
        totalAgingSaved: { $sum: '$costSavings.inventoryAging' },
        totalSaved: { $sum: '$costSavings.totalSaved' },
        avgDemandScore: { $avg: '$demandScore' },
      },
    },
  ]);

  const recentIntercepts = await ReturnIntercept.find({ interceptRecommended: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    totalAnalyzed: total,
    totalIntercepted: intercepted,
    interceptRate: total > 0 ? Math.round((intercepted / total) * 100) : 0,
    successRate: intercepted > 0 ? Math.round((completed / intercepted) * 100) : 0,
    costSavings: savings || { totalWarehouseSaved: 0, totalStorageSaved: 0, totalLogisticsSaved: 0, totalAgingSaved: 0, totalSaved: 0, avgDemandScore: 0 },
    recentIntercepts,
  };
}
