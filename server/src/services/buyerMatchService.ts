import { InventoryMatch } from '../models/InventoryMatch';
import { BuyerProfile, IBuyerProfile } from '../models/BuyerProfile';
import { BuyerScore, IBuyerScore, IBuyerScoreEntry } from '../models/BuyerScore';


const SIMULATED_BUYERS: Partial<IBuyerProfile>[] = [
  { buyerId: 'BUY-001', name: 'Rahul Sharma', segment: 'prime', categoryPreferences: ['electronics', 'appliances'], brandPreferences: ['Apple', 'Samsung', 'Sony'], budgetRange: { min: 20000, max: 80000 }, returnRate: 0.05, retentionScore: 92, avgOrderValue: 45000, totalOrders: 34 },
  { buyerId: 'BUY-002', name: 'Priya Patel', segment: 'prime', categoryPreferences: ['electronics', 'beauty'], brandPreferences: ['Apple', 'Dyson', 'Nike'], budgetRange: { min: 10000, max: 60000 }, returnRate: 0.08, retentionScore: 88, avgOrderValue: 32000, totalOrders: 28 },
  { buyerId: 'BUY-003', name: 'Amit Kumar', segment: 'standard', categoryPreferences: ['electronics', 'books', 'toys'], brandPreferences: ['Samsung', 'Lenovo', 'LEGO'], budgetRange: { min: 5000, max: 40000 }, returnRate: 0.12, retentionScore: 78, avgOrderValue: 18000, totalOrders: 45 },
  { buyerId: 'BUY-004', name: 'Sneha Reddy', segment: 'prime', categoryPreferences: ['clothing', 'beauty', 'sports'], brandPreferences: ['Nike', 'Adidas', 'Patagonia'], budgetRange: { min: 3000, max: 25000 }, returnRate: 0.18, retentionScore: 72, avgOrderValue: 8000, totalOrders: 52 },
  { buyerId: 'BUY-005', name: 'Vikram Singh', segment: 'standard', categoryPreferences: ['electronics', 'furniture'], brandPreferences: ['Dell', 'HP', 'IKEA'], budgetRange: { min: 15000, max: 70000 }, returnRate: 0.07, retentionScore: 85, avgOrderValue: 38000, totalOrders: 22 },
  { buyerId: 'BUY-006', name: 'Anita Gupta', segment: 'prime', categoryPreferences: ['appliances', 'furniture', 'beauty'], brandPreferences: ['Dyson', 'KitchenAid', 'Philips'], budgetRange: { min: 10000, max: 50000 }, returnRate: 0.10, retentionScore: 82, avgOrderValue: 28000, totalOrders: 19 },
  { buyerId: 'BUY-007', name: 'Rohan Mehta', segment: 'new', categoryPreferences: ['electronics', 'sports'], brandPreferences: ['Apple', 'Sony', 'Bose'], budgetRange: { min: 25000, max: 100000 }, returnRate: 0.03, retentionScore: 95, avgOrderValue: 55000, totalOrders: 12 },
  { buyerId: 'BUY-008', name: 'Deepa Nair', segment: 'standard', categoryPreferences: ['books', 'toys', 'clothing'], brandPreferences: ['LEGO', 'Nike'], budgetRange: { min: 1000, max: 15000 }, returnRate: 0.22, retentionScore: 65, avgOrderValue: 5000, totalOrders: 67 },
  { buyerId: 'BUY-009', name: 'Karthik Iyer', segment: 'prime', categoryPreferences: ['electronics', 'appliances'], brandPreferences: ['Samsung', 'LG', 'Bose'], budgetRange: { min: 20000, max: 90000 }, returnRate: 0.06, retentionScore: 90, avgOrderValue: 42000, totalOrders: 25 },
  { buyerId: 'BUY-010', name: 'Meera Joshi', segment: 'standard', categoryPreferences: ['clothing', 'beauty', 'books'], brandPreferences: ['Patagonia', 'Nike', 'Yeti'], budgetRange: { min: 2000, max: 20000 }, returnRate: 0.15, retentionScore: 74, avgOrderValue: 6500, totalOrders: 38 },
  { buyerId: 'BUY-011', name: 'Arjun Rao', segment: 'prime', categoryPreferences: ['electronics', 'sports', 'toys'], brandPreferences: ['Apple', 'Sony', 'Nintendo'], budgetRange: { min: 15000, max: 75000 }, returnRate: 0.04, retentionScore: 93, avgOrderValue: 48000, totalOrders: 31 },
  { buyerId: 'BUY-012', name: 'Pooja Verma', segment: 'standard', categoryPreferences: ['furniture', 'appliances'], brandPreferences: ['IKEA', 'KitchenAid', 'Philips'], budgetRange: { min: 8000, max: 45000 }, returnRate: 0.09, retentionScore: 81, avgOrderValue: 22000, totalOrders: 16 },
];


