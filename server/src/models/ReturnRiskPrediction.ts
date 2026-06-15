import mongoose, { Schema, Document, Types } from 'mongoose';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IFeatureVector {
  category: string;
  brand: string;
  productAgeMonths: number;
  refurbishmentGrade: string;
  conditionScore: number;
  partsReplaced: string[];
  historicalReturnReasons: string[];
  historicalReturnRate: number;
  warrantyDurationMonths: number;
  demandScore: number;
  customerSegment: string;
  customerReturnHistory: number;
  pricePoint: number;
}

export interface IModelResult {
  modelName: string;
  probability: number;
  confidence: number;
  featureImportance: { feature: string; importance: number }[];
}

export interface IReturnRiskPrediction extends Document {
  productId: string;
  returnProbability: number;
  riskLevel: RiskLevel;
  confidence: number;
  featureVector: IFeatureVector;
  modelResults: IModelResult[];
  selectedModel: string;
  riskFactors: string[];
  mitigationSuggestions: string[];
  metadata: {
    engineVersion: string;
    processingTimeMs: number;
    modelsEvaluated: number;
    trainingDataSize: number;
    lastRetrainedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReturnRiskPredictionSchema = new Schema<IReturnRiskPrediction>(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    returnProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    featureVector: {
      category: { type: String, required: true },
      brand: { type: String, default: 'Unknown' },
      productAgeMonths: { type: Number, required: true },
      refurbishmentGrade: { type: String, default: 'none' },
      conditionScore: { type: Number, required: true },
      partsReplaced: { type: [String], default: [] },
      historicalReturnReasons: { type: [String], default: [] },
      historicalReturnRate: { type: Number, default: 0 },
      warrantyDurationMonths: { type: Number, default: 0 },
      demandScore: { type: Number, default: 50 },
      customerSegment: { type: String, default: 'standard' },
      customerReturnHistory: { type: Number, default: 0 },
      pricePoint: { type: Number, default: 0 },
    },
    modelResults: [{
      modelName: { type: String },
      probability: { type: Number },
      confidence: { type: Number },
      featureImportance: [{ feature: String, importance: Number }],
    }],
    selectedModel: {
      type: String,
      required: true,
    },
    riskFactors: {
      type: [String],
      default: [],
    },
    mitigationSuggestions: {
      type: [String],
      default: [],
    },
    metadata: {
      engineVersion: { type: String, default: '4.0.0' },
      processingTimeMs: { type: Number },
      modelsEvaluated: { type: Number },
      trainingDataSize: { type: Number, default: 50000 },
      lastRetrainedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

ReturnRiskPredictionSchema.index({ productId: 1, createdAt: -1 });
ReturnRiskPredictionSchema.index({ riskLevel: 1 });
ReturnRiskPredictionSchema.index({ returnProbability: -1 });
ReturnRiskPredictionSchema.index({ createdAt: -1 });

export const ReturnRiskPrediction = mongoose.model<IReturnRiskPrediction>(
  'ReturnRiskPrediction',
  ReturnRiskPredictionSchema
);
