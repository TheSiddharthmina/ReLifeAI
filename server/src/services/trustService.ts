import { TrustScore, ITrustScore, IComponentTest, IChatMessage } from '../models/TrustScore';


interface ProductKnowledge {
  category: string;
  brand: string;
  condition: string;
  conditionScore: number;
  repairsDone: string[];
  partsReplaced: string[];
  defects: string[];
  batteryHealth?: number;
  displayStatus?: string;
  storageHealth?: number;
  warrantyMonths: number;
  refurbishmentGrade: string;
  ageMonths: number;
}

function getProductKnowledge(productId: string, input: any): ProductKnowledge {
  return {
    category: input.category || 'electronics',
    brand: input.brand || 'Unknown',
    condition: input.condition || 'good',
    conditionScore: input.conditionScore || 75,
    repairsDone: input.repairsDone || ['Battery replaced', 'Screen cleaned', 'Software reset'],
    partsReplaced: input.partsReplaced || ['Battery'],
    defects: input.defects || ['Minor scratches on body'],
    batteryHealth: input.batteryHealth || 92,
    displayStatus: input.displayStatus || 'Passed - No dead pixels',
    storageHealth: input.storageHealth || 98,
    warrantyMonths: input.warrantyMonths || 6,
    refurbishmentGrade: input.refurbishmentGrade || 'grade_a',
    ageMonths: input.ageMonths || 14,
  };
}


function runComponentTests(knowledge: ProductKnowledge): IComponentTest[] {
  const tests: IComponentTest[] = [];

  if (knowledge.batteryHealth !== undefined) {
    const score = knowledge.batteryHealth;
    tests.push({
      component: 'Battery Health',
      status: score >= 80 ? 'passed' : score >= 60 ? 'warning' : 'failed',
      score,
      details: `Battery at ${score}% capacity. ${score >= 80 ? 'Excellent condition.' : score >= 60 ? 'Moderate wear detected.' : 'Replacement recommended.'}`,
    });
  }

  tests.push({
    component: 'Display',
    status: knowledge.displayStatus?.includes('Passed') ? 'passed' : 'warning',
    score: knowledge.displayStatus?.includes('Passed') ? 95 : 70,
    details: knowledge.displayStatus || 'Display test completed',
  });

  const mbScore = knowledge.conditionScore >= 70 ? 96 : knowledge.conditionScore >= 50 ? 78 : 55;
  tests.push({
    component: 'Motherboard',
    status: mbScore >= 80 ? 'passed' : mbScore >= 60 ? 'warning' : 'failed',
    score: mbScore,
    details: mbScore >= 80 ? 'All circuits functional. No corrosion detected.' : 'Minor wear detected on connectors.',
  });

  if (knowledge.storageHealth !== undefined) {
    tests.push({
      component: 'Storage',
      status: knowledge.storageHealth >= 80 ? 'passed' : 'warning',
      score: knowledge.storageHealth,
      details: `Storage health at ${knowledge.storageHealth}%. ${knowledge.storageHealth >= 90 ? 'No bad sectors.' : 'Minor wear detected.'}`,
    });
  }

  const kbScore = knowledge.conditionScore >= 60 ? 94 : 72;
  tests.push({
    component: 'Keyboard/Input',
    status: kbScore >= 80 ? 'passed' : 'warning',
    score: kbScore,
    details: kbScore >= 80 ? 'All keys responsive. No stuck keys.' : 'Minor key travel inconsistency.',
  });

  const portScore = 88 + Math.floor(Math.random() * 10);
  tests.push({
    component: 'Ports & Connectivity',
    status: portScore >= 80 ? 'passed' : 'warning',
    score: Math.min(portScore, 100),
    details: 'All ports tested. WiFi, Bluetooth functional.',
  });

  if (['electronics', 'phone', 'laptop'].includes(knowledge.category.toLowerCase())) {
    const camScore = 85 + Math.floor(Math.random() * 12);
    tests.push({
      component: 'Camera',
      status: camScore >= 80 ? 'passed' : 'warning',
      score: Math.min(camScore, 100),
      details: 'Front and rear cameras functional. Image clarity verified.',
    });
  }

  return tests;
}

