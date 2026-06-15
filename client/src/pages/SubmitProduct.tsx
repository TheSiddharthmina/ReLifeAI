import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeProduct } from '../services/api';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface AnalysisResult {
  conditionScore: number;
  recommendation: string;
  confidence: number;
  detectedIssues: string[];
  recoveryValue: number;
  carbonSaved: number;
}

export default function SubmitProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'electronics',
    description: '',
    condition: 'good',
    returnReason: '',
    brand: '',
    originalPrice: '',
    weight: '',
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ─── Image Upload Logic ───────────────────────────────────

  function validateFile(file: File): boolean {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return false;
    if (file.size > 10 * 1024 * 1024) return false; // 10MB max
    return true;
  }

  function addFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      setError('Maximum 5 images allowed.');
      return;
    }

    const validFiles = fileArray.filter(validateFile).slice(0, remaining);
    if (validFiles.length === 0) {
      setError('Invalid file type. Only JPG, PNG, WebP allowed.');
      return;
    }

    const newImages: ImageFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 10),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setError(null);
    setAnalysisResult(null);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
    setAnalysisResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }

  async function handleAnalyzeImages() {
    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    setAnalyzing(true);
    setError(null);

    // Simulate AI analysis (3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockResult: AnalysisResult = {
      conditionScore: 87,
      recommendation: 'Refurbish',
      confidence: 93,
      detectedIssues: ['Minor scratches', 'Packaging damage'],
      recoveryValue: 18500,
      carbonSaved: 8.2,
    };

    setAnalysisResult(mockResult);
    setAnalyzing(false);
  }

  // ─── Form Logic ───────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.returnReason) {
      setError('Please fill in all required fields.');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        condition: form.condition,
        returnReason: form.returnReason,
        brand: form.brand.trim() || undefined,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      };

      // Send actual image files to backend
      const imageFiles = images.map((img) => img.file);
      const result = await analyzeProduct(payload, imageFiles);
      navigate(`/product/${result.product._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze product.');
    } finally {
      setLoading(false);
    }
  }


  // ─── Render ───────────────────────────────────────────────

  const CATEGORIES = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Apparel' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'appliances', label: 'Home Appliances' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'books', label: 'Books & Media' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'food', label: 'Food & Grocery' },
    { value: 'other', label: 'Other' },
  ];

  const CONDITIONS = [
    { value: 'new', label: 'New', description: 'Unopened, original packaging' },
    { value: 'like_new', label: 'Like New', description: 'Opened but unused' },
    { value: 'good', label: 'Good', description: 'Light use, minor marks' },
    { value: 'fair', label: 'Fair', description: 'Moderate use, visible wear' },
    { value: 'poor', label: 'Poor', description: 'Heavy use, significant damage' },
    { value: 'damaged', label: 'Damaged', description: 'Non-functional' },
  ];

  const RETURN_REASONS = [
    'No longer needed',
    'Better price available',
    'Item defective or doesn\'t work',
    'Wrong item received',
    'Item arrived too late',
    'Missing parts or accessories',
    'Item not as described',
    'Bought by mistake',
    'Product quality not as expected',
    'Other',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Returned Product</h1>
        <p className="mt-2 text-gray-600">
          Upload product images and enter details. Our AI will analyze condition and determine the best next life.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ═══ IMAGE UPLOAD SECTION ═══ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          <p className="text-sm text-gray-500 mb-4">Upload up to 5 images of the returned product for AI analysis.</p>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-700">
              Drag & drop images here, or <span className="text-green-600">click to browse</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP up to 10MB each. Max 5 images.</p>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    ✕
                  </button>
                  <p className="mt-1 text-xs text-gray-500 truncate">{img.file.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Analyze Images Button */}
          {images.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAnalyzeImages}
                disabled={analyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-5 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Images with AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Analyze Images
                  </>
                )}
              </button>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-5 p-5 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-base font-semibold text-green-800">AI Image Analysis Complete</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Condition Score</p>
                  <p className="text-xl font-bold text-gray-900">{analysisResult.conditionScore}/100</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Recommendation</p>
                  <p className="text-xl font-bold text-purple-700">{analysisResult.recommendation}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="text-xl font-bold text-blue-700">{analysisResult.confidence}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Recovery Value</p>
                  <p className="text-xl font-bold text-green-700">₹{analysisResult.recoveryValue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Carbon Saved</p>
                  <p className="text-xl font-bold text-cyan-700">{analysisResult.carbonSaved} kg</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Images Analyzed</p>
                  <p className="text-xl font-bold text-gray-700">{images.length}</p>
                </div>
              </div>

              {analysisResult.detectedIssues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Detected Issues</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.detectedIssues.map((issue, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ PRODUCT INFO ═══ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Apple AirPods Pro" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g., Apple" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
              <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="0" min="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="0" min="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Additional details..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* ═══ CONDITION ═══ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Condition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONDITIONS.map((cond) => (
              <label
                key={cond.value}
                className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  form.condition === cond.value
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input type="radio" name="condition" value={cond.value} checked={form.condition === cond.value} onChange={handleChange} className="sr-only" />
                <span className="text-sm font-semibold text-gray-900">{cond.label}</span>
                <span className="text-xs text-gray-500 mt-1">{cond.description}</span>
                {form.condition === cond.value && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* ═══ RETURN REASON ═══ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason <span className="text-red-500">*</span></label>
          <select name="returnReason" value={form.returnReason} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required>
            <option value="">Select a reason...</option>
            {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* ═══ SUBMIT ═══ */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500"><span className="text-red-500">*</span> Required fields</p>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-base transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing with AI...
              </>
            ) : (
              'Analyze Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
