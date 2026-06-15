import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, generateDecision, getDecision } from '../services/api';
import type { Product, ProductPassport, LifecycleDecision } from '../types';

function normalizeDecision(data: any): LifecycleDecision | null {
  if (!data) return null;
  if (data.decision && typeof data.decision === 'object') return data.decision;
  return data;
}

function safeText(value: any) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return JSON.stringify(value);
}

export default function ProductIntelligence() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [passport, setPassport] = useState<ProductPassport | null>(null);
  const [decision, setDecision] = useState<LifecycleDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  async function loadData(productId: string) {
    try {
      setLoading(true);

      const data = await getProduct(productId);
      setProduct(data?.product || null);
      setPassport(data?.passport || null);

      try {
        const dec = await getDecision(productId);
        setDecision(normalizeDecision(dec));
      } catch {
        setDecision(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDecision() {
    if (!id) return;

    setDeciding(true);

    try {
      const result = await generateDecision(id);
      setDecision(normalizeDecision(result));
    } catch (err) {
      console.error(err);
    } finally {
      setDeciding(false);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found</div>;
  }

  const decisionValue = safeText((decision as any)?.decision || 'PENDING');

  const decisionColors: Record<string, string> = {
    RESALE: 'bg-green-100 text-green-800',
    RESELL: 'bg-green-100 text-green-800',
    REPAIR: 'bg-blue-100 text-blue-800',
    REFURBISH: 'bg-purple-100 text-purple-800',
    RECYCLE: 'bg-amber-100 text-amber-800',
    DONATE: 'bg-pink-100 text-pink-800',
  };

  const scoreItems = passport
    ? [
        { label: 'Condition Score', value: passport.conditionScore ?? 0 },
        { label: 'Resale Potential', value: passport.resalePotential ?? 0 },
        { label: 'Repairability', value: passport.repairabilityScore ?? 0 },
        { label: 'Sustainability', value: passport.sustainabilityScore ?? 0 },
      ]
    : [];

  const defects = Array.isArray(passport?.defects) ? passport.defects : [];

  const reasoning = Array.isArray((decision as any)?.reasoning)
    ? (decision as any).reasoning
    : (decision as any)?.reasoning
    ? [(decision as any).reasoning]
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/"
        className="text-sm text-green-600 hover:text-green-700 font-medium mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {safeText(product.name) || 'Unnamed Product'}
      </h1>

      <div className="flex gap-2 mb-8">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 capitalize">
          {safeText(product.category) || 'other'}
        </span>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 capitalize">
          {String(product.condition || 'unknown').replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {passport ? (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Digital Product Passport
              </h2>

              <div className="space-y-3">
                {scoreItems.map((item) => {
                  const value = Number(item.value || 0);

                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-bold">{value}/100</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            value >= 70
                              ? 'bg-green-500'
                              : value >= 40
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {safeText(passport.aiSummary) || 'No AI summary available yet.'}
                </p>
              </div>

              {defects.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Defects
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {defects.map((d: any, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200"
                      >
                       {String(d).replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-2">
                Digital Product Passport
              </h2>
              <p className="text-sm text-gray-500">
                Passport data is not available yet.
              </p>
            </div>
          )}

          {decision && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Lifecycle Decision
              </h2>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                  decisionColors[String(decisionValue)] || 'bg-gray-100 text-gray-800'
                } mb-4`}
              >
                <span className="text-lg font-bold">
                  {decisionValue}
                </span>

                <span className="text-sm">
                  ({Math.round(((decision as any).confidence || 0) * 100)}% confidence)
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  AI Reasoning
                </p>

                {reasoning.length > 0 ? (
                  <ul className="space-y-1">
                    {reasoning.map((r: any, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{safeText(r)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No reasoning available.
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Recommended Market</p>
                <p className="font-semibold">
                  {safeText((decision as any).recommendedMarket) || 'Not available'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {passport && !decision && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-green-300 p-6 text-center">
              <p className="text-2xl mb-2">🤖</p>

              <h3 className="font-semibold mb-2">Ready for Decision</h3>

              <p className="text-sm text-gray-600 mb-4">
                Let AI determine the optimal next life.
              </p>

              <button
                onClick={handleGenerateDecision}
                disabled={deciding}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg"
              >
                {deciding ? 'Deciding...' : 'Generate Decision'}
              </button>
            </div>
          )}

          {decision && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">
                Impact
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Value Recovered</p>
                  <p className="text-lg font-bold text-green-700">
                    ₹{Number((decision as any).estimatedRecoveredValue || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Carbon Saved</p>
                  <p className="text-lg font-bold text-blue-700">
                    {(decision as any).carbonSaved || 0} kg CO₂
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Waste Diverted</p>
                  <p className="text-lg font-bold text-amber-700">
                    {(decision as any).wasteDiverted || 0} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">
              Details
            </h3>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium capitalize">
                  {safeText(product.category) || 'other'}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Condition</dt>
                <dd className="font-medium capitalize">
                  {String(product.condition || 'unknown').replace('_', ' ')}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Return Reason</dt>
                <dd className="font-medium">
                  {safeText(product.returnReason) || 'Not provided'}
                </dd>
              </div>

              {product.brand && (
                <div>
                  <dt className="text-gray-500">Brand</dt>
                  <dd className="font-medium">{safeText(product.brand)}</dd>
                </div>
              )}

              {product.originalPrice && (
                <div>
                  <dt className="text-gray-500">Original Price</dt>
                  <dd className="font-medium">
                    ₹{Number(product.originalPrice).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <Link
            to="/submit"
            className="block w-full text-center py-2.5 px-4 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Analyze Another Product
          </Link>
        </div>
      </div>
    </div>
  );
}