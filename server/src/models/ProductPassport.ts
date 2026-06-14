import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRekognitionResult {
  labels: { name: string; confidence: number }[];
  moderationLabels: { name: string; confidence: number }[];
  imageProperties: {
    dominantColors: { color: string; percentage: number }[];
    sharpness: number;
    brightness: number;
    contrast: number;
  };
  textDetections: string[];
}

export interface IBedrockAssessment {
  category: string;
  conditionScore: number;
  repairabilityScore: number;
  resalePotential: number;
  sustainabilityScore: number;
  estimatedLifespan: number;
  defects: string[];
  limitations: string[];
  materials: string[];
  confidence: number;
  aiSummary: string;
  rawResponse: string;
}

export interface IAnalysisMetadata {
  analysisTimestamp: Date;
  rekognitionDuration: number;
  bedrockDuration: number;
  totalDuration: number;
  imagesAnalyzed: number;
  modelVersion: string;
}

export interface IProductPassport extends Document {
  productId: Types.ObjectId;
  conditionScore: number;
  defects: string[];
  resalePotential: number;
  sustainabilityScore: number;
  repairabilityScore: number;
  estimatedLifespan: number;
  materials: string[];
  aiSummary: string;
  rekognitionResults: IRekognitionResult[];
  bedrockAssessment: IBedrockAssessment;
  analysisMetadata: IAnalysisMetadata;
  confidenceScores: {
    overall: number;
    condition: number;
    defectDetection: number;
    materialIdentification: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductPassportSchema = new Schema<IProductPassport>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    conditionScore: { type: Number, required: true, min: 0, max: 100 },
    defects: { type: [String], default: [] },
    resalePotential: { type: Number, required: true, min: 0, max: 100 },
    sustainabilityScore: { type: Number, required: true, min: 0, max: 100 },
    repairabilityScore: { type: Number, required: true, min: 0, max: 100 },
    estimatedLifespan: { type: Number, required: true, min: 0 },
    materials: { type: [String], default: [] },
    aiSummary: { type: String, required: true },
    rekognitionResults: { type: Schema.Types.Mixed, default: [] },
    bedrockAssessment: { type: Schema.Types.Mixed, default: {} },
    analysisMetadata: { type: Schema.Types.Mixed, default: {} },
    confidenceScores: {
      overall: { type: Number, default: 0 },
      condition: { type: Number, default: 0 },
      defectDetection: { type: Number, default: 0 },
      materialIdentification: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const ProductPassport = mongoose.model<IProductPassport>('ProductPassport', ProductPassportSchema);
