'use client';

import { useEffect, useState } from 'react';
import { Package, Search, Edit2, X, Save, Loader2, Eye, Store, DollarSign, Package as PackageIcon, Tag, Hash, ChevronLeft, ChevronRight, Trash2, Calendar, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  saleCount: number;
  status: string;
  images: string[];
  createdAt: string;
  category: { id: string; name: string } | null;
  supplier: { id: string; companyName: string } | null;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' },
  INACTIVE: { label: 'Inativo', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  OUT_OF_STOCK: { label: 'Esgotado', className: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  DISCONTINUED: { label: 'Descontinuado', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  PENDING_REVIEW: { label: 'Pendente de revisão', className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  REJECTED: { label: 'Rejeitado', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'PENDING_REVIEW', 'REJECTED'];

function getErrorMessage(error: any): string {
  if (typeof error?.response?.data?.message === 'string') return error.response.data.message;
  return 'Erro inesperado. Tente novamente.';
}

function formatMoney(value: number) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editItem, setEditItem] = useState<ProductItem | null>(null);
  const [detailItem, setDetailItem] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 10, status: statusFilter || 'ALL' };
        if (search.trim()) params.search = search.trim();
        const res = await api.get('/products', { params });
        const payload = res.data.data;
        if (cancelled) return;
        setItems(payload.data ?? []);
        setPage(payload.meta?.page || 1);
        setTotalPages(payload.meta?.totalPages || 1);
        setTotal(payload.meta?.total || 0);
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setTotalPages(1);
          setTotal(0);
          toast.error('Erro ao carregar produtos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, statusFilter, search, refreshKey]);

  function startEdit(p: ProductItem) {
    setEditItem({ ...p });
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    try {
      await api.put(`/products/${editItem.id}`, {
        name: editItem.name,
        price: editItem.price,
        stock: editItem.stock,
        status: editItem.status,
      });
      toast.success('Produto atualizado');
      setEditItem(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(p: ProductItem) {
    if (!window.confirm(`Deseja excluir o produto "${p.name}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${p.id}`);
      toast.success('Produto excluído');
      if (detailItem?.id === p.id) setDetailItem(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todos os produtos da plataforma.</p>
        </div>
        <div className="text-sm text-gray-500">Total: {total} produtos</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar produtos..." className="input-field pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-sm w-full sm:w-44">
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_STYLES[s]?.label || s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Fornecedor</th>
                <th className="p-4 font-medium">Preco</th>
                <th className="p-4 font-medium">Estoque</th>
                <th className="p-4 font-medium">Vendas</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const statusInfo = STATUS_STYLES[p.status] || { label: p.status, className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
                return (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          {p.images?.[0] ? (
                            <img src={PRODUCT_FILE_URL(p.images[0])} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{p.category?.name || '—'}</td>
                    <td className="p-4 text-gray-500">{p.supplier?.companyName || '—'}</td>
                    <td className="p-4 font-semibold text-primary-600">R$ {formatMoney(p.price)}</td>
                    <td className="p-4"><span className={p.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-500'}>{p.stock}</span></td>
                    <td className="p-4 text-gray-500">{p.saleCount}</td>
                    <td className="p-4">
                      <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + statusInfo.className}>{statusInfo.label}</span>
                    </td>
                    <td className="p-4 text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => setDetailItem(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => doDelete(p)} disabled={deleting} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando produtos...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum produto encontrado.</p>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">{total} produto(s) - pagina {page} de {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost p-1.5 disabled:opacity-40" aria-label="Pagina anterior">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost p-1.5 disabled:opacity-40" aria-label="Proxima pagina">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
                  <Store className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fornecedor</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.supplier?.companyName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <PackageIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Categoria</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.category?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Preco</p>
                    <p className="text-sm font-semibold text-primary-600">R$ {formatMoney(detailItem.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Estoque</p>
                    <p className={'text-sm font-medium ' + (detailItem.stock <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-white')}>{detailItem.stock} un</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Vendas</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.saleCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Criado em</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(detailItem.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Status</p>
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (STATUS_STYLES[detailItem.status]?.className || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                  {STATUS_STYLES[detailItem.status]?.label || detailItem.status}
                </span>
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
                  <label className="label-field">Fornecedor</label>
                  <input type="text" value={editItem.supplier?.companyName || '—'} disabled className="input-field opacity-70" />
                </div>
                <div>
                  <label className="label-field">Categoria</label>
                  <input type="text" value={editItem.category?.name || '—'} disabled className="input-field opacity-70" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Preco (R$)</label>
                  <input type="number" step="0.01" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Estoque</label>
                  <input type="number" value={editItem.stock} onChange={(e) => setEditItem({ ...editItem, stock: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value })} className="input-field">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_STYLES[s]?.label || s}</option>
                    ))}
                  </select>
                </div>
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
    </div>
  );
}
