'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Search, Plus, Edit2, Trash2, Save, Loader2, Eye, X, DollarSign, Tag, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const products = [
  { id: '1', name: 'Semente de Soja Transgênica', category: 'Sementes', price: 189.90, stock: 45, status: 'active', image: 'SS' },
  { id: '2', name: 'Fertilizante NPK 20-10-10', category: 'Fertilizantes', price: 89.90, stock: 120, status: 'active', image: 'NP' },
  { id: '3', name: 'Defensivo Agrícola Glifosato', category: 'Defensivos', price: 45.90, stock: 3, status: 'active', image: 'GL' },
  { id: '4', name: 'Arado de Disco 4 Discos', category: 'Implementos', price: 3499.90, stock: 10, status: 'inactive', image: 'AD' },
  { id: '5', name: 'Sistema de Irrigação por Gotejamento', category: 'Irrigação', price: 1299.90, stock: 8, status: 'active', image: 'SG' },
  { id: '6', name: 'Fertilizante Orgânico Húmus', category: 'Fertilizantes', price: 42.50, stock: 66, status: 'active', image: 'FO' },
  { id: '7', name: 'Inseticida Biológico Lagarta', category: 'Defensivos', price: 78.50, stock: 34, status: 'active', image: 'IB' },
  { id: '8', name: 'Fungicida Tratamento Sementes', category: 'Defensivos', price: 112.30, stock: 56, status: 'active', image: 'FT' },
  { id: '9', name: 'Adubo Foliar Líquido', category: 'Fertilizantes', price: 67.80, stock: 93, status: 'active', image: 'AF' },
  { id: '10', name: 'Semente de Milho Híbrido', category: 'Sementes', price: 259.90, stock: 38, status: 'active', image: 'MH' },
  { id: '11', name: 'Pulverizador Costal 20L', category: 'Implementos', price: 549.90, stock: 22, status: 'active', image: 'PC' },
  { id: '12', name: 'Semente de Pastagem Braquiária', category: 'Sementes', price: 79.90, stock: 88, status: 'active', image: 'PB' },
  { id: '13', name: 'Cerca Elétrica Rural', category: 'Diversos', price: 1299.00, stock: 15, status: 'inactive', image: 'CE' },
  { id: '14', name: 'Kit Irrigação por Aspersão', category: 'Irrigação', price: 2450.00, stock: 6, status: 'active', image: 'KA' },
  { id: '15', name: 'Defensivo Natural Neem', category: 'Defensivos', price: 36.90, stock: 41, status: 'active', image: 'DN' },
];

export default function SupplierProductsPage() {
  const [search, setSearch] = useState('');
  const [detailItem, setDetailItem] = useState<typeof products[0] | null>(null);
  const [editItem, setEditItem] = useState<typeof products[0] | null>(null);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState(products);

  const filtered = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(p: typeof products[0]) {
    setEditItem({ ...p });
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setItems(items.map((p) => (p.id === editItem.id ? editItem : p)));
    toast.success('Produto atualizado');
    setSaving(false);
    setEditItem(null);
  }

  function doToggleStatus(p: typeof products[0]) {
    const ns = p.status === 'active' ? 'inactive' : 'active';
    setItems(items.map((x) => (x.id === p.id ? { ...x, status: ns } : x)));
    toast.success(`Produto ${ns === 'active' ? 'ativado' : 'inativado'}`);
  }

  function doRemove(p: typeof products[0]) {
    setItems(items.filter((x) => x.id !== p.id));
    toast.success('Produto removido');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-12 w-12 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">{product.image}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600" onClick={() => setDetailItem(product)}>
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600" onClick={() => startEdit(product)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600" onClick={() => doRemove(product)}>
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
                product.status === 'active'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-red-50 hover:text-red-700'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-green-50 hover:text-green-700'
              }`}>
                {product.status === 'active' ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum produto encontrado.</p>
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
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Categoria</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Preco</p>
                    <p className="text-sm font-semibold text-primary-600">R$ {detailItem.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Codigo</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.image}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Status</p>
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (detailItem.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>{detailItem.status === 'active' ? 'Ativo' : 'Inativo'}</span>
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
                  <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} className="input-field">
                    <option value="Sementes">Sementes</option>
                    <option value="Fertilizantes">Fertilizantes</option>
                    <option value="Defensivos">Defensivos</option>
                    <option value="Implementos">Implementos</option>
                    <option value="Irrigação">Irrigação</option>
                    <option value="Máquinas">Máquinas</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Codigo</label>
                  <input type="text" value={editItem.image} onChange={(e) => setEditItem({ ...editItem, image: e.target.value })} className="input-field" />
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
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
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
