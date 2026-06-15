import { ReturnRiskPrediction } from '../models/ReturnRiskPrediction';
import { TrustScore } from '../models/TrustScore';
import { ReturnIntercept } from '../models/ReturnIntercept';
import { BuyerRequirement } from '../models/BuyerRequirement';
import { InventoryMatch } from '../models/InventoryMatch';
import { ImpactMetrics } from '../models/ImpactMetrics';

function conditionToScore(condition: string): number {
  if (condition === 'new') return 95;
  if (condition === 'like_new') return 90;
  if (condition === 'good') return 80;
  if (condition === 'fair') return 60;
  if (condition === 'poor') return 40;
  if (condition === 'damaged') return 20;
  return 70;
}

function money(value: any): number {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export class EnginePipeline {
  static async processProduct(product: any) {
    try {
      console.log('🚀 Pipeline started for product:', product._id);

      const conditionScore = product.conditionScore ?? conditionToScore(product.condition);
      const originalPrice = money(product.originalPrice);
      const rawWeight = money(product.weight || 1000);
      const weightKg = rawWeight > 20 ? rawWeight / 1000 : rawWeight;
      const productAgeMonths = product.productAgeMonths ?? 3;

      const riskResult = await this.runReturnRisk(product, conditionScore, productAgeMonths);
      const buyerResult = await this.runBuyerMatch(product, conditionScore, originalPrice, productAgeMonths);
      const trustResult = await this.runTrustEngine(product, riskResult, conditionScore);
      const marketplaceResult = await this.runMarketplace(product, buyerResult, originalPrice);
      const interceptResult = await this.runIntercept(product, riskResult, buyerResult, weightKg);
      const impactResult = await this.updateImpactMetrics(product, riskResult, originalPrice, weightKg);

      console.log('✅ Pipeline completed for product:', product._id);

      return {
        riskResult,
        buyerResult,
        trustResult,
        marketplaceResult,
        interceptResult,
        impactResult,
      };
    } catch (error) {
      console.error('❌ Pipeline error:', error);
      return null;
    }
  }

  static async runReturnRisk(product: any, conditionScore: number, productAgeMonths: number) {
    const existing = await ReturnRiskPrediction.findOne({ productId: String(product._id) });
    if (existing) return existing;

    const customerReturnHistory = product.customerReturnHistory ?? 0;
    const historicalReturnRate = product.historicalReturnRate ?? 0.15;
    const demandScore = product.demandScore ?? 75;
    const warrantyDurationMonths = product.warrantyDurationMonths ?? 6;

    const riskScore =
      (100 - conditionScore) * 0.4 +
      productAgeMonths * 2 +
      customerReturnHistory * 10 +
      historicalReturnRate * 30 +
      (100 - demandScore) * 0.1;

    const probability = Math.min(1, Math.max(0, riskScore / 100));

    const riskLevel =
      probability < 0.3 ? 'LOW' : probability < 0.7 ? 'MEDIUM' : 'HIGH';

    return ReturnRiskPrediction.create({
      productId: String(product._id),
      returnProbability: probability,
      riskLevel,
      confidence: 0.85,
      selectedModel: 'pipeline-rule-engine',
      featureVector: {
        category: product.category || 'other',
        brand: product.brand || 'Unknown',
        productAgeMonths,
        refurbishmentGrade: product.refurbishmentGrade || 'none',
        conditionScore,
        partsReplaced: product.partsReplaced || [],
        historicalReturnReasons: product.historicalReturnReasons || [],
        historicalReturnRate,
        warrantyDurationMonths,
        demandScore,
        customerSegment: product.customerSegment || 'standard',
        customerReturnHistory,
        pricePoint: money(product.originalPrice),
      },
      modelResults: [
        {
          modelName: 'pipeline-rule-engine',
          probability,
          confidence: 0.85,
        },
      ],
      riskFactors: [
        conditionScore < 60
          ? 'Low condition score increases return likelihood'
          : 'Condition score is within acceptable resale range',
        historicalReturnRate > 0.3
          ? 'Category has high historical return rate'
          : 'Historical return rate is moderate',
        demandScore < 50
          ? 'Low market demand may increase return risk'
          : 'Market demand is acceptable',
      ],
      mitigationSuggestions: [
        'Perform quality check before resale',
        'Clearly disclose product condition',
        'Offer limited warranty to improve buyer confidence',
      ],
      metadata: {
        engineVersion: 'pipeline-1.0',
        processingTimeMs: 0,
        modelsEvaluated: 1,
        trainingDataSize: 0,
        lastRetrainedAt: new Date(),
      },
    });
  }

  static async runBuyerMatch(
    product: any,
    conditionScore: number,
    originalPrice: number,
    productAgeMonths: number
  ) {
    const start = Date.now();

    const requirements = await BuyerRequirement.find({
      status: 'active',
      category: product.category,
    }).lean();

    if (requirements.length === 0) {
      console.log('No active buyer requirements for category:', product.category);
      return {
        totalMatches: 0,
        bestMatchScore: 0,
        matchedProducts: [],
      };
    }

    const validMatches: any[] = [];

    for (const req of requirements) {
      const categoryFit = req.category === product.category ? 100 : 0;

      const budgetFit =
        originalPrice >= req.budgetMin && originalPrice <= req.budgetMax
          ? 100
          : originalPrice < req.budgetMin
          ? Math.max(0, 100 - ((req.budgetMin - originalPrice) / Math.max(req.budgetMin, 1)) * 100)
          : Math.max(0, 100 - ((originalPrice - req.budgetMax) / Math.max(req.budgetMax, 1)) * 100);

      const conditionFit =
        conditionScore >= req.minConditionScore
          ? 100
          : Math.max(0, (conditionScore / Math.max(req.minConditionScore, 1)) * 100);

      const brandFit =
        !req.brandPreferences?.length ||
        req.brandPreferences.map((b: string) => b.toLowerCase()).includes(String(product.brand || '').toLowerCase())
          ? 100
          : 50;

      const ageFit =
        productAgeMonths <= req.maxProductAge
          ? 100
          : Math.max(0, 100 - (productAgeMonths - req.maxProductAge) * 5);

      const matchScore =
        categoryFit * 0.25 +
        budgetFit * 0.25 +
        conditionFit * 0.25 +
        brandFit * 0.15 +
        ageFit * 0.1;

      if (matchScore >= 60) {
        validMatches.push({
          requirement: req,
          matchedProduct: {
            productId: String(product._id),
            name: product.name,
            brand: product.brand || 'Unknown',
            price: originalPrice,
            conditionScore,
            batteryHealth: product.batteryHealth || 85,
            refurbishmentGrade: product.refurbishmentGrade || 'grade_b',
            productAge: productAgeMonths,
            matchScore: Math.round(matchScore),
            matchBreakdown: {
              categoryFit: Math.round(categoryFit),
              budgetFit: Math.round(budgetFit),
              conditionFit: Math.round(conditionFit),
              brandFit: Math.round(brandFit),
            },
          },
        });
      }
    }

    if (validMatches.length === 0) {
      return {
        totalMatches: 0,
        bestMatchScore: 0,
        matchedProducts: [],
      };
    }

    validMatches.sort(
      (a, b) => b.matchedProduct.matchScore - a.matchedProduct.matchScore
    );

    const best = validMatches[0];
    const bestRequirement = best.requirement;
    const matchedProducts = validMatches.map((m) => m.matchedProduct);
    const bestMatchScore = best.matchedProduct.matchScore;

    const existing = await InventoryMatch.findOne({
      buyerRequirementId: String(bestRequirement._id),
      'matchedProducts.productId': String(product._id),
    });

    if (existing) return existing;

    return InventoryMatch.create({
      buyerRequirementId: String(bestRequirement._id),
      buyerId: bestRequirement.buyerId,
      buyerName: bestRequirement.buyerName,
      matchedProducts,
      bestMatchScore,
      totalMatches: matchedProducts.length,
      notificationSent: false,
      notificationSentAt: null,
      buyerResponse: 'pending',
      timeToMatch: Date.now() - start,
      costSaved: {
        warehouseStorage: Math.round(originalPrice * 0.02),
        handling: 150,
        inventoryAging: Math.round(originalPrice * 0.03),
        totalSaved: Math.round(originalPrice * 0.05 + 150),
      },
      metadata: {
        engineVersion: '8.0.0',
        processingTimeMs: Date.now() - start,
        inventoryScanned: 1,
        requirementsMatched: requirements.length,
      },
    });
  }

  static async runTrustEngine(product: any, risk: any, conditionScore: number) {
    const existing = await TrustScore.findOne({ productId: String(product._id) });
    if (existing) return existing;

    const returnProbability = risk?.returnProbability ?? 0.3;

    const trustScore = Math.max(
      0,
      Math.min(100, conditionScore * 0.65 + (100 - returnProbability * 100) * 0.35)
    );

    return TrustScore.create({
      productId: String(product._id),
      trustScore: Math.round(trustScore),
      componentTests: [
        {
          component: 'Visual Inspection',
          status: conditionScore >= 60 ? 'passed' : 'warning',
          score: conditionScore,
          details: 'Derived from product condition and vision assessment.',
        },
        {
          component: 'Return Risk',
          status: returnProbability < 0.5 ? 'passed' : 'warning',
          score: Math.round((1 - returnProbability) * 100),
          details: 'Computed using return-risk model output.',
        },
      ],
      remainingUsefulLife: conditionScore >= 80 ? 24 : conditionScore >= 60 ? 12 : 6,
      failureProbability: Math.min(1, returnProbability + (100 - conditionScore) / 300),
      warrantyInfo: {
        duration: conditionScore >= 70 ? 6 : 3,
        coverage: conditionScore >= 70 ? 'limited functional warranty' : 'basic inspection warranty',
        expiresAt: new Date(
          Date.now() + (conditionScore >= 70 ? 180 : 90) * 24 * 60 * 60 * 1000
        ),
      },
      inspectionSummary: `Product condition score is ${conditionScore}/100.`,
      refurbishmentSummary:
        conditionScore >= 70
          ? 'Product is suitable for resale with standard quality checks.'
          : 'Product may require refurbishment before resale.',
      chatHistory: [],
      metadata: {
        engineVersion: '7.0.0',
        processingTimeMs: 0,
        dataSourcesUsed: ['product', 'return-risk', 'vision-condition'],
      },
    });
  }

  static async runMarketplace(product: any, buyerResult: any, originalPrice: number) {
    return {
      productId: String(product._id),
      listingCreated: true,
      expectedPrice: Math.round(originalPrice * 0.75),
      buyerMatches: buyerResult?.totalMatches || 0,
    };
  }

  static async runIntercept(product: any, risk: any, buyerResult: any, weightKg: number) {
    const existing = await ReturnIntercept.findOne({ productId: String(product._id) });
    if (existing) return existing;

    const probability = risk?.returnProbability ?? 0.3;
    const demandScore =
      buyerResult?.bestMatchScore ||
      (buyerResult?.totalMatches > 0 ? 80 : product.category === 'electronics' ? 75 : 60);

    const recommended = probability >= 0.45 || demandScore >= 70;

    return ReturnIntercept.create({
      productId: String(product._id),
      interceptRecommended: recommended,
      demandScore: Math.round(demandScore),
      interceptConfidence: Math.min(1, Math.max(0.3, (probability + demandScore / 100) / 2)),
      topBuyers: [],
      costSavings: {
        warehouseHandling: 150,
        storageCost: Math.round(weightKg * 20),
        reverseLogistics: 120,
        inventoryAging: Math.round(money(product.originalPrice) * 0.03),
        totalSaved:
          150 +
          Math.round(weightKg * 20) +
          120 +
          Math.round(money(product.originalPrice) * 0.03),
      },
      returnAge: product.productAgeMonths || 3,
      productCondition: product.condition || 'unknown',
      interceptStatus: recommended ? 'pending' : 'failed',
      assignedBuyerId: null,
      reasoning: [
        recommended
          ? 'Product has sufficient risk or demand signals for intercept workflow.'
          : 'Product does not currently meet intercept threshold.',
      ],
      metadata: {
        engineVersion: '5.0.0',
        processingTimeMs: 0,
        buyersEvaluated: buyerResult?.totalMatches || 0,
        signalsProcessed: 3,
      },
    });
  }

  static async updateImpactMetrics(product: any, risk: any, originalPrice: number, weightKg: number) {
    const decision =
      risk?.riskLevel === 'HIGH'
        ? 'REFURBISH'
        : risk?.riskLevel === 'MEDIUM'
        ? 'REPAIR'
        : 'RESALE';

    const recoveredValue =
      decision === 'RESALE'
        ? originalPrice * 0.8
        : decision === 'REPAIR'
        ? originalPrice * 0.55
        : originalPrice * 0.35;

    const carbonSaved = Math.max(1, weightKg * 8);
    const wasteDiverted = Math.max(0.5, weightKg);

    let metrics = await ImpactMetrics.findOne().sort({ createdAt: -1 });

    if (!metrics) {
      metrics = await ImpactMetrics.create({
        totalProductsProcessed: 0,
        totalCarbonSaved: 0,
        totalWasteDiverted: 0,
        totalRecoveredValue: 0,
        categoryBreakdown: [],
        lifecycleBreakdown: [],
        lastUpdated: new Date(),
      });
    }

    metrics.totalProductsProcessed += 1;
    metrics.totalCarbonSaved += carbonSaved;
    metrics.totalWasteDiverted += wasteDiverted;
    metrics.totalRecoveredValue += recoveredValue;
    metrics.lastUpdated = new Date();

    const category = product.category || 'other';
    const categoryItem = metrics.categoryBreakdown.find((c: any) => c.category === category);
    if (categoryItem) categoryItem.count += 1;
    else metrics.categoryBreakdown.push({ category, count: 1 });

    const lifecycleItem = metrics.lifecycleBreakdown.find((l: any) => l.decision === decision);
    if (lifecycleItem) {
      lifecycleItem.count += 1;
      lifecycleItem.totalValue += recoveredValue;
    } else {
      metrics.lifecycleBreakdown.push({
        decision,
        count: 1,
        totalValue: recoveredValue,
      });
    }

    await metrics.save();
    return metrics;
  }
}