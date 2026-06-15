import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyerRequirement extends Document {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  brandPreferences: string[];
  minConditionScore: number;
  minBatteryHealth: number;
  warrantyRequired: boolean;
  minWarrantyMonths: number;
  maxProductAge: number;
  acceptableGrades: string[];
  additionalNotes: string;
  status: 'active' | 'matched' | 'fulfilled' | 'expired';
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BuyerRequirementSchema = new Schema<IBuyerRequirement>(
  {
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    category: { type: String, required: true, index: true },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    brandPreferences: { type: [String], default: [] },
    minConditionScore: { type: Number, default: 60, min: 0, max: 100 },
    minBatteryHealth: { type: Number, default: 70, min: 0, max: 100 },
    warrantyRequired: { type: Boolean, default: false },
    minWarrantyMonths: { type: Number, default: 0 },
    maxProductAge: { type: Number, default: 36 },
    acceptableGrades: { type: [String], default: ['grade_a', 'grade_b'] },
    additionalNotes: { type: String, default: '' },
    status: { type: String, enum: ['active', 'matched', 'fulfilled', 'expired'], default: 'active' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BuyerRequirementSchema.index({ status: 1, category: 1 });
BuyerRequirementSchema.index({ createdAt: -1 });

export const BuyerRequirement = mongoose.model<IBuyerRequirement>('BuyerRequirement', BuyerRequirementSchema);
