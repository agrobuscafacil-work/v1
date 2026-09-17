'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Edit2, X, CheckCircle, XCircle, Save, Loader2, ChevronLeft, ChevronRight, Plus, Trash2, Download, Mail, Eye, RefreshCcw, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
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
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    password: string;
    document: string;
    phone: string;
    role: User['role'];
    active: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);

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

  function startCreate() {
    setNewUser({
      name: '',
      email: '',
      password: '',
      document: '',
      phone: '',
      role: 'CUSTOMER',
      active: true,
    });
  }

  async function createUser() {
    if (!newUser) return;
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.document) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/users', newUser);
      toast.success('Usuário criado com sucesso');
      setNewUser(null);
      setPage(1);
      const res2 = await api.get('/users', { params: { page: 1, limit: 10 } });
      const payload = res2.data.data;
      setUsers(payload?.data ?? []);
      setTotal(payload?.meta?.total ?? 0);
      setTotalPages(payload?.meta?.totalPages ?? 0);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao criar usuário');
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

  async function deleteUser(user: User) {
    setConfirmDelete(user);
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      toast.success('Usuário excluído com sucesso');
      setUsers(users.filter(u => u.id !== confirmDelete?.id));
      if (total > 0) setTotal(prev => prev - 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao excluir usuário');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }

  async function bulkDelete() {
    if (selectedUsers.length === 0) return;
    setDeleting('bulk');
    try {
      await api.delete('/users/bulk', { data: { ids: selectedUsers } });
      toast.success(`${selectedUsers.length} usuário(s) excluído(s) com sucesso`);
      setUsers(users.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      setTotal(prev => prev - selectedUsers.length);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao excluir usuários');
    } finally {
      setDeleting(null);
    }
  }

  function toggleSelectUser(userId: string) {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  function toggleSelectAll() {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  }

  async function exportUsers() {
    setExporting(true);
    try {
      const res = await api.get('/users/export', {
        params: { role: roleFilter !== 'all' ? roleFilter : undefined, search: search.trim() || undefined },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Exportação concluída');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao exportar usuários');
    } finally {
      setExporting(false);
    }
  }

  function viewUserDetail(u: User) {
    setViewUser(u);
  }

  async function resetPassword(user: User) {
    if (!confirm('Tem certeza que deseja enviar email de redefinição de senha?')) return;
    try {
      await api.post(`/users/${user.id}/reset-password`);
      toast.success('E-mail de redefinição de senha enviado');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao enviar e-mail de redefinição');
    }
  }

  async function resendWelcomeEmail(user: User) {
    if (!confirm('Tem certeza que deseja reenviar e-mail de boas-vindas?')) return;
    try {
      await api.post(`/users/${user.id}/resend-welcome`);
      toast.success('E-mail de boas-vindas reenviado');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao reenviar e-mail');
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todos os usuarios da plataforma.</p>
        </div>
        <button onClick={startCreate} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>

        <div className="hidden sm:block sm:flex items-center gap-2">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field text-sm w-44">
            <option value="all">Todos os tipos</option>
            <option value="CUSTOMER">Clientes</option>
            <option value="SUPPLIER">Fornecedores</option>
            <option value="ADMIN">Administradores</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <label className="text-xs text-gray-500 ml-2">Filtrar por tipo</label>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <button onClick={exportUsers} className="btn-ghost text-sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </button>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 sm:hidden">
            <button onClick={bulkDelete} className="btn-error text-sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir {selectedUsers.length}
            </button>
          </div>
        )}

        <div className="sm:flex sm:items-center sm:gap-4">
          <button onClick={toggleSelectAll} className={selectedUsers.length > 0 ? 'btn-ghost text-sm' : 'opacity-40 cursor-not-allowed'}>
            {selectedUsers.length === users.length ? 'Desselecionar todos' : 'Selecionar todos'}
          </button>
          <button onClick={bulkDelete} className="btn-error sm:hidden text-sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </button>
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
                <th className="p-4 font-medium">Selecionar</th>
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
                      <td className="p-4">
                        <input type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => toggleSelectUser(u.id)}
                          className="checkbox-checkbox h-4 w-4 text-primary-600" />
                      </td>
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
                          <button onClick={() => viewUserDetail(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-cyan-400">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => resetPassword(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-orange-400">
                            <RefreshCcw className="h-4 w-4" />
                          </button>
                          <button onClick={() => resendWelcomeEmail(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-400">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteUser(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl my-auto">
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

      {newUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl my-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Usuario</h2>
              <button onClick={() => setNewUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="input-field" placeholder="Nome completo" required />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="input-field" placeholder="email@exemplo.com" required />
              </div>
              <div>
                <label className="label-field">Senha</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input-field" placeholder="Mínimo 8 caracteres" required minLength={8} />
              </div>
              <div>
                <label className="label-field">Documento (CPF/CNPJ)</label>
                <input type="text" value={newUser.document} onChange={(e) => setNewUser({ ...newUser, document: e.target.value })} className="input-field" placeholder="000.000.000-00 ou 00.000.000/0000-00" required />
              </div>
              <div>
                <label className="label-field">Telefone</label>
                <input type="text" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="input-field" placeholder="(11) 99999-9999" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })} className="input-field" required>
                    <option value="CUSTOMER">Cliente</option>
                    <option value="SUPPLIER">Fornecedor</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={newUser.active ? 'Ativo' : 'Bloqueado'} onChange={(e) => setNewUser({ ...newUser, active: e.target.value === 'Ativo' })} className="input-field">
                    <option value="Ativo">Ativo</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setNewUser(null)} className="btn-outline text-sm">Cancelar</button>
              <button onClick={createUser} disabled={saving} className="btn-primary text-sm gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Criar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl my-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Visualizar Usuario</h2>
              <button onClick={() => setViewUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input type="text" value={viewUser.name} disabled className="input-field" />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" value={viewUser.email} disabled className="input-field" />
              </div>
              <div>
                <label className="label-field">Tipo</label>
                <input type="text" value={ROLE_LABELS[viewUser.role] || viewUser.role} disabled className="input-field" />
              </div>
              <div>
                <label className="label-field">Status</label>
                <select disabled className="input-field">
                  <option value="Ativo" selected={viewUser.active}>Ativo</option>
                  <option value="Bloqueado" selected={!viewUser.active}>Bloqueado</option>
                </select>
              </div>
              <div>
                <label className="label-field">Telefone</label>
                <input type="text" value={viewUser.phone || '—'} disabled className="input-field" />
              </div>
              <div>
                <label className="label-field">Documento</label>
                <input type="text" value={viewUser.document || '—'} disabled className="input-field" />
              </div>
              <div>
                <label className="label-field">Cadastro</label>
                <input type="text" value={viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString('pt-BR') : '—'} disabled className="input-field" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setViewUser(null)} className="btn-outline text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Exclusão</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tem certeza que deseja excluir o usuário <strong>{confirmDelete.name}</strong> ({confirmDelete.email})?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-outline">Cancelar</button>
                <button onClick={confirmDeleteAction} disabled={!!deleting} className="btn-error gap-2">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}