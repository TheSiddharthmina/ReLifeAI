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

function getConditionScore(condition?: string): number {
  switch (condition) {
    case 'new':
      return 95;
    case 'like_new':
      return 90;
    case 'good':
      return 80;
    case 'fair':
      return 60;
    case 'poor':
      return 40;
    case 'damaged':
      return 20;
    default:
      return 70;
  }
}

function buildFallbackAssessment(
  product: IProduct,
  rekognitionResults: IRekognitionResult[]
): IBedrockAssessment {
  const conditionScore = getConditionScore((product as any).condition);

  const labels = rekognitionResults
    .flatMap((r: any) => r.labels || [])
    .map((label: any) => label.Name || label.name)
    .filter(Boolean);

  const uniqueLabels = [...new Set(labels)].slice(0, 8);

  return {
    conditionScore,
    defects:
      conditionScore < 50
        ? ['Visible wear or damage requires manual inspection']
        : ['No major defects detected from automated fallback'],
    repairabilityScore:
      conditionScore >= 80 ? 85 : conditionScore >= 60 ? 65 : 45,
    estimatedLifespan:
      conditionScore >= 80 ? 24 : conditionScore >= 60 ? 12 : 6,
    materials: uniqueLabels.length > 0 ? uniqueLabels : ['Unknown material composition'],
    resalePotential:
      conditionScore >= 80 ? 88 : conditionScore >= 60 ? 68 : 42,
    sustainabilityScore:
      conditionScore >= 80 ? 90 : conditionScore >= 60 ? 75 : 55,
    confidence: 0.72,
    aiSummary:
      'Fallback assessment generated using product condition and Rekognition labels because Bedrock model access is currently unavailable.',
  } as IBedrockAssessment;
}

export async function analyzeProduct(
  product: IProduct,
  uploadedFiles: { buffer: Buffer; originalname: string; mimetype: string }[]
): Promise<VisionAnalysis> {
  const totalStart = Date.now();

  const uploadResults = await s3Service.uploadMultipleImages(
    uploadedFiles,
    (product as any)._id.toString()
  );

  product.imageUrls = uploadResults.map((r) => r.url);
  product.s3Keys = uploadResults.map((r) => r.key);
  await product.save();

  const rekognitionStart = Date.now();
  const rekognitionResults = await rekognitionService.analyzeMultipleImages(
    uploadResults.map((r) => r.key)
  );
  const rekognitionDuration = Date.now() - rekognitionStart;

  const bedrockStart = Date.now();
  let bedrockAssessment: IBedrockAssessment;
  let modelVersion = 'claude-sonnet-4-6';

  try {
    bedrockAssessment = await bedrockService.assessProduct(product, rekognitionResults);
  } catch (error: any) {
    console.warn(
      '[Vision] Bedrock unavailable, using fallback assessment:',
      error?.message || error
    );

    bedrockAssessment = buildFallbackAssessment(product, rekognitionResults);
    modelVersion = 'fallback-rekognition-rule-engine';
  }

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
      modelVersion,
    },
  };
}
