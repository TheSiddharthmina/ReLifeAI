import { BuyerRequirement, IBuyerRequirement } from '../models/BuyerRequirement';
import { InventoryMatch, IInventoryMatch, IMatchedProduct } from '../models/InventoryMatch';

// ══════════════════════════════════════════════════════════════
// SIMULATED INVENTORY (returned/refurbished products)
// ══════════════════════════════════════════════════════════════

const SIMULATED_INVENTORY = [
  { productId: 'INV-001', name: 'Dell XPS 15 Laptop', brand: 'Dell', category: 'electronics', price: 48000, conditionScore: 88, batteryHealth: 91, refurbishmentGrade: 'grade_a', productAge: 10 },
  { productId: 'INV-002', name: 'HP Pavilion Gaming Laptop', brand: 'HP', category: 'electronics', price: 42000, conditionScore: 82, batteryHealth: 85, refurbishmentGrade: 'grade_b', productAge: 14 },
  { productId: 'INV-003', name: 'Apple MacBook Air M2', brand: 'Apple', category: 'electronics', price: 65000, conditionScore: 92, batteryHealth: 95, refurbishmentGrade: 'grade_a', productAge: 6 },
  { productId: 'INV-004', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'electronics', price: 35000, conditionScore: 85, batteryHealth: 88, refurbishmentGrade: 'grade_a', productAge: 8 },
  { productId: 'INV-005', name: 'Sony WH-1000XM5', brand: 'Sony', category: 'electronics', price: 18000, conditionScore: 90, batteryHealth: 92, refurbishmentGrade: 'grade_a', productAge: 5 },
  { productId: 'INV-006', name: 'Lenovo ThinkPad T14', brand: 'Lenovo', category: 'electronics', price: 38000, conditionScore: 78, batteryHealth: 80, refurbishmentGrade: 'grade_b', productAge: 18 },
  { productId: 'INV-007', name: 'Dyson V15 Vacuum', brand: 'Dyson', category: 'appliances', price: 32000, conditionScore: 86, batteryHealth: 89, refurbishmentGrade: 'grade_a', productAge: 9 },
  { productId: 'INV-008', name: 'Nike Air Max 270', brand: 'Nike', category: 'clothing', price: 6500, conditionScore: 75, batteryHealth: 100, refurbishmentGrade: 'grade_b', productAge: 4 },
  { productId: 'INV-009', name: 'KitchenAid Mixer', brand: 'KitchenAid', category: 'appliances', price: 22000, conditionScore: 91, batteryHealth: 100, refurbishmentGrade: 'grade_a', productAge: 12 },
  { productId: 'INV-010', name: 'iPad Pro 12.9', brand: 'Apple', category: 'electronics', price: 55000, conditionScore: 87, batteryHealth: 90, refurbishmentGrade: 'grade_a', productAge: 11 },
];

// ══════════════════════════════════════════════════════════════
// MATCHING FORMULA
// ══════════════════════════════════════════════════════════════

function calculateMatchScore(requirement: IBuyerRequirement, product: any): IMatchedProduct | null {
  // Category fit (must match)
  const categoryFit = product.category.toLowerCase() === requirement.category.toLowerCase() ? 100 : 0;
  if (categoryFit === 0) return null;

  // Budget fit
  let budgetFit = 0;
  if (product.price >= requirement.budgetMin && product.price <= requirement.budgetMax) {
    budgetFit = 100;
  } else if (product.price < requirement.budgetMin) {
    budgetFit = 80; // Under budget is okay
  } else {
    const overBy = ((product.price - requirement.budgetMax) / requirement.budgetMax) * 100;
    budgetFit = Math.max(0, 60 - overBy * 2);
  }
  if (budgetFit < 30) return null;

  // Condition fit
  let conditionFit = 0;
  if (product.conditionScore >= requirement.minConditionScore) {
    conditionFit = 80 + ((product.conditionScore - requirement.minConditionScore) / 20) * 20;
  } else {
    const deficit = requirement.minConditionScore - product.conditionScore;
    conditionFit = Math.max(0, 60 - deficit * 3);
  }
  if (conditionFit < 30) return null;

  // Brand fit
  let brandFit = 50; // Neutral
  if (requirement.brandPreferences.length > 0) {
    const brandMatch = requirement.brandPreferences.some(
      (b) => b.toLowerCase() === product.brand.toLowerCase()
    );
    brandFit = brandMatch ? 100 : 30;
  }

  // Battery check
  if (product.batteryHealth < requirement.minBatteryHealth) {
    return null;
  }

  // Age check
  if (product.productAge > requirement.maxProductAge) {
    return null;
  }

  // Grade check
  if (requirement.acceptableGrades.length > 0 && !requirement.acceptableGrades.includes(product.refurbishmentGrade)) {
    return null;
  }

  // Overall match score
  const matchScore = Math.round(
    categoryFit * 0.30 +
    budgetFit * 0.30 +
    conditionFit * 0.25 +
    brandFit * 0.15
  );

  if (matchScore < 50) return null;

  return {
    productId: product.productId,
    name: product.name,
    brand: product.brand,
    price: product.price,
    conditionScore: product.conditionScore,
    batteryHealth: product.batteryHealth,
    refurbishmentGrade: product.refurbishmentGrade,
    productAge: product.productAge,
    matchScore: Math.min(matchScore, 100),
    matchBreakdown: {
      categoryFit: Math.round(categoryFit),
      budgetFit: Math.round(budgetFit),
      conditionFit: Math.round(conditionFit),
      brandFit: Math.round(brandFit),
    },
  };
}

