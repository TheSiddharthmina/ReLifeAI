import { Router } from 'express';
import { ReturnRiskPrediction } from '../models/ReturnRiskPrediction';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, engine: 'return-risk' });
});

router.get('/dashboard/stats', async (_req, res) => {
  const totalPredictions = await ReturnRiskPrediction.countDocuments();

  const highRiskProducts = await ReturnRiskPrediction.find({ riskLevel: 'HIGH' })
    .sort({ returnProbability: -1 })
    .limit(10)
    .lean();

  const [avg] = await ReturnRiskPrediction.aggregate([
    {
      $group: {
        _id: null,
        avgReturnProbability: { $avg: '$returnProbability' },
        avgConfidence: { $avg: '$confidence' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalPredictions,
      avgReturnProbability: avg?.avgReturnProbability || 0,
      highRiskProducts,
      avgConfidence: avg?.avgConfidence || 0,
    },
  });
});

export default router;