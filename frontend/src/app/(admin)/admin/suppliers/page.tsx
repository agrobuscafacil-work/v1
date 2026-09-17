'use client';

import { useEffect, useState } from 'react';
import { Store, Search, CheckCircle, XCircle, X, Loader2, MessageCircle, Send, ChevronLeft, ChevronRight, MapPin, Pencil, Crown, CreditCard, FileText, Shield, HelpCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { api } from '@/lib/api';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface SupplierItem {
  id: string;
  name: string;
  email: string;
  products: number;
  rating: number;
  status: string;
  date: string;
  city: string;
  state: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
}

interface SupplierForm {
  companyName: string;
  tradingName: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  description: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
}

interface ChatMessage {
  id: string;
  sender: 'admin' | 'supplier';
  text: string;
  time: string;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  APPROVED: { label: 'Aprovado', className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' },
  REJECTED: { label: 'Rejeitado', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
  BLOCKED: { label: 'Bloqueado', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

const TIER_LABELS: Record<string, { label: string; className: string; icon: any }> = {
  BASIC: { label: 'Básico', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Crown },
  STANDARD: { label: 'Padrão', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: CreditCard },
  PREMIUM: { label: 'Premium', className: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300', icon: FileText },
};

function getErrorMessage(error: any): string {
  if (typeof error?.response?.data?.message === 'string') return error.response.data.message;
  return 'Erro inesperado. Tente novamente.';
}

function formatDate(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export default function AdminSuppliersPage() {
  const [items, setItems] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [chatSupplier, setChatSupplier] = useState<SupplierItem | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [editSupplier, setEditSupplier] = useState<SupplierItem | null>(null);
  const [editForm, setEditForm] = useState<SupplierForm>({
    companyName: '', tradingName: '', phone: '', whatsapp: '', email: '', website: '', description: '',
    tier: 'BASIC',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 9 };
        if (statusFilter) params.status = statusFilter;
        if (search.trim()) params.search = search.trim();
        const res = await api.get('/suppliers/admin', { params });
        const payload = res.data.data;
        if (cancelled) return;
        setItems((payload.data ?? []).map((s: any) => ({
          id: s.id,
          name: s.companyName || s.tradingName || '-',
          email: s.email,
          products: Number(s.totalProducts) || 0,
          rating: Number(s.rating) || 0,
          status: s.status,
          date: formatDate(s.createdAt),
          city: s.addresses?.[0]?.city || '',
          state: s.addresses?.[0]?.state || '',
          tier: s.tier || 'BASIC',
        })));
        setTotalPages(payload.meta?.totalPages ?? 1);
      } catch {
        if (!cancelled) {
          setItems([]);
          setTotalPages(1);
          toast.error('Erro ao carregar fornecedores');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, statusFilter, search, refreshKey]);

  function openChat(supplier: SupplierItem) {
    setChatSupplier(supplier);
    setChatMessages([]);
    (async () => {
      try {
        const list = await api.get('/chat/admin/conversations');
        const conv = (list.data.data ?? []).find((c: any) => c.supplierId === supplier.id);
        if (conv) {
          const detail = await api.get(`/chat/admin/conversations/${conv.id}`);
          const messages = detail.data.data?.messages ?? [];
          setChatMessages(
            messages.map((m: any) => ({
              id: m.id,
              sender: m.senderId ? (m.senderId === localStorage.getItem('uid') ? 'admin' : 'supplier') : 'supplier',
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            })),
          );
        } else {
          setChatMessages([{ id: '0', sender: 'supplier', text: 'Nenhuma conversa ainda. Envie a primeira mensagem.', time: '' }]);
        }
      } catch {
        setChatMessages([{ id: '0', sender: 'supplier', text: 'Nenhuma conversa ainda. Envie a primeira mensagem.', time: '' }]);
      }
    })();
  }

  function sendChat() {
    if (!chatMessage.trim()) return;
    const msg: ChatMessage = { id: 'opt-' + Date.now().toString(), sender: 'admin', text: chatMessage.trim(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((prev) => [...prev, msg]);
    setChatMessage('');
    if (!chatSupplier) return;
    (async () => {
      try {
        let convId = '';
        const list = await api.get('/chat/admin/conversations');
        const found = (list.data.data ?? []).find((c: any) => c.supplierId === chatSupplier.id);
        if (found) {
          convId = found.id;
        } else {
          const created = await api.post('/chat/conversations', { otherPartyId: chatSupplier.id });
          convId = created.data.data?.id || created.data.data?.data?.id;
        }
        const sent = await api.post(`/chat/admin/conversations/${convId}/messages`, { content: msg.text, messageType: 'TEXT' });
        if (sent.data.data?.id) {
          setChatMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, id: sent.data.data.id } : m)));
        }
      } catch {
        toast.error('Erro ao enviar mensagem');
      }
    })();
  }

  async function updateApproval(id: string, approved: boolean, message: string) {
    setSavingId(id);
    try {
      await api.put(`/suppliers/${id}/approval`, { approved });
      toast.success(message);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingId(null);
    }
  }

  function doApprove(s: SupplierItem) {
    return updateApproval(s.id, true, 'Fornecedor aprovado');
  }

  function doReject(s: SupplierItem) {
    return updateApproval(s.id, false, 'Fornecedor rejeitado');
  }

  function doActivate(s: SupplierItem) {
    return updateApproval(s.id, true, 'Fornecedor ativado');
  }

  async function doBlock(s: SupplierItem) {
    setConfirm({
      title: 'Bloquear fornecedor',
      message: `Deseja bloquear o fornecedor ${s.name}?`,
      action: async () => {
        setSavingId(s.id);
        try {
          await api.delete(`/suppliers/${s.id}`);
          toast.success('Fornecedor bloqueado');
          setRefreshKey((k) => k + 1);
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setSavingId(null);
        }
      },
    });
  }

  function openEdit(s: SupplierItem) {
    setEditSupplier(s);
    setEditForm({
      companyName: s.name,
      tradingName: s.name,
      phone: '',
      whatsapp: '',
      email: s.email,
      website: '',
      description: '',
      tier: s.tier || 'BASIC',
    });
    api.get(`/suppliers/${s.id}`)
      .then((res) => {
        const sup = res.data.data ?? {};
        setEditForm((prev) => ({
          ...prev,
          companyName: sup.companyName || prev.companyName,
          tradingName: sup.tradingName || prev.companyName,
          phone: sup.phone || '',
          whatsapp: sup.whatsapp || '',
          website: sup.website || '',
          tier: sup.tier || prev.tier,
          description: sup.description || '',
        }));
      })
      .catch(() => undefined);
  }

  const setEditField = <K extends keyof SupplierForm>(key: K, value: SupplierForm[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editSupplier) return;
    setSavingId(editSupplier.id);
    try {
      const payload: Partial<SupplierForm> = {};
      if (editForm.companyName.trim()) payload.companyName = editForm.companyName.trim();
      if (editForm.tradingName.trim()) payload.tradingName = editForm.tradingName.trim();
      if (editForm.phone.trim()) payload.phone = editForm.phone.trim();
      if (editForm.whatsapp.trim()) payload.whatsapp = editForm.whatsapp.trim();
      if (editForm.email.trim()) payload.email = editForm.email.trim();
      if (editForm.website.trim()) payload.website = editForm.website.trim();
      if (editForm.description.trim()) payload.description = editForm.description.trim();
      // Include tier field
      payload.tier = editForm.tier;
      await api.put(`/suppliers/${editSupplier.id}`, payload);
      toast.success('Fornecedor atualizado!');
      setEditSupplier(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os fornecedores da plataforma.</p>
        </div>
      </div>

      {/* Explicação do cadastro e perfis */}
      <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Como funciona o cadastro e perfis de fornecedores</h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p><strong>1. Cadastro:</strong> Fornecedores se cadastram pelo site público (/auth/register, opção Sou Fornecedor) preenchendo dados da empresa (CNPJ, razão social, endereço, etc.). O cadastro entra com status <span className="font-medium">PENDENTE</span>.</p>
              <p><strong>2. Aprovação:</strong> O admin analisa a documentação e clica em <span className="font-medium">Aprovar</span> ou <span className="font-medium">Rejeitar</span>. Ao aprovar, o fornecedor ganha acesso ao painel.</p>
              <p><strong>3. Perfis (Tiers):</strong> Cada fornecedor tem um plano que define seus limites:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Básico:</strong> 1 produto | Sem pagamentos online | Sem relatórios</li>
                <li><strong>Padrão:</strong> Até 5 produtos | Com pagamentos online | Sem relatórios</li>
                <li><strong>Premium:</strong> Produtos ilimitados | Pagamentos online | Relatórios completos</li>
              </ul>
              <p><strong>4. Edição:</strong> Clique no ícone de lápis <Pencil className="h-3.5 w-3.5 inline" /> para alterar o plano, limite de produtos, acesso a pagamentos e relatórios.</p>
              <p><strong>5. Bloqueio:</strong> Fornecedores aprovados podem ser <span className="font-medium">Bloqueados</span> (perdem acesso) ou <span className="font-medium">Ativados</span> novamente.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar fornecedores..." className="input-field pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-sm w-full sm:w-44">
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="APPROVED">Aprovado</option>
          <option value="REJECTED">Rejeitado</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((supplier) => (
          <div key={supplier.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">{supplier.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{supplier.name}</p>
                <p className="text-xs text-gray-500">{supplier.email}</p>
              </div>
<div className="flex flex-col items-end gap-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (STATUS_STYLES[supplier.status]?.className || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                    {STATUS_STYLES[supplier.status]?.label || supplier.status}
                  </span>
                  <span className={'px-3 py-1 rounded-full font-semibold text-sm ' + (TIER_LABELS[supplier.tier]?.className || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                    {TIER_LABELS[supplier.tier]?.label || supplier.tier}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(supplier)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600" title="Editar fornecedor">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openChat(supplier)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.products} / {supplier.tier === 'PREMIUM' ? '∞' : supplier.tier === 'STANDARD' ? '5' : '1'}</p>
                <p className="text-xs text-gray-500">Produtos ({supplier.tier})</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.rating > 0 ? supplier.rating : '-'}</p>
                <p className="text-xs text-gray-500">Avaliacao</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.date}</p>
                <p className="text-xs text-gray-500">Desde</p>
              </div>
            </div>
            <p className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
              <MapPin className="h-3.5 w-3.5" />
              {supplier.city || supplier.state ? `${supplier.city}, ${supplier.state}` : 'Localização não informada'}
            </p>
            <div className="flex gap-2">
              {supplier.status === 'PENDING' && (
                <>
                  <button onClick={() => doApprove(supplier)} disabled={savingId === supplier.id} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-950 dark:text-green-300 transition-colors">
                    {savingId === supplier.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Aprovar
                  </button>
                  <button onClick={() => doReject(supplier)} disabled={savingId === supplier.id} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-950 dark:text-red-300 transition-colors">
                    {savingId === supplier.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Rejeitar
                  </button>
                </>
              )}
              {supplier.status !== 'PENDING' && (
                <button onClick={() => (supplier.status === 'APPROVED' ? doBlock(supplier) : doActivate(supplier))} disabled={savingId === supplier.id} className={'flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' + (supplier.status === 'APPROVED' ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300')}>
                  {savingId === supplier.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (supplier.status === 'APPROVED' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />)}
                  {supplier.status === 'APPROVED' ? 'Bloquear' : 'Ativar'}
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
          </div>
        )}
      </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-outline text-sm gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-outline text-sm gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
            Proxima <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

{editSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col my-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">{editSupplier.name.charAt(0)}</div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Editar Fornecedor</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{editSupplier.name}</p>
                    <span className={'px-3 py-1 rounded-full font-semibold text-sm ' + (TIER_LABELS[editSupplier.tier]?.className || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                      {TIER_LABELS[editSupplier.tier]?.label || editSupplier.tier}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setEditSupplier(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label-field">Razão Social</label>
                  <input type="text" className="input-field text-sm" value={editForm.companyName} onChange={(e) => setEditField('companyName', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Nome Fantasia</label>
                  <input type="text" className="input-field text-sm" value={editForm.tradingName} onChange={(e) => setEditField('tradingName', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">E-mail</label>
                  <input type="email" className="input-field text-sm" value={editForm.email} onChange={(e) => setEditField('email', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Telefone</label>
                  <input type="text" className="input-field text-sm" value={editForm.phone} onChange={(e) => setEditField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">WhatsApp</label>
                  <input type="text" className="input-field text-sm" value={editForm.whatsapp} onChange={(e) => setEditField('whatsapp', e.target.value)} />
                </div>
                <div>
                  <label className="label-field">Site</label>
                  <input type="text" className="input-field text-sm" value={editForm.website} onChange={(e) => setEditField('website', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Descrição</label>
                  <textarea rows={3} className="input-field resize-none text-sm" value={editForm.description} onChange={(e) => setEditField('description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Plano / Tier</label>
                  <select value={editForm.tier} onChange={(e) => setEditField('tier', e.target.value as 'BASIC' | 'STANDARD' | 'PREMIUM')} className="input-field">
                    <option value="BASIC">Básico (1 produto, sem pagamentos, sem relatórios)</option>
                    <option value="STANDARD">Padrão (até 5 produtos, com pagamentos, sem relatórios)</option>
                    <option value="PREMIUM">Premium (produtos ilimitados, pagamentos e relatórios)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Os limites de produtos, acesso a pagamentos e relatórios são definidos automaticamente pelo plano escolhido.</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditSupplier(null)} className="btn-outline flex-1 text-sm">Cancelar</button>
                <button type="submit" disabled={savingId === editSupplier.id} className="btn-primary flex-1 gap-2 text-sm">
                  {savingId === editSupplier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {chatSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col my-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600">{chatSupplier.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{chatSupplier.name}</p>
                  <p className="text-xs text-gray-500">{chatSupplier.email}</p>
                </div>
              </div>
              <button onClick={() => setChatSupplier(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {chatMessages.map((msg) => (
                <div key={msg.id} className={'flex ' + (msg.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                  <div className={'max-w-[80%] rounded-xl px-4 py-2 text-sm ' + (msg.sender === 'admin' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                    <p>{msg.text}</p>
                    <p className={'text-xs mt-1 ' + (msg.sender === 'admin' ? 'text-primary-100' : 'text-gray-400')}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
              <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Digite sua mensagem..." className="input-field flex-1 text-sm" />
                <button type="submit" disabled={!chatMessage.trim()} className="btn-primary p-2.5 rounded-lg">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmLabel="Confirmar"
        danger
        loading={!!savingId}
        onConfirm={async () => {
          const action = confirm?.action;
          setConfirm(null);
          if (action) await action();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
