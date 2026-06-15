import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryBreakdown {
  category: string;
  count: number;
}

export interface ILifecycleBreakdown {
  decision: string;
  count: number;
  totalValue: number;
}

export interface IImpactMetrics extends Document {
  totalProductsProcessed: number;
  totalCarbonSaved: number;
  totalWasteDiverted: number;
  totalRecoveredValue: number;
  categoryBreakdown: ICategoryBreakdown[];
  lifecycleBreakdown: ILifecycleBreakdown[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImpactMetricsSchema = new Schema<IImpactMetrics>(
  {
    totalProductsProcessed: { type: Number, default: 0, min: 0 },
    totalCarbonSaved: { type: Number, default: 0, min: 0 },
    totalWasteDiverted: { type: Number, default: 0, min: 0 },
    totalRecoveredValue: { type: Number, default: 0, min: 0 },
    categoryBreakdown: [{ category: { type: String, required: true }, count: { type: Number, default: 0 } }],
    lifecycleBreakdown: [{ decision: { type: String, required: true }, count: { type: Number, default: 0 }, totalValue: { type: Number, default: 0 } }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ImpactMetrics = mongoose.model<IImpactMetrics>('ImpactMetrics', ImpactMetricsSchema);
