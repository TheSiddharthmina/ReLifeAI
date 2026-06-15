import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReverseMarketplace() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/reverse-marketplace/dashboard/stats')
      .then((res) => setData(res.data.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Reverse Marketplace
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">
            Active Demand Pools
          </p>
          <p className="text-3xl font-bold">
            {data?.activeRequirements || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">
            Product Matches
          </p>
          <p className="text-3xl font-bold">
            {data?.totalMatches || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">
            Average Match Score
          </p>
          <p className="text-3xl font-bold text-green-600">
            {data?.avgMatchScore || 0}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">
            Cost Saved
          </p>
          <p className="text-3xl font-bold text-blue-600">
            ₹{(data?.totalCostSaved || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-semibold mb-4">
          Recent Marketplace Matches
        </h2>

        {!data?.recentMatches?.length ? (
          <p className="text-gray-500">
            No marketplace matches yet
          </p>
        ) : (
          <div className="space-y-4">
            {data.recentMatches.map((match: any) => (
              <div
                key={match._id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {match.buyerName}
                    </p>

                    <p className="text-sm text-gray-500">
                      Products Matched: {match.totalMatches}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {match.bestMatchScore}%
                    </p>

                    <p className="text-xs text-gray-500">
                      Match Score
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(match.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}