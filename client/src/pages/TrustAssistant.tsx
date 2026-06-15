import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TrustAssistant() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/trust/dashboard/stats')
      .then((res) => setData(res.data.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trust Assistant</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 border rounded-xl">
          <p className="text-sm text-gray-500">Average Trust Score</p>
          <p className="text-3xl font-bold">
            {data?.avgTrustScore ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 border rounded-xl">
          <p className="text-sm text-gray-500">Verified Products</p>
          <p className="text-3xl font-bold">
            {data?.totalProducts ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 border rounded-xl">
          <p className="text-sm text-gray-500">Failure Probability</p>
          <p className="text-3xl font-bold">
            {((data?.avgFailureProbability || 0) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}