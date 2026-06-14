import { IProduct, IRekognitionResult, IBedrockAssessment } from '../models';
import * as s3Service from './s3Service';
import * as rekognitionService from './rekognitionService';
import * as bedrockService from './bedrockService';

export interface VisionAnalysis {
  conditionScore: number;
  defects: string[];
  repairabilityScore: number;
  estimatedLifespan: number;
  materials: string[];
  resalePotential: number;
  sustainabilityScore: number;
  confidence: number;
  aiSummary: string;
  rekognitionResults: IRekognitionResult[];
  bedrockAssessment: IBedrockAssessment;
  analysisMetadata: {
    analysisTimestamp: Date;
    rekognitionDuration: number;
    bedrockDuration: number;
    totalDuration: number;
    imagesAnalyzed: number;
    modelVersion: string;
  };
}

export async function analyzeProduct(
  product: IProduct,
  uploadedFiles: { buffer: Buffer; originalname: string; mimetype: string }[]
): Promise<VisionAnalysis> {
  const totalStart = Date.now();

  // Step 1: Upload images to S3
  const uploadResults = await s3Service.uploadMultipleImages(
    uploadedFiles,
    (product as any)._id.toString()
  );

  // Store S3 URLs and keys on product
  product.imageUrls = uploadResults.map((r) => r.url);
  product.s3Keys = uploadResults.map((r) => r.key);
  await product.save();

  // Step 2: Run Rekognition on all images
  const rekognitionStart = Date.now();
  const rekognitionResults = await rekognitionService.analyzeMultipleImages(
    uploadResults.map((r) => r.key)
  );
  const rekognitionDuration = Date.now() - rekognitionStart;

  // Step 3: Send to Bedrock for AI assessment
  const bedrockStart = Date.now();
  const bedrockAssessment = await bedrockService.assessProduct(product, rekognitionResults);
  const bedrockDuration = Date.now() - bedrockStart;

  const totalDuration = Date.now() - totalStart;

  return {
    conditionScore: bedrockAssessment.conditionScore,
    defects: bedrockAssessment.defects,
    repairabilityScore: bedrockAssessment.repairabilityScore,
    estimatedLifespan: bedrockAssessment.estimatedLifespan,
    materials: bedrockAssessment.materials,
    resalePotential: bedrockAssessment.resalePotential,
    sustainabilityScore: bedrockAssessment.sustainabilityScore,
    confidence: bedrockAssessment.confidence,
    aiSummary: bedrockAssessment.aiSummary,
    rekognitionResults,
    bedrockAssessment,
    analysisMetadata: {
      analysisTimestamp: new Date(),
      rekognitionDuration,
      bedrockDuration,
      totalDuration,
      imagesAnalyzed: uploadedFiles.length,
     modelVersion: 'claude-sonnet-4-6',
    },
  };
}
