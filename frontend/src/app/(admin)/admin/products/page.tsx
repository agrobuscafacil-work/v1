'use client';

import { useState } from 'react';
import { Package, Search, Edit2, X, Save, Loader2, CheckCircle, XCircle, Eye, Store, DollarSign, Package as PackageIcon, Tag, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductItem {
  id: string;
  name: string;
  supplier: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

const data: ProductItem[] = [
  { id: '1', name: 'Semente de Soja Transgênica RR', supplier: 'Sementes Silva', category: 'Sementes', price: 189.90, stock: 45, status: 'Ativo' },
  { id: '2', name: 'Fertilizante NPK 20-10-10', supplier: 'Fertilizantes ABC', category: 'Fertilizantes', price: 89.90, stock: 120, status: 'Ativo' },
  { id: '3', name: 'Defensivo Agrícola Glifosato', supplier: 'Agro Tech Ltda', category: 'Defensivos', price: 45.90, stock: 3, status: 'Inativo' },
  { id: '4', name: 'Trator Agrícola 75cv', supplier: 'Máquinas Agrícolas LTDA', category: 'Máquinas', price: 89990.00, stock: 5, status: 'Ativo' },
  { id: '5', name: 'Arado de Disco 4 Discos', supplier: 'Agro Tech Ltda', category: 'Implementos', price: 3499.90, stock: 10, status: 'Pendente' },
  { id: '6', name: 'Sistema de Irrigação por Gotejamento', supplier: 'IrrigaFácil', category: 'Irrigação', price: 1299.90, stock: 8, status: 'Ativo' },
  { id: '7', name: 'Milho Híbrido Safrinha', supplier: 'Sementes Genetix', category: 'Sementes', price: 259.90, stock: 72, status: 'Ativo' },
  { id: '8', name: 'Inseticida Biológico Lagarta', supplier: 'BioDefensivos Naturais', category: 'Defensivos', price: 78.50, stock: 34, status: 'Ativo' },
  { id: '9', name: 'Colheitadeira Automotriz', supplier: 'Máquinas Agrícolas LTDA', category: 'Máquinas', price: 349990.00, stock: 2, status: 'Ativo' },
  { id: '10', name: 'Fungicida Tratamento Sementes', supplier: 'Defensivos Nacional', category: 'Defensivos', price: 112.30, stock: 56, status: 'Ativo' },
  { id: '11', name: 'Ração para Gado Leiteiro', supplier: 'Pecuária Forte', category: 'Pecuária', price: 89.90, stock: 200, status: 'Ativo' },
  { id: '12', name: 'Suplemento Mineral Bovino', supplier: 'Pecuária Forte', category: 'Pecuária', price: 145.00, stock: 88, status: 'Ativo' },
  { id: '13', name: 'Kit Irrigação por Aspersão', supplier: 'IrrigaTech Solutions', category: 'Irrigação', price: 2450.00, stock: 6, status: 'Bloqueado' },
  { id: '14', name: 'Pulverizador Costal 20L', supplier: 'Agro Tech Ltda', category: 'Implementos', price: 549.90, stock: 22, status: 'Ativo' },
  { id: '15', name: 'Sistema de GPS Agrícola', supplier: 'AgroTec Sistemas', category: 'Tecnologia', price: 3899.00, stock: 7, status: 'Ativo' },
  { id: '16', name: 'Silo Metálico 5000Kg', supplier: 'Armazenagem Total', category: 'Armazenagem', price: 18990.00, stock: 3, status: 'Ativo' },
  { id: '17', name: 'Fertilizante Orgânico Húmus', supplier: 'Orgânicos do Vale', category: 'Fertilizantes', price: 42.50, stock: 0, status: 'Pendente' },
  { id: '18', name: 'Defensivo Natural Neem', supplier: 'BioDefensivos Naturais', category: 'Defensivos', price: 36.90, stock: 41, status: 'Ativo' },
  { id: '19', name: 'Adubo Foliar Líquido', supplier: 'NutriPlant Fertilizantes', category: 'Fertilizantes', price: 67.80, stock: 93, status: 'Ativo' },
  { id: '20', name: 'Conjunto de Grade Aradora', supplier: 'Agro Tech Ltda', category: 'Implementos', price: 7890.00, stock: 4, status: 'Ativo' },
  { id: '21', name: 'Cerca Elétrica Rural', supplier: 'Agro Tech Ltda', category: 'Diversos', price: 1299.00, stock: 15, status: 'Ativo' },
  { id: '22', name: 'Dron Agrícola Pulverizador', supplier: 'AgroTec Sistemas', category: 'Tecnologia', price: 45990.00, stock: 2, status: 'Ativo' },
  { id: '23', name: 'Veículo Utilitário Rural', supplier: 'Máquinas Agrícolas LTDA', category: 'Máquinas', price: 129990.00, stock: 1, status: 'Ativo' },
  { id: '24', name: 'Semente de Pastagem Braquiária', supplier: 'Sementes Silva', category: 'Sementes', price: 79.90, stock: 155, status: 'Ativo' },
];

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductItem[]>(data);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<ProductItem | null>(null);
  const [detailItem, setDetailItem] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(p: ProductItem) {
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

  function doToggleStatus(p: ProductItem) {
    const map: Record<string, string> = { 'Ativo': 'Inativo', 'Inativo': 'Ativo', 'Pendente': 'Ativo' };
    const ns = map[p.status] || 'Ativo';
    setItems(items.map((x) => (x.id === p.id ? { ...x, status: ns } : x)));
    toast.success('Status alterado');
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todos os produtos da plataforma.</p>
        </div>
        <div className="text-sm text-gray-500">Total: {items.length} produtos</div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos ou fornecedores..." className="input-field pl-9 text-sm" />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Fornecedor</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Preco</th>
                <th className="p-4 font-medium">Estoque</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="p-4 text-gray-500">{p.supplier}</td>
                  <td className="p-4 text-gray-500">{p.category}</td>
                  <td className="p-4 font-semibold text-primary-600">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4"><span className={p.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-500'}>{p.stock}</span></td>
                  <td className="p-4">
                    <button onClick={() => doToggleStatus(p)} className={'text-xs px-2 py-0.5 rounded-full font-medium transition-colors ' + (p.status === 'Ativo' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-red-50 hover:text-red-700' : p.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-green-50 hover:text-green-700')}>
                      {p.status}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button onClick={() => setDetailItem(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => doToggleStatus(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600">
                        {p.status === 'Ativo' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
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
                  <Store className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fornecedor</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailItem.supplier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <PackageIcon className="h-5 w-5 text-gray-400" />
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
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Status</p>
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (detailItem.status === 'Ativo' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : detailItem.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>{detailItem.status}</span>
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
                  <input type="text" value={editItem.supplier} onChange={(e) => setEditItem({ ...editItem, supplier: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Categoria</label>
                  <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} className="input-field">
                    <option value="Sementes">Sementes</option>
                    <option value="Fertilizantes">Fertilizantes</option>
                    <option value="Defensivos">Defensivos</option>
                    <option value="Implementos">Implementos</option>
                    <option value="Irrigacao">Irrigacao</option>
                    <option value="Maquinas">Maquinas</option>
                  </select>
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
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Pendente">Pendente</option>
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
