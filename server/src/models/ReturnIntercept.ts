import mongoose, { Schema, Document } from 'mongoose';

export interface IRankedBuyer {
  buyerId: string;
  buyerName: string;
  matchScore: number;
  signals: string[];
  estimatedConversion: number;
  contactPriority: number;
}

export interface ICostSavings {
  warehouseHandling: number;
  storageCost: number;
  reverseLogistics: number;
  inventoryAging: number;
  totalSaved: number;
}

export interface IReturnIntercept extends Document {
  productId: string;
  interceptRecommended: boolean;
  demandScore: number;
  interceptConfidence: number;
  topBuyers: IRankedBuyer[];
  costSavings: ICostSavings;
  returnAge: number;
  productCondition: string;
  interceptStatus: 'pending' | 'matched' | 'shipped' | 'completed' | 'failed';
  assignedBuyerId: string | null;
  reasoning: string[];
  metadata: {
    engineVersion: string;
    processingTimeMs: number;
    buyersEvaluated: number;
    signalsProcessed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReturnInterceptSchema = new Schema<IReturnIntercept>(
  {
    productId: { type: String, required: true, index: true },
    interceptRecommended: { type: Boolean, required: true },
    demandScore: { type: Number, required: true, min: 0, max: 100 },
    interceptConfidence: { type: Number, required: true, min: 0, max: 1 },
    topBuyers: [{
      buyerId: String,
      buyerName: String,
      matchScore: Number,
      signals: [String],
      estimatedConversion: Number,
      contactPriority: Number,
    }],
    costSavings: {
      warehouseHandling: { type: Number, default: 0 },
      storageCost: { type: Number, default: 0 },
      reverseLogistics: { type: Number, default: 0 },
      inventoryAging: { type: Number, default: 0 },
      totalSaved: { type: Number, default: 0 },
    },
    returnAge: { type: Number, required: true },
    productCondition: { type: String, required: true },
    interceptStatus: {
      type: String,
      enum: ['pending', 'matched', 'shipped', 'completed', 'failed'],
      default: 'pending',
    },
    assignedBuyerId: { type: String, default: null },
    reasoning: { type: [String], default: [] },
    metadata: {
      engineVersion: { type: String, default: '5.0.0' },
      processingTimeMs: { type: Number },
      buyersEvaluated: { type: Number },
      signalsProcessed: { type: Number },
    },
  },
  { timestamps: true }
);

ReturnInterceptSchema.index({ interceptRecommended: 1, demandScore: -1 });
ReturnInterceptSchema.index({ interceptStatus: 1 });
ReturnInterceptSchema.index({ createdAt: -1 });

export const ReturnIntercept = mongoose.model<IReturnIntercept>('ReturnIntercept', ReturnInterceptSchema);
