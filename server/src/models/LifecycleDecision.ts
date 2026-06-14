import mongoose, { Schema, Document, Types } from 'mongoose';

export type LifecycleAction = 'resell' | 'refurbish' | 'donate' | 'recycle' | 'compost';

export interface ILifecycleDecision extends Document {
  productId: Types.ObjectId;
  passportId: Types.ObjectId;
  decision: LifecycleAction;
  confidence: number;
  reasoning: string;
  estimatedRecoveredValue: number;
  carbonSaved: number;
  wasteDiverted: number;
  recommendedMarket: string;
  createdAt: Date;
  updatedAt: Date;
}

const LifecycleDecisionSchema = new Schema<ILifecycleDecision>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    passportId: { type: Schema.Types.ObjectId, ref: 'ProductPassport', required: true },
    decision: { type: String, required: true, enum: ['resell', 'refurbish', 'donate', 'recycle', 'compost'] },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    reasoning: { type: String, required: true },
    estimatedRecoveredValue: { type: Number, required: true, min: 0 },
    carbonSaved: { type: Number, required: true, min: 0 },
    wasteDiverted: { type: Number, required: true, min: 0 },
    recommendedMarket: { type: String, required: true },
  },
  { timestamps: true }
);

LifecycleDecisionSchema.index({ productId: 1 }, { unique: true });
LifecycleDecisionSchema.index({ decision: 1 });

export const LifecycleDecision = mongoose.model<ILifecycleDecision>('LifecycleDecision', LifecycleDecisionSchema);
