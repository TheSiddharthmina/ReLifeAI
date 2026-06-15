import { ReturnRiskPrediction, IReturnRiskPrediction, IFeatureVector, RiskLevel } from '../models/ReturnRiskPrediction';
import { runEnsemblePrediction, retrainModels, RetrainingResult } from './mlPipeline';

// ══════════════════════════════════════════════════════════════
// RISK LEVEL CLASSIFICATION
// ══════════════════════════════════════════════════════════════

function classifyRiskLevel(probability: number): RiskLevel {
  if (probability <= 0.20) return 'LOW';
  if (probability <= 0.50) return 'MEDIUM';
  return 'HIGH';
}

// ══════════════════════════════════════════════════════════════
// RISK FACTOR IDENTIFICATION
// ══════════════════════════════════════════════════════════════

function identifyRiskFactors(features: IFeatureVector, probability: number): string[] {
  const factors: string[] = [];

  if (features.conditionScore < 50) {
    factors.push(`Low condition score (${features.conditionScore}/100) increases return likelihood`);
  }
  if (features.historicalReturnRate > 0.30) {
    factors.push(`High historical return rate (${Math.round(features.historicalReturnRate * 100)}%) for this product type`);
  }
  if (features.productAgeMonths > 24) {
    factors.push(`Product age (${features.productAgeMonths} months) exceeds optimal resale window`);
  }
  if (features.refurbishmentGrade === 'grade_c' || features.refurbishmentGrade === 'grade_d') {
    factors.push(`Low refurbishment grade (${features.refurbishmentGrade}) correlates with higher returns`);
  }
  if (features.partsReplaced.length >= 3) {
    factors.push(`Multiple parts replaced (${features.partsReplaced.length}) may indicate underlying issues`);
  }
  if (features.customerReturnHistory > 3) {
    factors.push(`Customer has high return history (${features.customerReturnHistory} prior returns)`);
  }
  if (features.demandScore < 40) {
    factors.push(`Low market demand (${features.demandScore}/100) suggests potential mismatch`);
  }
  if (features.warrantyDurationMonths === 0) {
    factors.push('No warranty coverage may increase buyer dissatisfaction risk');
  }

  // Ensure at least one factor
  if (factors.length === 0) {
    if (probability < 0.20) {
      factors.push('All risk indicators within acceptable thresholds');
    } else {
      factors.push('Combination of moderate risk factors contributes to overall risk');
    }
  }

  return factors;
}

// ══════════════════════════════════════════════════════════════
// MITIGATION SUGGESTIONS
// ══════════════════════════════════════════════════════════════

function generateMitigationSuggestions(features: IFeatureVector, riskLevel: RiskLevel): string[] {
  const suggestions: string[] = [];

  if (riskLevel === 'LOW') {
    suggestions.push('Standard listing recommended - no special measures needed');
    suggestions.push('Consider premium placement for high-confidence products');
    return suggestions;
  }

  if (features.conditionScore < 60) {
    suggestions.push('Recommend additional quality inspection before listing');
  }
  if (features.refurbishmentGrade === 'grade_c' || features.refurbishmentGrade === 'grade_d') {
    suggestions.push('Consider upgrading refurbishment to Grade B standard');
  }
  if (features.warrantyDurationMonths < 6) {
    suggestions.push('Extend warranty to 6+ months to improve buyer confidence');
  }
  if (features.demandScore < 50) {
    suggestions.push('Adjust pricing to match current market demand');
  }
  if (features.partsReplaced.length > 0) {
    suggestions.push('Clearly disclose replaced parts in product listing');
  }
  if (features.customerReturnHistory > 3) {
    suggestions.push('Flag customer for enhanced verification before sale');
  }

  if (riskLevel === 'HIGH') {
    suggestions.push('Consider routing to bulk/wholesale channel instead of individual resale');
    suggestions.push('Apply stricter return policy for this transaction');
  }

  return suggestions;
}

// ══════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ══════════════════════════════════════════════════════════════

export function validateInput(input: any): string[] {
  const errors: string[] = [];

  if (!input) { errors.push('Input data is required'); return errors; }
  if (!input.productId) errors.push('productId is required');
  if (!input.category) errors.push('category is required');
  if (input.conditionScore === undefined) errors.push('conditionScore is required');
  else if (typeof input.conditionScore !== 'number' || input.conditionScore < 0 || input.conditionScore > 100) {
    errors.push('conditionScore must be 0-100');
  }
  if (input.productAgeMonths === undefined) errors.push('productAgeMonths is required');
  else if (typeof input.productAgeMonths !== 'number' || input.productAgeMonths < 0) {
    errors.push('productAgeMonths must be non-negative');
  }
  if (input.demandScore !== undefined && (input.demandScore < 0 || input.demandScore > 100)) {
    errors.push('demandScore must be 0-100');
  }

  return errors;
}

