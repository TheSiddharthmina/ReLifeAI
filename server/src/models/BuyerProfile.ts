import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyerProfile extends Document {
  buyerId: string;
  name: string;
  email: string;
  segment: 'prime' | 'standard' | 'new';
  purchaseHistory: {
    category: string;
    brand: string;
    price: number;
    date: Date;
    returned: boolean;
  }[];
  searchHistory: string[];
  wishlist: string[];
  budgetRange: { min: number; max: number };
  brandPreferences: string[];
  categoryPreferences: string[];
  returnHistory: {
    productId: string;
    reason: string;
    date: Date;
  }[];
  returnRate: number;
  avgOrderValue: number;
  totalOrders: number;
  retentionScore: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BuyerProfileSchema = new Schema<IBuyerProfile>(
  {
    buyerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    segment: { type: String, enum: ['prime', 'standard', 'new'], default: 'standard' },
    purchaseHistory: [{
      category: String,
      brand: String,
      price: Number,
      date: Date,
      returned: { type: Boolean, default: false },
    }],
    searchHistory: { type: [String], default: [] },
    wishlist: { type: [String], default: [] },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100000 },
    },
    brandPreferences: { type: [String], default: [] },
    categoryPreferences: { type: [String], default: [] },
    returnHistory: [{
      productId: String,
      reason: String,
      date: Date,
    }],
    returnRate: { type: Number, default: 0, min: 0, max: 1 },
    avgOrderValue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    retentionScore: { type: Number, default: 50, min: 0, max: 100 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BuyerProfileSchema.index({ segment: 1, retentionScore: -1 });
BuyerProfileSchema.index({ categoryPreferences: 1 });
BuyerProfileSchema.index({ brandPreferences: 1 });

export const BuyerProfile = mongoose.model<IBuyerProfile>('BuyerProfile', BuyerProfileSchema);
