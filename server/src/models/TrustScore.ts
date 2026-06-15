import mongoose, { Schema, Document } from 'mongoose';

export interface IComponentTest {
  component: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: string;
}

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ITrustScore extends Document {
  productId: string;
  trustScore: number;
  componentTests: IComponentTest[];
  remainingUsefulLife: number;
  failureProbability: number;
  warrantyInfo: {
    duration: number;
    coverage: string;
    expiresAt: Date | null;
  };
  inspectionSummary: string;
  refurbishmentSummary: string;
  chatHistory: IChatMessage[];
  metadata: {
    engineVersion: string;
    processingTimeMs: number;
    dataSourcesUsed: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const TrustScoreSchema = new Schema<ITrustScore>(
  {
    productId: { type: String, required: true, index: true },
    trustScore: { type: Number, required: true, min: 0, max: 100 },
    componentTests: [{
      component: String,
      status: { type: String, enum: ['passed', 'failed', 'warning'] },
      score: Number,
      details: String,
    }],
    remainingUsefulLife: { type: Number, required: true },
    failureProbability: { type: Number, required: true, min: 0, max: 1 },
    warrantyInfo: {
      duration: { type: Number, default: 0 },
      coverage: { type: String, default: 'none' },
      expiresAt: { type: Date, default: null },
    },
    inspectionSummary: { type: String, default: '' },
    refurbishmentSummary: { type: String, default: '' },
    chatHistory: [{
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: { type: Date, default: Date.now },
    }],
    metadata: {
      engineVersion: { type: String, default: '7.0.0' },
      processingTimeMs: { type: Number },
      dataSourcesUsed: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

TrustScoreSchema.index({ productId: 1, createdAt: -1 });
TrustScoreSchema.index({ trustScore: -1 });

export const TrustScore = mongoose.model<ITrustScore>('TrustScore', TrustScoreSchema);