function calculatePurchaseIntent(buyer: Partial<IBuyerProfile>, product: any): number {
  let score = 0;

 
  if (buyer.categoryPreferences?.includes(product.category)) score += 35;

 
  if (buyer.brandPreferences?.some((b: string) => b.toLowerCase() === product.brand?.toLowerCase())) score += 25;

  if (buyer.searchHistory?.some((s: string) => s.toLowerCase().includes(product.category))) score += 15;
  if (buyer.wishlist?.some((w: string) => w.toLowerCase().includes(product.brand?.toLowerCase() || ''))) score += 20;

 
  if (buyer.segment === 'prime') score += 10;

  score += 5;

  return Math.min(score, 100);
}

function calculateRetentionProbability(buyer: Partial<IBuyerProfile>): number {
  let score = buyer.retentionScore || 50;

 
  const returnRate = buyer.returnRate || 0;
  if (returnRate < 0.05) score += 15;
  else if (returnRate < 0.10) score += 8;
  else if (returnRate > 0.20) score -= 15;
  else if (returnRate > 0.15) score -= 8;


  const orders = buyer.totalOrders || 0;
  if (orders > 30) score += 5;
  else if (orders > 15) score += 3;


  if (buyer.segment === 'prime') score += 5;

  return Math.min(Math.max(score, 0), 100);
}

function calculateBudgetFit(buyer: Partial<IBuyerProfile>, productPrice: number): number {
  const min = buyer.budgetRange?.min || 0;
  const max = buyer.budgetRange?.max || 100000;

  if (productPrice >= min && productPrice <= max) {
    
    const mid = (min + max) / 2;
    const distance = Math.abs(productPrice - mid) / (max - min);
    return Math.round((1 - distance) * 100);
  } else if (productPrice < min) {
   
    return Math.max(60 - Math.round(((min - productPrice) / min) * 40), 20);
  } else {
    
    return Math.max(40 - Math.round(((productPrice - max) / max) * 40), 5);
  }
}

function calculateLogisticsAdvantage(): number {
 
  return 50 + Math.floor(Math.random() * 40);
}

function calculateSimilarBuyerSuccess(buyer: Partial<IBuyerProfile>, product: any): number {
  
  let score = 50;
  if (buyer.categoryPreferences?.includes(product.category)) score += 20;
  if (buyer.retentionScore && buyer.retentionScore > 80) score += 15;
  if (buyer.returnRate && buyer.returnRate < 0.10) score += 10;
  return Math.min(score, 100);
}

function calculateWishlistMatch(buyer: Partial<IBuyerProfile>, product: any): number {
  const wishlist = buyer.wishlist || [];
  const brand = product.brand?.toLowerCase() || '';
  const category = product.category?.toLowerCase() || '';

  let score = 0;
  for (const item of wishlist) {
    const lower = item.toLowerCase();
    if (lower.includes(brand)) score += 40;
    if (lower.includes(category)) score += 30;
  }

  
  const searches = buyer.searchHistory || [];
  for (const search of searches) {
    if (search.toLowerCase().includes(brand)) score += 15;
    if (search.toLowerCase().includes(category)) score += 10;
  }

  return Math.min(score, 100);
}

