import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient } from '../config/aws';
import { config } from '../config';
import { IProduct, IRekognitionResult, IBedrockAssessment } from '../models';

function buildPrompt(product: IProduct, rekognitionResults: IRekognitionResult[]): string {
  const labelsStr = rekognitionResults
    .flatMap((r) => r.labels)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 30)
    .map((l) => `${l.name} (${l.confidence.toFixed(1)}%)`)
    .join(', ');

  const textStr = rekognitionResults
    .flatMap((r) => r.textDetections)
    .join(', ');

  const colorsStr = rekognitionResults
    .flatMap((r) => r.imageProperties.dominantColors)
    .slice(0, 5)
    .map((c) => `${c.color} (${c.percentage.toFixed(1)}%)`)
    .join(', ');

  const avgSharpness = rekognitionResults.reduce((sum, r) => sum + r.imageProperties.sharpness, 0) / rekognitionResults.length;
  const avgBrightness = rekognitionResults.reduce((sum, r) => sum + r.imageProperties.brightness, 0) / rekognitionResults.length;

  return `You are an expert product condition assessor for a circular commerce platform. Analyze the following returned product based on computer vision data.

PRODUCT INFORMATION:
- Name: ${product.name}
- Category: ${product.category}
- Reported Condition: ${product.condition}
- Return Reason: ${product.returnReason}
- Brand: ${product.brand || 'Unknown'}
- Original Price: $${product.originalPrice || 'Unknown'}
- Weight: ${product.weight || 'Unknown'}g
- Description: ${product.description || 'None'}

IMAGE ANALYSIS DATA (from AWS Rekognition):
- Detected Labels: ${labelsStr}
- Text Found: ${textStr || 'None'}
- Dominant Colors: ${colorsStr}
- Image Sharpness: ${avgSharpness.toFixed(1)}
- Image Brightness: ${avgBrightness.toFixed(1)}
- Number of Images Analyzed: ${rekognitionResults.length}

Based on this evidence, provide a comprehensive condition assessment.

IMPORTANT RULES:
- Derive all scores only from visible image evidence and provided product data.
- Do NOT use hardcoded values or random numbers.
- Do NOT infer battery degradation, internal hardware faults, water damage, screen burn-in, motherboard issues, or functional defects unless directly visible.
- Only report defects that can be visually observed from the images.
- If a defect cannot be determined from images, explicitly state "cannot be determined from images".
- If only one image is provided, reduce confidence and mention limited inspection coverage.
- Avoid speculation and focus on evidence-based observations.

Consider:
- Visible scratches, dents, cracks, discoloration, stains, missing parts.
- Surface wear and cosmetic condition.
- Product completeness and packaging condition.
- Category-specific visible damage indicators.
- Confidence level based on image quality and number of images.

Respond ONLY with valid JSON in this exact format:
{
   "category": "${product.category}",
  "conditionScore": <0-100 based on visual evidence>,
  "repairabilityScore": <0-100 based on damage type and category>,
  "resalePotential": <0-100 based on condition + market demand>,
  "sustainabilityScore": <0-100 based on materials + reuse potential>,
  "estimatedLifespan": <months remaining based on condition>,
  "defects": [<ONLY visually verified defects>],
  "limitations": [<things that cannot be determined from images>],
  "materials": [<list of materials identified from visual analysis>],
  "confidence": <0.0-1.0 confidence in this assessment>,
  "aiSummary": "<2-3 sentence summary of product condition and recommended action>"
}`;
}

export async function assessProduct(
  product: IProduct,
  rekognitionResults: IRekognitionResult[]
): Promise<IBedrockAssessment> {
  const prompt = buildPrompt(product, rekognitionResults);

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const response = await bedrockClient.send(
    new InvokeModelCommand({
      modelId: config.aws.bedrockModelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const rawText = responseBody.content[0].text;

  
  let jsonStr = rawText;
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const assessment = JSON.parse(jsonStr);

 
 return {
  category: assessment.category || product.category,
  conditionScore: Math.max(0, Math.min(100, Number(assessment.conditionScore) || 50)),
  repairabilityScore: Math.max(0, Math.min(100, Number(assessment.repairabilityScore) || 50)),
  resalePotential: Math.max(0, Math.min(100, Number(assessment.resalePotential) || 50)),
  sustainabilityScore: Math.max(0, Math.min(100, Number(assessment.sustainabilityScore) || 50)),
  estimatedLifespan: Math.max(0, Number(assessment.estimatedLifespan) || 12),

  defects: Array.isArray(assessment.defects)
    ? assessment.defects
    : [],

  limitations: Array.isArray(assessment.limitations)
    ? assessment.limitations
    : [],

  materials: Array.isArray(assessment.materials)
    ? assessment.materials
    : [],

  confidence: Math.max(0, Math.min(1, Number(assessment.confidence) || 0.5)),
  aiSummary: assessment.aiSummary || 'Assessment completed.',
  rawResponse: rawText,
};
}
