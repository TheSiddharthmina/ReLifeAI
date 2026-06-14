import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function analyzeProduct(data: any, imageFiles: File[]) {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('condition', data.condition);
  formData.append('returnReason', data.returnReason);
  if (data.description) formData.append('description', data.description);
  if (data.brand) formData.append('brand', data.brand);
  if (data.originalPrice) formData.append('originalPrice', String(data.originalPrice));
  if (data.weight) formData.append('weight', String(data.weight));

  // Add image files
  for (const file of imageFiles) {
    formData.append('images', file);
  }

  const res = await api.post('/analyze-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function generateDecision(productId: string) {
  const res = await api.post('/engine2/generate-decision', { productId });
  return res.data.data;
}

export async function getProduct(id: string) {
  const res = await api.get(`/product/${id}`);
  return res.data.data;
}

export async function getDecision(productId: string) {
  const res = await api.get(`/engine2/decision/${productId}`);
  return res.data.data;
}

export async function listProducts(skip = 0, limit = 50) {
  const res = await api.get('/products', { params: { skip, limit } });
  return res.data.data;
}

export async function getDashboard() {
  const res = await api.get('/dashboard');
  return res.data.data;
}

export default api;
