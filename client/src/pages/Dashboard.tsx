import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, listProducts } from '../services/api';
import type { DashboardMetrics, Product } from '../types';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dash, prods] = await Promise.all([getDashboard(), listProducts(0, 5)]);
        setMetrics(dash);
        setProducts(prods.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Circular Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time environmental and economic impact</p>
        </div>
        <Link to="/submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg">
          + Analyze Product
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Products Processed</p>
          <p className="text-2xl font-bold">{metrics?.totalProductsProcessed || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Value Recovered</p>
          <p className="text-2xl font-bold text-green-700">₹{(metrics?.totalRecoveredValue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Carbon Saved</p>
          <p className="text-2xl font-bold text-blue-700">{(metrics?.totalCarbonSaved || 0).toFixed(1)} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Waste Diverted</p>
          <p className="text-2xl font-bold text-amber-700">{(metrics?.totalWasteDiverted || 0).toFixed(1)} kg</p>
        </div>
      </div>

      {}
      {products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Products</h2>
          <div className="space-y-3">
            {products.map((p: Product) => (
              <Link key={p._id} to={`/product/${p._id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{p.category} · {p.condition.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-4xl mb-4">🌱</p>
          <h2 className="text-xl font-bold mb-2">No Products Yet</h2>
          <p className="text-gray-600 mb-6">Start analyzing returned products to see impact.</p>
          <Link to="/submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg">
            Analyze First Product
          </Link>
        </div>
      )}
    </div>
  );
}
