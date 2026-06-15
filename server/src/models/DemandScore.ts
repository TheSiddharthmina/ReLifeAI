import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyerSignal {
  buyerId: string;
  buyerName: string;
  signalType: 'wishlist' | 'search' | 'view' | 'cart_abandon' | 'similar_interest';
  signalStrength: number;
  timestamp: Date;
  metadata: {
    searchQuery?: string;
    viewDuration?: number;
    cartValue?: number;
    similarProductId?: string;
  };
}

export interface IDemandScore extends Document {
  productId: string;
  category: string;
  brand: string;
  demandHeatScore: number;
  wishlistCount: number;
  searchCount: number;
  viewCount: number;
  cartAbandonCount: number;
  similarInterestCount: number;
  buyerSignals: IBuyerSignal[];
  trendDirection: 'rising' | 'stable' | 'declining';
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DemandScoreSchema = new Schema<IDemandScore>(
  {
    productId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    brand: { type: String, default: 'Unknown' },
    demandHeatScore: { type: Number, required: true, min: 0, max: 100 },
    wishlistCount: { type: Number, default: 0 },
    searchCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    cartAbandonCount: { type: Number, default: 0 },
    similarInterestCount: { type: Number, default: 0 },
    buyerSignals: [{
      buyerId: String,
      buyerName: String,
      signalType: { type: String, enum: ['wishlist', 'search', 'view', 'cart_abandon', 'similar_interest'] },
      signalStrength: Number,
      timestamp: Date,
      metadata: Schema.Types.Mixed,
    }],
    trendDirection: { type: String, enum: ['rising', 'stable', 'declining'], default: 'stable' },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DemandScoreSchema.index({ demandHeatScore: -1 });
DemandScoreSchema.index({ category: 1, demandHeatScore: -1 });

export const DemandScore = mongoose.model<IDemandScore>('DemandScore', DemandScoreSchema);
