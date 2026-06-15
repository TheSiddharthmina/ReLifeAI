import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchedProduct {
  productId: string;
  name: string;
  brand: string;
  price: number;
  conditionScore: number;
  batteryHealth: number;
  refurbishmentGrade: string;
  productAge: number;
  matchScore: number;
  matchBreakdown: {
    categoryFit: number;
    budgetFit: number;
    conditionFit: number;
    brandFit: number;
  };
}

export interface IInventoryMatch extends Document {
  buyerRequirementId: string;
  buyerId: string;
  buyerName: string;
  matchedProducts: IMatchedProduct[];
  bestMatchScore: number;
  totalMatches: number;
  notificationSent: boolean;
  notificationSentAt: Date | null;
  buyerResponse: 'pending' | 'interested' | 'purchased' | 'declined' | null;
  timeToMatch: number;
  costSaved: {
    warehouseStorage: number;
    handling: number;
    inventoryAging: number;
    totalSaved: number;
  };
  metadata: {
    engineVersion: string;
    processingTimeMs: number;
    inventoryScanned: number;
    requirementsMatched: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMatchSchema = new Schema<IInventoryMatch>(
  {
    buyerRequirementId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    matchedProducts: [{
      productId: String,
      name: String,
      brand: String,
      price: Number,
      conditionScore: Number,
      batteryHealth: Number,
      refurbishmentGrade: String,
      productAge: Number,
      matchScore: Number,
      matchBreakdown: {
        categoryFit: Number,
        budgetFit: Number,
        conditionFit: Number,
        brandFit: Number,
      },
    }],
    bestMatchScore: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    notificationSent: { type: Boolean, default: false },
    notificationSentAt: { type: Date, default: null },
    buyerResponse: { type: String, enum: ['pending', 'interested', 'purchased', 'declined', null], default: null },
    timeToMatch: { type: Number, default: 0 },
    costSaved: {
      warehouseStorage: { type: Number, default: 0 },
      handling: { type: Number, default: 0 },
      inventoryAging: { type: Number, default: 0 },
      totalSaved: { type: Number, default: 0 },
    },
    metadata: {
      engineVersion: { type: String, default: '8.0.0' },
      processingTimeMs: { type: Number },
      inventoryScanned: { type: Number },
      requirementsMatched: { type: Number },
    },
  },
  { timestamps: true }
);

InventoryMatchSchema.index({ bestMatchScore: -1 });
InventoryMatchSchema.index({ createdAt: -1 });

export const InventoryMatch = mongoose.model<IInventoryMatch>('InventoryMatch', InventoryMatchSchema);