// ══════════════════════════════════════════════════════════════
// COST SAVINGS
// ══════════════════════════════════════════════════════════════

function calculateCostSaved(matchCount: number, avgPrice: number) {
  const warehouseStorage = matchCount * 180;
  const handling = matchCount * 120;
  const inventoryAging = Math.round(avgPrice * 0.02 * matchCount);
  return { warehouseStorage, handling, inventoryAging, totalSaved: warehouseStorage + handling + inventoryAging };
}

// ══════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════

export function validateRegisterInput(input: any): string[] {
  const errors: string[] = [];
  if (!input) { errors.push('Input required'); return errors; }
  if (!input.buyerId) errors.push('buyerId is required');
  if (!input.buyerName) errors.push('buyerName is required');
  if (!input.buyerEmail) errors.push('buyerEmail is required');
  if (!input.category) errors.push('category is required');
  if (input.budgetMin === undefined) errors.push('budgetMin is required');
  if (input.budgetMax === undefined) errors.push('budgetMax is required');
  if (input.budgetMin !== undefined && input.budgetMax !== undefined && input.budgetMin > input.budgetMax) {
    errors.push('budgetMin cannot exceed budgetMax');
  }
  return errors;
}

// ══════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ══════════════════════════════════════════════════════════════

export async function registerRequirement(input: any): Promise<IBuyerRequirement> {
  const requirement = await BuyerRequirement.create({
    buyerId: input.buyerId,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    category: input.category,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    brandPreferences: input.brandPreferences || [],
    minConditionScore: input.minConditionScore || 60,
    minBatteryHealth: input.minBatteryHealth || 70,
    warrantyRequired: input.warrantyRequired || false,
    minWarrantyMonths: input.minWarrantyMonths || 0,
    maxProductAge: input.maxProductAge || 36,
    acceptableGrades: input.acceptableGrades || ['grade_a', 'grade_b'],
    additionalNotes: input.additionalNotes || '',
    status: 'active',
    notificationsEnabled: true,
  });

  return requirement;
}

export async function findMatches(requirementId?: string): Promise<IInventoryMatch[]> {
  const startTime = Date.now();

  // Get active requirements
  const filter: any = { status: 'active' };
  if (requirementId) filter._id = requirementId;

  const requirements = await BuyerRequirement.find(filter);
  const results: IInventoryMatch[] = [];

  for (const req of requirements) {
    const matches: IMatchedProduct[] = [];

    for (const product of SIMULATED_INVENTORY) {
      const match = calculateMatchScore(req, product);
      if (match) matches.push(match);
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = matches.slice(0, 5);

    if (topMatches.length > 0) {
      const avgPrice = topMatches.reduce((s, m) => s + m.price, 0) / topMatches.length;
      const costSaved = calculateCostSaved(topMatches.length, avgPrice);

      const match = await InventoryMatch.create({
        buyerRequirementId: (req as any)._id.toString(),
        buyerId: req.buyerId,
        buyerName: req.buyerName,
        matchedProducts: topMatches,
        bestMatchScore: topMatches[0].matchScore,
        totalMatches: topMatches.length,
        notificationSent: false,
        timeToMatch: Date.now() - startTime,
        costSaved,
        metadata: {
          engineVersion: '8.0.0',
          processingTimeMs: Date.now() - startTime,
          inventoryScanned: SIMULATED_INVENTORY.length,
          requirementsMatched: topMatches.length,
        },
      });

      results.push(match);

      // Update requirement status
      if (topMatches[0].matchScore >= 80) {
        await BuyerRequirement.findByIdAndUpdate((req as any)._id, { status: 'matched' });
      }
    }
  }

  return results;
}

export async function sendNotification(matchId: string): Promise<{ sent: boolean; message: string }> {
  const match = await InventoryMatch.findById(matchId);
  if (!match) return { sent: false, message: 'Match not found' };

  // Simulate notification
  match.notificationSent = true;
  match.notificationSentAt = new Date();
  match.buyerResponse = 'pending';
  await match.save();

  return {
    sent: true,
    message: `Notification sent to ${match.buyerName} with ${match.totalMatches} matching products. Best match: ${match.bestMatchScore}%`,
  };
}

export async function getMatchesByProduct(productId: string) {
  return InventoryMatch.find({ 'matchedProducts.productId': productId }).sort({ createdAt: -1 }).lean();
}

export async function getDashboardStats() {
  const totalRequirements = await BuyerRequirement.countDocuments();
  const activeRequirements = await BuyerRequirement.countDocuments({ status: 'active' });
  const matchedRequirements = await BuyerRequirement.countDocuments({ status: 'matched' });
  const totalMatches = await InventoryMatch.countDocuments();

  const [savings] = await InventoryMatch.aggregate([
    { $group: { _id: null, totalSaved: { $sum: '$costSaved.totalSaved' }, avgMatchScore: { $avg: '$bestMatchScore' }, totalNotified: { $sum: { $cond: ['$notificationSent', 1, 0] } } } },
  ]);

  const successRate = totalRequirements > 0 ? Math.round((matchedRequirements / totalRequirements) * 100) : 0;

  const recentMatches = await InventoryMatch.find().sort({ createdAt: -1 }).limit(5).select('buyerName bestMatchScore totalMatches createdAt').lean();

  return {
    totalRequirements,
    activeRequirements,
    matchedRequirements,
    totalMatches,
    successRate,
    avgMatchScore: savings?.avgMatchScore ? Math.round(savings.avgMatchScore) : 0,
    totalCostSaved: savings?.totalSaved || 0,
    totalNotified: savings?.totalNotified || 0,
    recentMatches,
  };
}
