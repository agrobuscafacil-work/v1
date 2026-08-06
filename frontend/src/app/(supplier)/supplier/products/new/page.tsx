'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Loader2, Upload, Save, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCategories, createProduct, uploadProductImage } from '@/lib/products';
import type { Category } from '@/types';

const MAX_SIZE = 5 * 1024 * 1024;

const MIME_LABELS: Record<string, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/bmp': 'BMP',
  'image/svg+xml': 'SVG',
  'image/avif': 'AVIF',
  'image/tiff': 'TIFF',
  'application/pdf': 'PDF',
};

function describeType(file: File): string {
  const mimeLabel = MIME_LABELS[file.type];
  if (mimeLabel) return mimeLabel;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ext ? ext.toUpperCase() : 'desconhecido';
}

function isPngOrJpg(file: File): boolean {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const isPng = file.type === 'image/png' || ext === 'png';
  const isJpg =
    file.type === 'image/jpeg' || ['jpg', 'jpeg', 'jpe'].includes(ext);
  return isPng || isJpg;
}

function formatSizeMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2).replace('.', ',');
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    stock: '',
  });

  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((cats) => {
        if (active) setCategories(cats.filter((c) => c.active));
      })
      .catch(() => toast.error('Não foi possível carregar as categorias'))
      .finally(() => {
        if (active) setLoadingCats(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileError('');

    const fileName = file.name;

    if (!isPngOrJpg(file)) {
      setFileError(
        `O arquivo "${fileName}" está no formato ${describeType(file)} — o cadastro aceita apenas imagens PNG ou JPG. Selecione um arquivo PNG ou JPG.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      setFileError(
        `A imagem "${fileName}" tem ${formatSizeMb(file.size)} MB, acima do limite de 5 MB. Selecione uma imagem de até 5 MB.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
      toast.success('Imagem enviada com sucesso!');
    } catch {
      setImageUrl('');
      setPreview('');
      toast.error('Falha ao enviar a imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const price = parseFloat(form.price.replace(',', '.'));
    const stock = parseInt(form.stock || '0', 10);
    if (!form.name.trim()) return toast.error('Informe o nome do produto.');
    if (!form.categoryId) return toast.error('Selecione uma categoria.');
    if (!form.description.trim()) return toast.error('Informe a descrição.');
    if (isNaN(price) || price < 0) return toast.error('Informe um preço válido.');

    setIsLoading(true);
    try {
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        price,
        stock: isNaN(stock) || stock < 0 ? 0 : stock,
        unit: 'un',
        images: imageUrl ? [imageUrl] : [],
      });
      toast.success('Produto cadastrado com sucesso!');
      router.push('/supplier/products');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao salvar o produto.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Produto</h1>
        <p className="text-sm text-gray-500 mt-1">Cadastre um novo produto no seu catálogo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Básicas</h2>
          <div className="space-y-4">
            <div>
              <label className="label-field">Nome do Produto</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Ex: Semente de Soja Transgênica"
              />
            </div>
            <div>
              <label className="label-field">Categoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="input-field"
              >
                <option value="">{loadingCats ? 'Carregando...' : 'Selecione'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Descrição</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field resize-none"
                placeholder="Descreva o produto em detalhes..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preço e Estoque</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="label-field">Estoque</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Imagem do Produto</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {preview ? (
            <div className="flex items-center gap-4">
              <img
                src={preview}
                alt="Pré-visualização"
                className="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">Imagem pronta para envio.</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline text-xs gap-1 inline-flex items-center px-3 py-2"
                    disabled={uploading}
                  >
                    <Upload className="h-3.5 w-3.5" /> Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview('');
                      setImageUrl('');
                      setFileError('');
                    }}
                    className="text-xs text-red-600 inline-flex items-center gap-1 px-2 py-1"
                  >
                    <X className="h-3.5 w-3.5" /> Remover
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-400 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 text-gray-400 mx-auto mb-3 animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              )}
              <p className="text-sm text-gray-500">
                {uploading ? 'Enviando imagem...' : 'Arraste uma imagem ou clique para selecionar'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG ou JPG, até 5MB</p>
            </button>
          )}
          {fileError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{fileError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isLoading || uploading} className="btn-primary gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isLoading ? 'Salvando...' : 'Salvar Produto'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline">Cancelar</button>
        </div>
      </form>
    </div>
  );
}