function calculateBuyerScore(buyer: Partial<IBuyerProfile>, product: any): IBuyerScoreEntry {
  const purchaseIntent = calculatePurchaseIntent(buyer, product);
  const retentionProbability = calculateRetentionProbability(buyer);
  const budgetFit = calculateBudgetFit(buyer, product.price);
  const logisticsAdvantage = calculateLogisticsAdvantage();
  const similarBuyerSuccess = calculateSimilarBuyerSuccess(buyer, product);
  const wishlistMatch = calculateWishlistMatch(buyer, product);

  const overallScore = Math.round(
    0.35 * purchaseIntent +
    0.25 * retentionProbability +
    0.15 * budgetFit +
    0.10 * logisticsAdvantage +
    0.10 * similarBuyerSuccess +
    0.05 * wishlistMatch
  );

  
  const signals: string[] = [];
  if (purchaseIntent >= 70) signals.push('High purchase intent');
  if (retentionProbability >= 80) signals.push('Strong retention history');
  if (budgetFit >= 70) signals.push('Budget aligned');
  if (wishlistMatch >= 50) signals.push('Wishlist/search match');
  if (buyer.segment === 'prime') signals.push('Prime member');
  if ((buyer.returnRate || 0) < 0.08) signals.push('Low return rate');

  return {
    buyerId: buyer.buyerId || '',
    buyerName: buyer.name || '',
    overallScore,
    purchaseIntent,
    retentionProbability,
    budgetFit,
    logisticsAdvantage,
    similarBuyerSuccess,
    wishlistMatch,
    signals,
    estimatedConversion: Math.round((overallScore / 100) * 0.85 * 100) / 100,
    rank: 0,
  };
}


function assessMatchQuality(scores: IBuyerScoreEntry[]): 'excellent' | 'good' | 'fair' | 'poor' {
  if (scores.length === 0) return 'poor';
  const topScore = scores[0]?.overallScore || 0;
  const avg = scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length;

  if (topScore >= 85 && avg >= 70) return 'excellent';
  if (topScore >= 70 && avg >= 55) return 'good';
  if (topScore >= 50) return 'fair';
  return 'poor';
}


export function validateInput(input: any): string[] {
  const errors: string[] = [];
  if (!input) { errors.push('Input required'); return errors; }
  if (!input.productId) errors.push('productId is required');
  if (!input.category) errors.push('category is required');
  if (input.price === undefined) errors.push('price is required');
  else if (input.price < 0) errors.push('price must be non-negative');
  if (!input.condition) errors.push('condition is required');
  return errors;
}
export async function matchBuyersToProduct(input: any): Promise<IBuyerScore> {
  const startTime = Date.now();

  const product = {
    productId: input.productId,
    category: input.category.toLowerCase(),
    brand: input.brand || 'Unknown',
    price: input.price,
    condition: input.condition,
    refurbishmentGrade: input.refurbishmentGrade || 'none',
  };

  const scoredBuyers: IBuyerScoreEntry[] = [];

  for (const buyer of SIMULATED_BUYERS) {
    const scored = calculateBuyerScore(buyer, product);
    scoredBuyers.push(scored);
  }

  scoredBuyers.sort((a, b) => b.overallScore - a.overallScore);
  const topBuyers = scoredBuyers.slice(0, 10);
  topBuyers.forEach((b, i) => { b.rank = i + 1; });

  const avgScore = topBuyers.reduce((sum, b) => sum + b.overallScore, 0) / topBuyers.length;
  const bestScore = topBuyers[0]?.overallScore || 0;
  const matchQuality = assessMatchQuality(topBuyers);
  const retentionPrediction = Math.round(topBuyers.slice(0, 3).reduce((sum, b) => sum + b.retentionProbability, 0) / 3);

  const processingTimeMs = Date.now() - startTime;

  const result = await BuyerScore.create({
    productId: input.productId,
    category: product.category,
    brand: product.brand,
    price: product.price,
    condition: product.condition,
    topBuyers,
    totalBuyersEvaluated: SIMULATED_BUYERS.length,
    avgMatchScore: Math.round(avgScore),
    bestMatchScore: bestScore,
    matchQuality,
    retentionPrediction,
    metadata: {
      engineVersion: '6.0.0',
      processingTimeMs,
      modelUsed: 'BuyerScoreV1',
      featuresEvaluated: 6,
    },
  });

  return result;
}

export async function getTopBuyers(productId: string): Promise<IBuyerScore | null> {
  return BuyerScore.findOne({ productId }).sort({ createdAt: -1 });
}

export async function getDashboardStats() {
  const totalMatches = await InventoryMatch.countDocuments();

  const recentMatches = await InventoryMatch.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const avgMatchScore =
    recentMatches.length > 0
      ? Math.round(
          recentMatches.reduce(
            (sum, match) => sum + (match.bestMatchScore || 0),
            0
          ) / recentMatches.length
        )
      : 0;

  const totalCostSaved = recentMatches.reduce(
    (sum, match) => sum + (match.costSaved?.totalSaved || 0),
    0
  );

  return {
    totalMatches,
    avgMatchScore,
    avgRetentionPrediction: 0,
    avgBestMatchScore: avgMatchScore,
    totalCostSaved,
    recentMatches,
  };
}

  
