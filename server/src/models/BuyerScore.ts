import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyerScoreEntry {
  buyerId: string;
  buyerName: string;
  overallScore: number;
  purchaseIntent: number;
  retentionProbability: number;
  budgetFit: number;
  logisticsAdvantage: number;
  similarBuyerSuccess: number;
  wishlistMatch: number;
  signals: string[];
  estimatedConversion: number;
  rank: number;
}

export interface IBuyerScore extends Document {
  productId: string;
  category: string;
  brand: string;
  price: number;
  condition: string;
  topBuyers: IBuyerScoreEntry[];
  totalBuyersEvaluated: number;
  avgMatchScore: number;
  bestMatchScore: number;
  matchQuality: 'excellent' | 'good' | 'fair' | 'poor';
  retentionPrediction: number;
  metadata: {
    engineVersion: string;
    processingTimeMs: number;
    modelUsed: string;
    featuresEvaluated: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BuyerScoreSchema = new Schema<IBuyerScore>(
  {
    productId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    brand: { type: String, default: 'Unknown' },
    price: { type: Number, required: true },
    condition: { type: String, required: true },
    topBuyers: [{
      buyerId: String,
      buyerName: String,
      overallScore: Number,
      purchaseIntent: Number,
      retentionProbability: Number,
      budgetFit: Number,
      logisticsAdvantage: Number,
      similarBuyerSuccess: Number,
      wishlistMatch: Number,
      signals: [String],
      estimatedConversion: Number,
      rank: Number,
    }],
    totalBuyersEvaluated: { type: Number, default: 0 },
    avgMatchScore: { type: Number, default: 0 },
    bestMatchScore: { type: Number, default: 0 },
    matchQuality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'fair' },
    retentionPrediction: { type: Number, default: 0 },
    metadata: {
      engineVersion: { type: String, default: '6.0.0' },
      processingTimeMs: { type: Number },
      modelUsed: { type: String, default: 'BuyerScoreV1' },
      featuresEvaluated: { type: Number },
    },
  },
  { timestamps: true }
);

BuyerScoreSchema.index({ productId: 1, createdAt: -1 });
BuyerScoreSchema.index({ bestMatchScore: -1 });

export const BuyerScore = mongoose.model<IBuyerScore>('BuyerScore', BuyerScoreSchema);
