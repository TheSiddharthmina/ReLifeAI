import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReturnRisk() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/return-risk/dashboard/stats');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load return risk stats', err);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Return Risk Engine
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Total Predictions</p>
          <p className="text-3xl font-bold text-gray-900">
            {data?.totalPredictions ?? 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Average Return Risk</p>
          <p className="text-3xl font-bold text-orange-600">
            {((data?.avgReturnProbability || 0) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">High Risk Products</p>
          <p className="text-3xl font-bold text-red-600">
            {data?.highRiskProducts?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Prediction Confidence</p>
          <p className="text-3xl font-bold text-green-600">
            {((data?.avgConfidence || 0) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* High Risk Products */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">
          High Risk Products
        </h2>

        {!data?.highRiskProducts ||
        data.highRiskProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No high-risk products detected.
          </div>
        ) : (
          <div className="space-y-3">
            {data.highRiskProducts.map((product: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    Product ID:
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.productId}
                  </p>

                  <p className="text-sm mt-2">
                    Risk Level:{' '}
                    <span className="font-medium text-red-600">
                      {product.riskLevel}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {(product.returnProbability * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Return Probability
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">
          Risk Summary
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50">
            <p className="text-sm text-gray-600">Low Risk</p>
            <p className="text-2xl font-bold text-green-600">
              {data?.totalPredictions
                ? data.totalPredictions -
                  (data.highRiskProducts?.length || 0)
                : 0}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50">
            <p className="text-sm text-gray-600">Average Risk</p>
            <p className="text-2xl font-bold text-yellow-600">
              {((data?.avgReturnProbability || 0) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-50">
            <p className="text-sm text-gray-600">High Risk</p>
            <p className="text-2xl font-bold text-red-600">
              {data?.highRiskProducts?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}