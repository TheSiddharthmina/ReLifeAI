export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor' | 'damaged';

export type ProductCategory = 'electronics' | 'clothing' | 'furniture' | 'appliances' | 'toys' | 'books' | 'sports' | 'beauty' | 'food' | 'other';

export type LifecycleAction = 'RESALE' | 'REPAIR' | 'REFURBISH' | 'RECYCLE' | 'DONATE';

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  description: string;
  condition: ProductCondition;
  returnReason: string;
  imageUrls: string[];
  brand?: string;
  originalPrice?: number;
  weight?: number;
  createdAt: string;
}

export interface ProductPassport {
  _id: string;
  productId: string;
  conditionScore: number;
  defects: string[];
  resalePotential: number;
  sustainabilityScore: number;
  repairabilityScore: number;
  estimatedLifespan: number;
  materials: string[];
  aiSummary: string;
}

export interface LifecycleDecision {
  _id: string;
  productId: string;
  decision: LifecycleAction;
  confidence: number;
  reasoning: string[];
  estimatedRecoveredValue: number;
  carbonSaved: number;
  wasteDiverted: number;
  recommendedMarket: string;
}

export interface DashboardMetrics {
  totalProductsProcessed: number;
  totalRecoveredValue: number;
  totalCarbonSaved: number;
  totalWasteDiverted: number;
  categoryBreakdown: { category: string; count: number }[];
  lifecycleBreakdown: { decision: string; count: number; totalValue: number }[];
}
