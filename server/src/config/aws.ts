import { S3Client } from '@aws-sdk/client-s3';
import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { config } from './index';

const credentials = {
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
};

export const s3Client = new S3Client({
  region: config.aws.region,
  credentials,
});

export const rekognitionClient = new RekognitionClient({
  region: config.aws.region,
  credentials,
});

export const bedrockClient = new BedrockRuntimeClient({
  region: config.aws.region,
  credentials,
});
