'use client';

import { useState } from 'react';
import { Users, Search, Edit2, X, CheckCircle, XCircle, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  orders: number;
  date: string;
}

const data: UserItem[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 12, date: '29/07/2026' },
  { id: '2', name: 'Fazenda Boa Vista', email: 'contato@boavista.com', role: 'SUPPLIER', status: 'Pendente', orders: 0, date: '28/07/2026' },
  { id: '3', name: 'Maria Oliveira', email: 'maria@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 8, date: '27/07/2026' },
  { id: '4', name: 'Agro Tech Ltda', email: 'admin@agrotech.com', role: 'SUPPLIER', status: 'Aprovado', orders: 45, date: '26/07/2026' },
  { id: '5', name: 'Carlos Pereira', email: 'carlos@email.com', role: 'CUSTOMER', status: 'Bloqueado', orders: 3, date: '25/07/2026' },
  { id: '6', name: 'Sementes Silva', email: 'vendas@sementessilva.com', role: 'SUPPLIER', status: 'Aprovado', orders: 128, date: '24/07/2026' },
  { id: '7', name: 'Ana Souza', email: 'ana@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 5, date: '23/07/2026' },
  { id: '8', name: 'Fertilizantes ABC', email: 'contato@fertabc.com', role: 'SUPPLIER', status: 'Pendente', orders: 0, date: '22/07/2026' },
  { id: '9', name: 'IrrigaFácil', email: 'vendas@irrigafacil.com', role: 'SUPPLIER', status: 'Aprovado', orders: 67, date: '21/07/2026' },
  { id: '10', name: 'Pedro Santos', email: 'pedro@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 15, date: '20/07/2026' },
  { id: '11', name: 'Máquinas Agrícolas LTDA', email: 'contato@maquinasagri.com', role: 'SUPPLIER', status: 'Aprovado', orders: 34, date: '19/07/2026' },
  { id: '12', name: 'Juliana Costa', email: 'juliana@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 2, date: '18/07/2026' },
  { id: '13', name: 'Defensivos Nacional', email: 'pedidos@defensivosnac.com', role: 'SUPPLIER', status: 'Aprovado', orders: 92, date: '17/07/2026' },
  { id: '14', name: 'Admin Master', email: 'admin@agrobuscafacil.com', role: 'ADMIN', status: 'Ativo', orders: 0, date: '01/01/2024' },
  { id: '15', name: 'Roberto Lima', email: 'roberto@email.com', role: 'CUSTOMER', status: 'Bloqueado', orders: 1, date: '16/07/2026' },
  { id: '16', name: 'Sementes Genetix', email: 'comercial@sementesgenetix.com', role: 'SUPPLIER', status: 'Aprovado', orders: 54, date: '15/07/2026' },
  { id: '17', name: 'Fernanda Almeida', email: 'fernanda@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 9, date: '14/07/2026' },
  { id: '18', name: 'NutriPlant Fertilizantes', email: 'admin@nutriplant.com', role: 'SUPPLIER', status: 'Aprovado', orders: 76, date: '13/07/2026' },
  { id: '19', name: 'Lucas Mendes', email: 'lucas@email.com', role: 'CUSTOMER', status: 'Ativo', orders: 22, date: '12/07/2026' },
  { id: '20', name: 'Moderador Sistema', email: 'mod@agrobuscafacil.com', role: 'ADMIN', status: 'Ativo', orders: 0, date: '15/03/2024' },
];

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserItem[]>(data);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editItem, setEditItem] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function startEdit(u: UserItem) {
    setEditItem({ ...u });
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setItems(items.map((u) => (u.id === editItem.id ? editItem : u)));
    toast.success('Usuario atualizado');
    setSaving(false);
    setEditItem(null);
  }

  function doToggle(u: UserItem) {
    const ns = u.status === 'Ativo' || u.status === 'Aprovado' ? 'Bloqueado' : 'Ativo';
    setItems(items.map((x) => (x.id === u.id ? { ...x, status: ns } : x)));
    toast.success('Status alterado');
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todos os usuarios da plataforma.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou email..." className="input-field pl-9 text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field text-sm w-full sm:w-44">
          <option value="all">Todos os tipos</option>
          <option value="CUSTOMER">Clientes</option>
          <option value="SUPPLIER">Fornecedores</option>
          <option value="ADMIN">Administradores</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-medium">Usuario</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Pedidos</th>
                <th className="p-4 font-medium">Cadastro</th>
                <th className="p-4 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600">{u.name.charAt(0)}</div>
                    <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (u.role === 'SUPPLIER' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                      {u.role === 'SUPPLIER' ? 'Fornecedor' : u.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => doToggle(u)} className={'text-xs px-2 py-0.5 rounded-full font-medium transition-colors ' + (u.status === 'Ativo' || u.status === 'Aprovado' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-red-50 hover:text-red-700' : u.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-green-50 hover:text-green-700')}>
                      {u.status}
                    </button>
                  </td>
                  <td className="p-4 text-gray-500">{u.orders}</td>
                  <td className="p-4 text-gray-500">{u.date}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => doToggle(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600">
                        {u.status === 'Ativo' || u.status === 'Aprovado' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum usuario encontrado.</p>
          </div>
        )}
      </div>

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Usuario</h2>
              <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input type="text" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" value={editItem.email} onChange={(e) => setEditItem({ ...editItem, email: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo</label>
                  <select value={editItem.role} onChange={(e) => setEditItem({ ...editItem, role: e.target.value })} className="input-field">
                    <option value="CUSTOMER">Cliente</option>
                    <option value="SUPPLIER">Fornecedor</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value })} className="input-field">
                    <option value="Ativo">Ativo</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Bloqueado">Bloqueado</option>
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