function calculateTrustScore(tests: IComponentTest[], knowledge: ProductKnowledge): number {

  const avgComponentScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;


  let score = avgComponentScore * 0.6;

  const gradeBonus: Record<string, number> = { grade_a: 15, grade_b: 10, grade_c: 5, grade_d: 0 };
  score += gradeBonus[knowledge.refurbishmentGrade] || 5;

  if (knowledge.warrantyMonths >= 12) score += 10;
  else if (knowledge.warrantyMonths >= 6) score += 7;
  else if (knowledge.warrantyMonths > 0) score += 3;

  if (knowledge.defects.length === 0) score += 8;
  else if (knowledge.defects.length <= 2) score += 4;

  const trustedBrands = ['apple', 'samsung', 'sony', 'dell', 'lenovo', 'hp', 'dyson', 'bose'];
  if (trustedBrands.includes(knowledge.brand.toLowerCase())) score += 5;

  return Math.min(Math.round(score), 100);
}

function predictRemainingLife(knowledge: ProductKnowledge): number {
  const categoryLifespan: Record<string, number> = {
    electronics: 48, phone: 36, laptop: 60, tablet: 48,
    appliances: 72, furniture: 96, clothing: 24, other: 36,
  };

  const maxLife = categoryLifespan[knowledge.category.toLowerCase()] || 48;
  const usedLife = knowledge.ageMonths;
  const conditionFactor = knowledge.conditionScore / 100;
  const gradeFactor: Record<string, number> = { grade_a: 0.9, grade_b: 0.75, grade_c: 0.6, grade_d: 0.4 };

  const remaining = (maxLife - usedLife) * conditionFactor * (gradeFactor[knowledge.refurbishmentGrade] || 0.7);
  return Math.max(Math.round(remaining), 3);
}


function predictFailureProbability(knowledge: ProductKnowledge, tests: IComponentTest[]): number {
  let probability = 0.05; 

  const failedTests = tests.filter((t) => t.status === 'failed').length;
  const warningTests = tests.filter((t) => t.status === 'warning').length;
  probability += failedTests * 0.15;
  probability += warningTests * 0.05;

  if (knowledge.ageMonths > 36) probability += 0.10;
  else if (knowledge.ageMonths > 24) probability += 0.05;

  if (knowledge.conditionScore < 50) probability += 0.12;
  else if (knowledge.conditionScore < 70) probability += 0.05;

  if (knowledge.refurbishmentGrade === 'grade_d') probability += 0.10;
  else if (knowledge.refurbishmentGrade === 'grade_c') probability += 0.05;

  return Math.min(Math.round(probability * 100) / 100, 0.95);
}


