import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import SubmitProduct from './pages/SubmitProduct';
import ProductIntelligence from './pages/ProductIntelligence';

import ReturnRisk from './pages/ReturnRisk';
import BuyerDiscovery from './pages/BuyerDiscovery';
import TrustAssistant from './pages/TrustAssistant';
import ReverseMarketplace from './pages/ReverseMarketplace';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submit" element={<SubmitProduct />} />
        <Route path="/product/:id" element={<ProductIntelligence />} />

        <Route path="/return-risk" element={<ReturnRisk />} />
        <Route path="/buyer-discovery" element={<BuyerDiscovery />} />
        <Route path="/trust-assistant" element={<TrustAssistant />} />
        <Route path="/reverse-marketplace" element={<ReverseMarketplace />} />
      </Routes>
    </Layout>
  );
}