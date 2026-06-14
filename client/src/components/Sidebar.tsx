import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ScanSearch,
  BarChart3,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Recycle,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/submit', label: 'Analyze Product', icon: ScanSearch },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/sustainability', label: 'Sustainability', icon: Leaf },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
  animate={{ width: collapsed ? 72 : 256 }}
  className="fixed left-0 top-0 h-screen gradient-dark text-white flex flex-col z-50 shadow-xl"
>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-green-500/30">
          <Recycle className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-lg font-bold">ReLife AI</h1>
            <p className="text-[10px] text-gray-400 -mt-0.5">Circular Commerce Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-green-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-green-400' : 'group-hover:text-green-400'}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-4 border-t border-white/10 text-gray-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Badge */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <p className="text-[10px] font-medium text-amber-300">Amazon HackOn 6.0</p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