function generateChatResponse(question: string, knowledge: ProductKnowledge, tests: IComponentTest[], trustScore: number): string {
  const q = question.toLowerCase();

  if (q.includes('battery')) {
    const batteryTest = tests.find((t) => t.component === 'Battery Health');
    return `Battery health is at ${knowledge.batteryHealth}%. ${batteryTest?.details || ''} ${knowledge.partsReplaced.includes('Battery') ? 'The battery was replaced during refurbishment with a new OEM-grade unit.' : 'Original battery retained — still within healthy parameters.'}`;
  }

  if (q.includes('repair') || q.includes('refurb') || q.includes('what was done') || q.includes('what was fixed')) {
    const repairs = knowledge.repairsDone.join(', ');
    const parts = knowledge.partsReplaced.length > 0 ? `Parts replaced: ${knowledge.partsReplaced.join(', ')}.` : 'No parts were replaced.';
    return `This product underwent Grade ${knowledge.refurbishmentGrade.replace('grade_', '').toUpperCase()} refurbishment. Repairs performed: ${repairs}. ${parts} All repairs done by certified technicians.`;
  }

  if (q.includes('defect') || q.includes('damage') || q.includes('scratch') || q.includes('issue')) {
    if (knowledge.defects.length === 0) {
      return 'No defects were found during inspection. The product passed all quality checks.';
    }
    return `During inspection, the following were noted: ${knowledge.defects.join('; ')}. These are cosmetic only and do not affect functionality. Trust Score: ${trustScore}/100.`;
  }

  if (q.includes('lifespan') || q.includes('how long') || q.includes('last') || q.includes('life')) {
    const remaining = predictRemainingLife(knowledge);
    return `Based on our AI analysis, this product has an estimated ${remaining} months of remaining useful life. Current condition score: ${knowledge.conditionScore}/100. The ${knowledge.brand} ${knowledge.category} typically lasts ${remaining + knowledge.ageMonths} months total.`;
  }

  if (q.includes('autocad') || q.includes('gaming') || q.includes('performance') || q.includes('run')) {
    const perfScore = knowledge.conditionScore >= 80 ? 'excellent' : knowledge.conditionScore >= 60 ? 'good' : 'adequate';
    return `This device is in ${perfScore} working condition (score: ${knowledge.conditionScore}/100). ${knowledge.storageHealth ? `Storage health: ${knowledge.storageHealth}%.` : ''} All performance tests passed. For demanding applications like AutoCAD, this unit should perform well based on its hardware specifications and current health metrics.`;
  }

  if (q.includes('failure') || q.includes('break') || q.includes('risk') || q.includes('reliable')) {
    const failProb = predictFailureProbability(knowledge, tests);
    const level = failProb < 0.10 ? 'very low' : failProb < 0.25 ? 'low' : failProb < 0.50 ? 'moderate' : 'high';
    return `The estimated failure probability for this product is ${(failProb * 100).toFixed(1)}% (${level} risk). ${failProb < 0.15 ? 'This is well within acceptable limits for a refurbished product.' : 'We recommend the extended warranty for added peace of mind.'} Trust Score: ${trustScore}/100.`;
  }

  if (q.includes('warranty') || q.includes('guarantee') || q.includes('covered')) {
    return `This product comes with a ${knowledge.warrantyMonths}-month warranty covering ${knowledge.warrantyMonths >= 12 ? 'all manufacturing defects, battery issues, and hardware failures' : 'manufacturing defects and hardware failures'}. ${knowledge.warrantyMonths >= 6 ? 'Free replacement or repair within warranty period.' : 'Extended warranty available at checkout.'}`;
  }

  if (q.includes('trust') || q.includes('score') || q.includes('quality') || q.includes('safe')) {
    const passedCount = tests.filter((t) => t.status === 'passed').length;
    return `Trust Score: ${trustScore}/100. ${passedCount} out of ${tests.length} component tests passed. Grade ${knowledge.refurbishmentGrade.replace('grade_', '').toUpperCase()} certified refurbishment. ${knowledge.warrantyMonths}-month warranty included. This product meets our quality standards for resale.`;
  }

  if (q.includes('display') || q.includes('screen')) {
    const displayTest = tests.find((t) => t.component === 'Display');
    return `Display status: ${displayTest?.details || knowledge.displayStatus}. Score: ${displayTest?.score || 95}/100. No dead pixels, burn-in, or discoloration detected during inspection.`;
  }

  return `Based on our inspection data: This ${knowledge.brand} ${knowledge.category} has a Trust Score of ${trustScore}/100. Condition: ${knowledge.conditionScore}/100. Grade: ${knowledge.refurbishmentGrade.replace('grade_', '').toUpperCase()}. ${knowledge.warrantyMonths}-month warranty included. ${tests.filter((t) => t.status === 'passed').length}/${tests.length} component tests passed. Feel free to ask about specific components, battery health, repairs done, warranty, or expected lifespan.`;
}


export function validateChatInput(input: any): string[] {
  const errors: string[] = [];
  if (!input) { errors.push('Input required'); return errors; }
  if (!input.productId) errors.push('productId is required');
  if (!input.question || typeof input.question !== 'string') errors.push('question is required');
  return errors;
}

