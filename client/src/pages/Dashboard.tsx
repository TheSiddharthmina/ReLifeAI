import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, Wind, Trash2, ArrowRight, TrendingUp, Leaf } from 'lucide-react';
import KPICard from '../components/KPICard';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { getDashboard, listProducts } from '../services/api';
import type { DashboardMetrics, Product } from '../types';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

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
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const trendData = [
    { day: 'Mon', products: 12, value: 45000 },
    { day: 'Tue', products: 19, value: 72000 },
    { day: 'Wed', products: 15, value: 58000 },
    { day: 'Thu', products: 25, value: 95000 },
    { day: 'Fri', products: 22, value: 84000 },
    { day: 'Sat', products: 30, value: 110000 },
    { day: 'Sun', products: 18, value: 68000 },
  ];

  const lifecycleData = metrics?.lifecycleBreakdown.map((item) => ({
    name: item.decision.charAt(0) + item.decision.slice(1).toLowerCase(),
    value: item.count,
  })) || [];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Circular economy impact at a glance</p>
        </div>
        <Link
          to="/submit"
          className="gradient-primary text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all flex items-center gap-2"
        >
          Analyze Product <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Package} label="Products Processed" value={metrics?.totalProductsProcessed || 0} color="bg-gradient-to-br from-blue-500 to-blue-600" delay={0} />
        <KPICard icon={DollarSign} label="Value Recovered" value={metrics?.totalRecoveredValue || 0} prefix="₹" color="bg-gradient-to-br from-green-500 to-emerald-600" delay={100} />
        <KPICard icon={Wind} label="Carbon Saved" value={Math.round(metrics?.totalCarbonSaved || 0)} suffix=" kg" color="bg-gradient-to-br from-cyan-500 to-blue-600" delay={200} />
        <KPICard icon={Trash2} label="Waste Diverted" value={Math.round(metrics?.totalWasteDiverted || 0)} suffix=" kg" color="bg-gradient-to-br from-amber-500 to-orange-600" delay={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
                   className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100"

        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Weekly Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="products" stroke="#10B981" fill="url(#colorProducts)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
                   className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100"

        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle Distribution</h2>
          {lifecycleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={lifecycleData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" nameKey="name" label>
                  {lifecycleData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-gray-400">
              No data yet — analyze a product to begin
            </div>
          )}
        </motion.div>
      </div>

      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
                   className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100"

        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h2>
          <div className="space-y-3">
            {products.map((p: Product) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">{p.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{p.category} · {p.condition.replace('_', ' ')}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100"

        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Circular Journey</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Analyze your first returned product to see AI-powered lifecycle decisions and environmental impact.
          </p>
          <Link to="/submit" className="gradient-primary text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-green-500/30 inline-flex items-center gap-2">
            Analyze First Product <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
