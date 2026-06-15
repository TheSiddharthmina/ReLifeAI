import { Types } from 'mongoose';
import { ProductPassport, IProductPassport, IProduct } from '../models';
import { VisionAnalysis } from './visionService';

export async function generatePassport(product: IProduct, analysis: VisionAnalysis): Promise<IProductPassport> {
  const passport = await ProductPassport.create({
    productId: (product as any)._id as Types.ObjectId,
    conditionScore: analysis.conditionScore,
    defects: analysis.defects,
    resalePotential: analysis.resalePotential,
    sustainabilityScore: analysis.sustainabilityScore,
    repairabilityScore: analysis.repairabilityScore,
    estimatedLifespan: analysis.estimatedLifespan,
    materials: analysis.materials,
    aiSummary: analysis.aiSummary,
    rekognitionResults: analysis.rekognitionResults,
    bedrockAssessment: analysis.bedrockAssessment,
    analysisMetadata: analysis.analysisMetadata,
    confidenceScores: {
      overall: analysis.confidence,
      condition: analysis.bedrockAssessment.confidence,
      defectDetection: analysis.rekognitionResults.length > 0
        ? analysis.rekognitionResults[0].labels.filter((l) => l.confidence > 80).length / Math.max(analysis.rekognitionResults[0].labels.length, 1)
        : 0,
      materialIdentification: analysis.materials.length > 0 ? analysis.confidence : 0,
    },
  });

  return passport;
}