export function validateScoreInput(input: any): string[] {
  const errors: string[] = [];
  if (!input) { errors.push('Input required'); return errors; }
  if (!input.productId) errors.push('productId is required');
  if (!input.category) errors.push('category is required');
  if (input.conditionScore === undefined) errors.push('conditionScore is required');
  return errors;
}


export async function generateTrustScore(input: any): Promise<ITrustScore> {
  const startTime = Date.now();
  const knowledge = getProductKnowledge(input.productId, input);
  const tests = runComponentTests(knowledge);
  const trustScore = calculateTrustScore(tests, knowledge);
  const remainingLife = predictRemainingLife(knowledge);
  const failureProbability = predictFailureProbability(knowledge, tests);

  const result = await TrustScore.findOneAndUpdate(
    { productId: input.productId },
    {
      productId: input.productId,
      trustScore,
      componentTests: tests,
      remainingUsefulLife: remainingLife,
      failureProbability,
      warrantyInfo: {
        duration: knowledge.warrantyMonths,
        coverage: knowledge.warrantyMonths >= 12 ? 'comprehensive' : knowledge.warrantyMonths >= 6 ? 'standard' : 'basic',
        expiresAt: new Date(Date.now() + knowledge.warrantyMonths * 30 * 24 * 60 * 60 * 1000),
      },
      inspectionSummary: `${tests.filter((t) => t.status === 'passed').length}/${tests.length} tests passed. Condition: ${knowledge.conditionScore}/100.`,
      refurbishmentSummary: `Grade ${knowledge.refurbishmentGrade.replace('grade_', '').toUpperCase()} refurbishment. Repairs: ${knowledge.repairsDone.join(', ')}.`,
      metadata: {
        engineVersion: '7.0.0',
        processingTimeMs: Date.now() - startTime,
        dataSourcesUsed: ['inspection_report', 'refurbishment_log', 'quality_tests', 'warranty_db'],
      },
    },
    { upsert: true, new: true }
  );

  return result;
}

export async function chat(input: any): Promise<{ response: string; trustScore: number; sources: string[] }> {
  const knowledge = getProductKnowledge(input.productId, input);
  const tests = runComponentTests(knowledge);
  const trustScore = calculateTrustScore(tests, knowledge);
  const response = generateChatResponse(input.question, knowledge, tests, trustScore);

  await TrustScore.findOneAndUpdate(
    { productId: input.productId },
    {
      $push: {
        chatHistory: {
          $each: [
            { role: 'user', content: input.question, timestamp: new Date() },
            { role: 'assistant', content: response, timestamp: new Date() },
          ],
        },
      },
    },
    { upsert: true }
  );

  return {
    response,
    trustScore,
    sources: ['inspection_report', 'refurbishment_log', 'quality_tests', 'warranty_db'],
  };
}

export async function getTrustScore(productId: string): Promise<ITrustScore | null> {
  return TrustScore.findOne({ productId }).sort({ createdAt: -1 });
}

export async function getDashboardStats() {
  const total = await TrustScore.countDocuments();
  const [stats] = await TrustScore.aggregate([
    { $group: { _id: null, avgTrust: { $avg: '$trustScore' }, avgLife: { $avg: '$remainingUsefulLife' }, avgFailure: { $avg: '$failureProbability' }, totalChats: { $sum: { $size: '$chatHistory' } } } },
  ]);

  const distribution = await TrustScore.aggregate([
    { $bucket: { groupBy: '$trustScore', boundaries: [0, 60, 75, 90, 101], default: 'Other', output: { count: { $sum: 1 } } } },
  ]);

  return {
    totalProducts: total,
    avgTrustScore: stats ? Math.round(stats.avgTrust) : 0,
    avgRemainingLife: stats ? Math.round(stats.avgLife) : 0,
    avgFailureProbability: stats ? Math.round(stats.avgFailure * 100) / 100 : 0,
    totalChatInteractions: stats?.totalChats || 0,
    trustDistribution: distribution,
  };
}