// ══════════════════════════════════════════════════════════════
// MAIN PREDICTION ENGINE
// ══════════════════════════════════════════════════════════════

export async function predictReturnRisk(input: any): Promise<IReturnRiskPrediction> {
  const startTime = Date.now();

  // Build feature vector
  const featureVector: IFeatureVector = {
    category: input.category || 'other',
    brand: input.brand || 'Unknown',
    productAgeMonths: input.productAgeMonths || 0,
    refurbishmentGrade: input.refurbishmentGrade || 'none',
    conditionScore: input.conditionScore || 50,
    partsReplaced: input.partsReplaced || [],
    historicalReturnReasons: input.historicalReturnReasons || [],
    historicalReturnRate: input.historicalReturnRate || 0,
    warrantyDurationMonths: input.warrantyDurationMonths || 0,
    demandScore: input.demandScore || 50,
    customerSegment: input.customerSegment || 'standard',
    customerReturnHistory: input.customerReturnHistory || 0,
    pricePoint: input.pricePoint || 0,
  };

  // Run ML ensemble
  const ensemble = runEnsemblePrediction(featureVector);

  // Classify risk
  const riskLevel = classifyRiskLevel(ensemble.finalProbability);

  // Identify factors and suggestions
  const riskFactors = identifyRiskFactors(featureVector, ensemble.finalProbability);
  const mitigationSuggestions = generateMitigationSuggestions(featureVector, riskLevel);

  const processingTimeMs = Date.now() - startTime;

  // Store prediction
  const prediction = await ReturnRiskPrediction.create({
    productId: input.productId,
    returnProbability: ensemble.finalProbability,
    riskLevel,
    confidence: ensemble.finalConfidence,
    featureVector,
    modelResults: ensemble.allResults,
    selectedModel: ensemble.selectedModel,
    riskFactors,
    mitigationSuggestions,
    metadata: {
      engineVersion: '4.0.0',
      processingTimeMs,
      modelsEvaluated: 3,
      trainingDataSize: 50000,
      lastRetrainedAt: new Date(),
    },
  });

  return prediction;
}

// ══════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ══════════════════════════════════════════════════════════════

export async function getPredictionByProductId(productId: string): Promise<IReturnRiskPrediction | null> {
  return ReturnRiskPrediction.findOne({ productId }).sort({ createdAt: -1 });
}

export async function getHighRiskProducts(limit = 20) {
  return ReturnRiskPrediction.find({ riskLevel: 'HIGH' })
    .sort({ returnProbability: -1 })
    .limit(limit)
    .lean();
}

export async function getRiskDistribution() {
  return ReturnRiskPrediction.aggregate([
    { $group: { _id: '$riskLevel', count: { $sum: 1 }, avgProbability: { $avg: '$returnProbability' } } },
    { $sort: { _id: 1 } },
  ]);
}

export async function getRiskTrends(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return ReturnRiskPrediction.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        avgProbability: { $avg: '$returnProbability' },
        count: { $sum: 1 },
        highRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

export async function getDashboardStats() {
  const total = await ReturnRiskPrediction.countDocuments();
  const distribution = await getRiskDistribution();
  const highRiskProducts = await getHighRiskProducts(10);
  const trends = await getRiskTrends(30);

  const [avgStats] = await ReturnRiskPrediction.aggregate([
    {
      $group: {
        _id: null,
        avgProbability: { $avg: '$returnProbability' },
        avgConfidence: { $avg: '$confidence' },
        maxProbability: { $max: '$returnProbability' },
        minProbability: { $min: '$returnProbability' },
      },
    },
  ]);

  return {
    totalPredictions: total,
    avgReturnProbability: avgStats ? Math.round(avgStats.avgProbability * 1000) / 1000 : 0,
    avgConfidence: avgStats ? Math.round(avgStats.avgConfidence * 100) / 100 : 0,
    maxProbability: avgStats ? avgStats.maxProbability : 0,
    minProbability: avgStats ? avgStats.minProbability : 0,
    distribution,
    highRiskProducts,
    trends,
  };
}

export { retrainModels };