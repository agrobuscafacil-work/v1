'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Search, Plus, Edit2, Trash2, Save, Loader2, Eye, X, DollarSign, Tag, Hash, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMyProducts, updateProduct, removeProduct, fetchCategories, uploadProductImage, PRODUCT_FILE_URL } from '@/lib/products';
import type { Product, Category } from '@/types';

const MAX_SIZE = 5 * 1024 * 1024;

interface EditableProduct {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

export default function SupplierProductsPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<EditableProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState<EditableProduct | null>(null);
  const [editItem, setEditItem] = useState<EditableProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<EditableProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMyProducts(), fetchCategories()])
      .then(([prods, cats]) => {
        if (cancelled) return;
        setCategories(cats.filter((c) => c.active));
        setItems(
          prods.map((p) => ({
            id: p.id,
            name: p.name,
            categoryId: p.categoryId,
            categoryName: p.category?.name || '',
            price: Number(p.price),
            stock: Number(p.stock),
            status: p.status,
            images: p.images ?? [],
          })),
        );
      })
      .catch(() => {
        if (!cancelled) toast.error('Erro ao carregar produtos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = items.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  const isActive = (status: string) => status === 'ACTIVE' || status === 'OUT_OF_STOCK';

  function startEdit(p: EditableProduct) {
    setEditItem({ ...p });
  }

  async function saveEdit() {
    if (!editItem) return;
    if (!editItem.name.trim()) return toast.error('Informe o nome.');
    if (!editItem.categoryId) return toast.error('Selecione a categoria.');
    setSaving(true);
    try {
      const updated = await updateProduct(editItem.id, {
        name: editItem.name.trim(),
        categoryId: editItem.categoryId,
        price: editItem.price,
        stock: editItem.stock,
        status: editItem.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        images: editItem.images,
      });
      setItems((prev) =>
        prev.map((x) =>
          x.id === editItem.id
            ? {
                ...x,
                name: updated.name,
                categoryId: updated.categoryId,
                categoryName: updated.category?.name || x.categoryName,
                price: Number(updated.price),
                stock: Number(updated.stock),
                status: updated.status,
                images: updated.images ?? [],
              }
            : x,
        ),
      );
      toast.success('Produto atualizado');
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao atualizar.');
    } finally {
      setSaving(false);
    }
  }

  async function doToggleStatus(p: EditableProduct) {
    const next = isActive(p.status) ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await updateProduct(p.id, { status: next });
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, status: updated.status } : x)),
      );
      toast.success(`Produto ${next === 'ACTIVE' ? 'ativado' : 'inativado'}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao atualizar.');
    }
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await removeProduct(deleteItem.id);
      setItems((prev) => prev.filter((x) => x.id !== deleteItem.id));
      toast.success('Produto removido');
      setDeleteItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao remover.');
    } finally {
      setDeleting(false);
    }
  }

  const CardImage = ({ p }: { p: EditableProduct }) => {
    if (p.images?.[0]) {
      return (
        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Image src={PRODUCT_FILE_URL(p.images[0])} alt={p.name} fill sizes="48px" className="object-cover" />
        </div>
      );
    }
    return (
      <div className="h-12 w-12 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">
      <Package className="h-5 w-5" />
      </div>
    );
  };

  async function handleEditFile(file?: File) {
    if (!file || !editItem) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isPng = file.type === 'image/png' || ext === 'png';
    const isJpg = file.type === 'image/jpeg' || ['jpg', 'jpeg', 'jpe'].includes(ext);
    if (!isPng && !isJpg) {
      toast.error('Apenas imagens PNG ou JPG são aceitas.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('A imagem deve ter no máximo 5 MB.');
      return;
    }
    setUploadingEditImage(true);
    try {
      const url = await uploadProductImage(file);
      setEditItem((prev) => (prev ? { ...prev, images: [...prev.images, url] } : prev));
      toast.success('Imagem enviada');
    } catch {
      toast.error('Falha ao enviar a imagem.');
    } finally {
      setUploadingEditImage(false);
      if (editFileRef.current) editFileRef.current.value = '';
    }
  }

  function removeEditImage(idx: number) {
    if (!editItem) return;
    setEditItem({ ...editItem, images: editItem.images.filter((_, i) => i !== idx) });
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie o catálogo da sua loja.</p>
        </div>
        <Link href="/supplier/products/new" className="btn-primary text-sm gap-2 inline-flex items-center">
          <Plus className="h-4 w-4" /> Novo Produto
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..." className="input-field pl-9 text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex items-start gap-3 mb-3">
                <CardImage p={product} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.categoryName}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600" onClick={() => setDetailItem(product)}>
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600" onClick={() => startEdit(product)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600" onClick={() => setDeleteItem(product)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-primary-600">R$ {product.price.toFixed(2)}</p>
                  <p className={`text-xs ${product.stock <= 5 ? 'text-red-600' : 'text-gray-500'}`}>
                    Estoque: {product.stock}
                  </p>
                </div>
                <button onClick={() => doToggleStatus(product)} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                  isActive(product.status)
                    ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-red-50 hover:text-red-700'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-green-50 hover:text-green-700'
                }`}>
                  {isActive(product.status) ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-12">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      )}

      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes do Produto</h2>
              <button onClick={() => setDetailItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Tag className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Produto</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{detailItem.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Categoria</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.categoryName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Preço</p>
                    <p className="text-sm font-semibold text-primary-600">R$ {detailItem.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Estoque</p>
                    <p className={`text-sm font-medium ${detailItem.stock <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{detailItem.stock} un</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{isActive(detailItem.status) ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setDetailItem(null)} className="btn-outline text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Produto</h2>
              <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input type="text" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Categoria</label>
                  <select value={editItem.categoryId} onChange={(e) => setEditItem({ ...editItem, categoryId: e.target.value })} className="input-field">
                    <option value="">Selecione</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value as Product['status'] })} className="input-field">
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Preço (R$)</label>
                  <input type="number" step="0.01" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Estoque</label>
                  <input type="number" value={editItem.stock} onChange={(e) => setEditItem({ ...editItem, stock: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-field">Imagem do Produto</label>
                <input
                  ref={editFileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => handleEditFile(e.target.files?.[0])}
                />
                {editItem.images.length > 0 ? (
                  <div className="space-y-2">
                    {editItem.images.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                        <div className="relative h-14 w-14 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                          <Image src={PRODUCT_FILE_URL(img)} alt="Imagem do produto" fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">{img.split('/').pop()}</p>
                          <button
                            type="button"
                            onClick={() => removeEditImage(idx)}
                            disabled={uploadingEditImage}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Excluir imagem
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => editFileRef.current?.click()}
                      disabled={uploadingEditImage}
                      className="btn-outline text-xs gap-1 inline-flex items-center px-3 py-2"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingEditImage ? 'Enviando...' : 'Adicionar imagem'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    disabled={uploadingEditImage}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 text-center hover:border-primary-400 transition-colors"
                  >
                    {uploadingEditImage ? (
                      <Loader2 className="h-6 w-6 text-gray-400 mx-auto mb-2 animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm text-gray-500">
                      {uploadingEditImage ? 'Enviando imagem...' : 'Adicionar imagem'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG ou JPG, até 5MB</p>
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setEditItem(null)} className="btn-outline text-sm">Cancelar</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-start gap-4 p-5">
              <div className="flex-shrink-0 h-11 w-11 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Excluir produto</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tem certeza que deseja excluir o produto{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{deleteItem.name}</span>?
                  Esta ação é definitiva.
                </p>
              </div>
              <button
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setDeleteItem(null)} disabled={deleting} className="btn-outline text-sm">
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}