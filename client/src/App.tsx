import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SubmitProduct from './pages/SubmitProduct';
import ProductIntelligence from './pages/ProductIntelligence';
import Analytics from './pages/Analytics';
import Sustainability from './pages/Sustainability';

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitProduct />} />
          <Route path="/product/:id" element={<ProductIntelligence />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sustainability" element={<Sustainability />} />
        </Routes>
      </main>
    </div>
  );
}
