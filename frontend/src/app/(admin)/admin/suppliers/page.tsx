'use client';

import { useEffect, useState } from 'react';
import { Store, Search, CheckCircle, XCircle, X, Loader2, MessageCircle, Send, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { getChatSettings } from '@/lib/chat-settings';

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
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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
    setChatMessages([
      { id: '1', sender: 'supplier', text: `Olá! Como posso ajudar?`, time: '10:00' },
    ]);
  }

  function sendChat() {
    if (!chatMessage.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender: 'admin', text: chatMessage.trim(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((prev) => [...prev, msg]);
    setChatMessage('');
    const settings = getChatSettings();
    if (settings.autoReplyEnabled) {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'supplier', text: settings.autoReplyMessage, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      }, 1500);
    }
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
    if (!window.confirm(`Deseja bloquear o fornecedor ${s.name}?`)) return;
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
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os fornecedores da plataforma.</p>
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
                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (STATUS_STYLES[supplier.status]?.className || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                  {STATUS_STYLES[supplier.status]?.label || supplier.status}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openChat(supplier)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.products}</p>
                <p className="text-xs text-gray-500">Produtos</p>
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

      {chatSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col" style={{ maxHeight: '560px' }}>
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

    </div>
  );
}
