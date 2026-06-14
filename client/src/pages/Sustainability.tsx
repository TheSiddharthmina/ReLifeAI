import { motion } from 'framer-motion';
import { TreePine, Recycle, Zap, Droplets, Leaf, Globe } from 'lucide-react';

const metrics = [
  { icon: TreePine, label: 'Trees Saved', value: '142', color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/30' },
  { icon: Recycle, label: 'Waste Diverted', value: '2.4 tons', color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/30' },
  { icon: Zap, label: 'Energy Saved', value: '8,500 kWh', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
  { icon: Droplets, label: 'Water Saved', value: '12,000 L', color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/30' },
];

const sdgGoals = [
  { number: 9, title: 'Industry & Innovation', impact: 'AI-powered circular systems' },
  { number: 12, title: 'Responsible Consumption', impact: 'Product lifecycle extension' },
  { number: 13, title: 'Climate Action', impact: 'Carbon emission reduction' },
  { number: 15, title: 'Life on Land', impact: 'Reduced landfill waste' },
];

export default function Sustainability() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900">Sustainability Impact</h1>
        </div>
        <p className="text-gray-500 mb-8">Environmental footprint reduction through circular commerce</p>
      </motion.div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-default"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 shadow-lg ${m.shadow}`}>
              <m.icon className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{m.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Circular Economy Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-8 shadow-lg mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-500" />
          Circular Economy Flow
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {['Return', 'Inspect', 'AI Decision', 'New Life', 'Impact'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${
                i === 0 ? 'from-red-400 to-red-500' :
                i === 1 ? 'from-amber-400 to-amber-500' :
                i === 2 ? 'from-blue-400 to-blue-500' :
                i === 3 ? 'from-green-400 to-green-500' :
                'from-purple-400 to-purple-500'
              }`}>
                {i + 1}
              </div>
              <span className="text-sm font-medium text-gray-700">{step}</span>
              {i < 4 && <span className="text-gray-300 text-xl hidden md:inline">→</span>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* UN SDG Alignment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-8 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">UN Sustainable Development Goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sdgGoals.map((goal) => (
            <div key={goal.number} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white font-bold shadow-md">
                {goal.number}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
                <p className="text-xs text-gray-500">{goal.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
