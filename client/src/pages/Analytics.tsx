import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', resale: 45, repair: 20, refurbish: 15, recycle: 10, donate: 10 },
  { month: 'Feb', resale: 52, repair: 25, refurbish: 18, recycle: 8, donate: 12 },
  { month: 'Mar', resale: 61, repair: 30, refurbish: 22, recycle: 12, donate: 15 },
  { month: 'Apr', resale: 58, repair: 28, refurbish: 20, recycle: 15, donate: 14 },
  { month: 'May', resale: 72, repair: 35, refurbish: 25, recycle: 11, donate: 18 },
  { month: 'Jun', resale: 80, repair: 40, refurbish: 30, recycle: 9, donate: 20 },
];

const categoryData = [
  { category: 'Electronics', count: 145, value: 580000 },
  { category: 'Clothing', count: 98, value: 120000 },
  { category: 'Furniture', count: 45, value: 340000 },
  { category: 'Appliances', count: 67, value: 450000 },
  { category: 'Books', count: 32, value: 15000 },
];

const pieData = [
  { name: 'Resale', value: 42 },
  { name: 'Repair', value: 25 },
  { name: 'Refurbish', value: 18 },
  { name: 'Recycle', value: 8 },
  { name: 'Donate', value: 7 },
];

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function Analytics() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics</h1>
        <p className="text-gray-500 mb-8">Deep insights into circular commerce performance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">Monthly Decision Trends</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="resale" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="repair" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="refurbish" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Decision Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" label={(entry: any) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Value Recovery Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="resale" stroke="#8B5CF6" fill="url(#grad1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
