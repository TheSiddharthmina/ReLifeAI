import {
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
  DetectTextCommand,
} from '@aws-sdk/client-rekognition';
import { rekognitionClient } from '../config/aws';
import { config } from '../config';
import { IRekognitionResult } from '../models';

export async function analyzeImage(s3Key: string): Promise<IRekognitionResult> {
  const imageRef = {
    S3Object: {
      Bucket: config.aws.s3Bucket,
      Name: s3Key,
    },
  };

  // Run all detections in parallel
  const [labelsResponse, moderationResponse, textResponse] = await Promise.all([
    rekognitionClient.send(
      new DetectLabelsCommand({
        Image: imageRef,
        MaxLabels: 50,
        MinConfidence: 60,
        Features: ['GENERAL_LABELS', 'IMAGE_PROPERTIES'],
      })
    ),
    rekognitionClient.send(
      new DetectModerationLabelsCommand({
        Image: imageRef,
        MinConfidence: 60,
      })
    ),
    rekognitionClient.send(
      new DetectTextCommand({
        Image: imageRef,
      })
    ),
  ]);

  // Extract labels
  const labels = (labelsResponse.Labels || []).map((l) => ({
    name: l.Name || '',
    confidence: l.Confidence || 0,
  }));

  // Extract moderation labels
  const moderationLabels = (moderationResponse.ModerationLabels || []).map((l) => ({
    name: l.Name || '',
    confidence: l.Confidence || 0,
  }));

  // Extract image properties
  const imgProps = labelsResponse.ImageProperties;
  const dominantColors = (imgProps?.DominantColors || []).slice(0, 5).map((c) => ({
    color: `rgb(${c.Red || 0}, ${c.Green || 0}, ${c.Blue || 0})`,
    percentage: c.PixelPercent || 0,
  }));

  const foreground = imgProps?.Foreground;
  const sharpness = foreground?.Quality?.Sharpness || 0;
  const brightness = foreground?.Quality?.Brightness || 0;
  const contrast = foreground?.Quality?.Contrast || 0;

  // Extract text
  const textDetections = (textResponse.TextDetections || [])
    .filter((t) => t.Type === 'LINE')
    .map((t) => t.DetectedText || '')
    .filter((t) => t.length > 0);

  return {
    labels,
    moderationLabels,
    imageProperties: {
      dominantColors,
      sharpness,
      brightness,
      contrast,
    },
    textDetections,
  };
}

export async function analyzeMultipleImages(s3Keys: string[]): Promise<IRekognitionResult[]> {
  const results = await Promise.all(s3Keys.map((key) => analyzeImage(key)));
  return results;
}
