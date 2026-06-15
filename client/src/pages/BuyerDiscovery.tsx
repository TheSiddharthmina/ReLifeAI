import { useEffect, useState } from 'react';
import api from '../services/api';

export default function BuyerDiscovery() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/buyer-match/dashboard/stats')
      .then((res) => setData(res.data.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Buyer Discovery Engine
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-500">
            Total Buyer Matches
          </p>
          <p className="text-3xl font-bold">
            {data?.totalMatches || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-500">
            Avg Match Score
          </p>
          <p className="text-3xl font-bold text-green-600">
            {data?.avgMatchScore || 0}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-500">
            Best Match Score
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {data?.avgBestMatchScore || 0}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-500">
            Cost Saved
          </p>
          <p className="text-3xl font-bold text-purple-600">
            ₹{(data?.totalCostSaved || 0).toLocaleString()}
          </p>
        </div>

      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">
          Recent Buyer Matches
        </h2>

        {!data?.recentMatches?.length ? (
          <p className="text-gray-500">
            No matches found
          </p>
        ) : (
          <div className="space-y-4">
            {data.recentMatches.map((match: any) => (
              <div
                key={match._id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {match.buyerName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Products Matched: {match.totalMatches}
                    </p>

                    <p className="text-sm text-gray-500">
                      Buyer Response: {match.buyerResponse}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {match.bestMatchScore}%
                    </p>

                    <p className="text-xs text-gray-500">
                      Match Score
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Matched Products
                  </p>

                  {match.matchedProducts.slice(0, 3).map((product: any) => (
                    <div
                      key={product._id}
                      className="flex justify-between text-sm py-1"
                    >
                      <span>
                        {product.brand} {product.name}
                      </span>

                      <span className="font-medium">
                        {product.matchScore}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Cost Saved:
                  {' '}
                  ₹{match.costSaved?.totalSaved?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}