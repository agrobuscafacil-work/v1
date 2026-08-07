'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Edit2, X, CheckCircle, XCircle, Save, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { User } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  SUPPLIER: 'Fornecedor',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Admin',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 10 };
        if (roleFilter !== 'all') params.role = roleFilter;
        if (search.trim()) params.search = search.trim();
        const res = await api.get('/users', { params });
        const payload = res.data.data;
        setUsers(payload?.data ?? []);
        setTotal(payload?.meta?.total ?? 0);
        setTotalPages(payload?.meta?.totalPages ?? 0);
      } catch (e: any) {
        setUsers([]);
        toast.error(e?.response?.data?.message || 'Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, roleFilter, search]);

  function startEdit(u: User) {
    setEditUser({ ...u });
  }

  async function saveEdit() {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await api.put(`/users/${editUser.id}`, {
        name: editUser.name,
        role: editUser.role,
        active: editUser.active,
      });
      const updated = res.data.data;
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      toast.success('Usuário atualizado');
      setEditUser(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  }

  async function doToggle(u: User) {
    try {
      const res = await api.put(`/users/${u.id}`, { active: !u.active });
      const updated = res.data.data;
      setUsers(users.map((x) => (x.id === updated.id ? updated : x)));
      toast.success('Status alterado');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao alterar status');
    }
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
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou email..." className="input-field pl-9 text-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field text-sm w-full sm:w-44">
          <option value="all">Todos os tipos</option>
          <option value="CUSTOMER">Clientes</option>
          <option value="SUPPLIER">Fornecedores</option>
          <option value="ADMIN">Administradores</option>
          <option value="SUPER_ADMIN">Super Admin</option>
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
                <th className="p-4 font-medium">Telefone</th>
                <th className="p-4 font-medium">Documento</th>
                <th className="p-4 font-medium">Cadastro</th>
                <th className="p-4 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                users.map((u) => {
                  const roleClass =
                    u.role === 'SUPPLIER'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : u.role === 'SUPER_ADMIN'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                  return (
                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600">{u.name?.charAt(0) || 'U'}</div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </td>
                      <td className="p-4 text-gray-500">{u.email}</td>
                      <td className="p-4">
                        <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + roleClass}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => doToggle(u)} className={'text-xs px-2 py-0.5 rounded-full font-medium transition-colors ' + (u.active ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-red-50 hover:text-red-700' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-green-50 hover:text-green-700')}>
                          {u.active ? 'Ativo' : 'Bloqueado'}
                        </button>
                      </td>
                      <td className="p-4 text-gray-500">{u.phone || '—'}</td>
                      <td className="p-4 text-gray-500">{u.document || '—'}</td>
                      <td className="p-4 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => doToggle(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600">
                            {u.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum usuario encontrado.</p>
          </div>
        )}
        {!loading && users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              {total} usuário(s) - página {page} de {totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost p-1.5 disabled:opacity-40" aria-label="Página anterior">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))} disabled={page >= totalPages} className="btn-ghost p-1.5 disabled:opacity-40" aria-label="Próxima página">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Usuario</h2>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input type="text" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" value={editUser.email} disabled className="input-field opacity-60" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo</label>
                  <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value as User['role'] })} className="input-field">
                    <option value="CUSTOMER">Cliente</option>
                    <option value="SUPPLIER">Fornecedor</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={editUser.active ? 'Ativo' : 'Bloqueado'} onChange={(e) => setEditUser({ ...editUser, active: e.target.value === 'Ativo' })} className="input-field">
                    <option value="Ativo">Ativo</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setEditUser(null)} className="btn-outline text-sm">Cancelar</button>
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
