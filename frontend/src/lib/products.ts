import { api } from './api';
import type { Category, Product } from '../types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const PRODUCT_FILE_URL = (path: string) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/')) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
};

export interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock?: number;
  unit?: string;
  brand?: string;
  comparePrice?: number;
  images?: string[];
}

export type UpdateProductPayload = Partial<CreateProductPayload> & { status?: Product['status'] };

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get('/categories');
  return res.data.data ?? [];
}

export async function fetchMyProducts(): Promise<Product[]> {
  const res = await api.get('/products/mine');
  const payload = res.data.data;
  return payload.data ?? [];
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await api.post('/products', payload);
  return res.data.data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const res = await api.put(`/products/${id}`, payload);
  return res.data.data;
}

export async function removeProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/products/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url;
}