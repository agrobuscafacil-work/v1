'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LifeBuoy,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  User,
  Clock,
  MessageSquare,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_BADGE,
  SUPPORT_FILE_URL,
  formatBytes,
} from '@/lib/support';
import type {
  SupportAttachment,
  SupportCategory,
  SupportTicket,
  SupportTicketNote,
  SupportTicketStatus,
} from '@/types';

interface Stats {
  total: number;
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

const emptyStats: Stats = { total: 0, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };

function getErrorMessage(error: any): string {
  if (typeof error?.response?.data?.message === 'string') return error.response.data.message;
  return 'Erro inesperado. Tente novamente.';
}

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <span className={SUPPORT_STATUS_BADGE[status]}>
      {SUPPORT_STATUS_LABELS[status] || status}
    </span>
  );
}

function AttachmentIcon({ type }: { type: SupportAttachment['type'] }) {
  if (type === 'IMAGE') return <ImageIcon className="h-4 w-4" />;
  if (type === 'VIDEO') return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export default function AdminSupportPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [applied, setApplied] = useState({ page: 1, limit: 10, search: '', user: '', status: '', categoryId: '' });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['support-categories'],
    queryFn: async () => {
      const { data } = await api.get('/support/categories');
      return data.data as SupportCategory[];
    },
  });

  const statsQuery = useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      const [total, open, inProgress, resolved, closed] = await Promise.all([
        api.get('/support/admin/tickets', { params: { page: 1, limit: 1 } }),
        api.get('/support/admin/tickets', { params: { page: 1, limit: 1, status: 'OPEN' } }),
        api.get('/support/admin/tickets', { params: { page: 1, limit: 1, status: 'IN_PROGRESS' } }),
        api.get('/support/admin/tickets', { params: { page: 1, limit: 1, status: 'RESOLVED' } }),
        api.get('/support/admin/tickets', { params: { page: 1, limit: 1, status: 'CLOSED' } }),
      ]);
      return {
        total: total.data.data.meta.total,
        OPEN: open.data.data.meta.total,
        IN_PROGRESS: inProgress.data.data.meta.total,
        RESOLVED: resolved.data.data.meta.total,
        CLOSED: closed.data.data.meta.total,
      } as Stats;
    },
  });

  const listQuery = useQuery({
    queryKey: ['support-tickets', applied],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: applied.page,
        limit: applied.limit,
      };
      if (applied.search) params.search = applied.search;
      if (applied.user) params.user = applied.user;
      if (applied.status) params.status = applied.status;
      if (applied.categoryId) params.categoryId = applied.categoryId;
      const { data } = await api.get('/support/admin/tickets', { params });
      return data.data as { data: SupportTicket[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    },
  });

  const applyFilters = () => {
    setApplied({ page: 1, limit, search: search.trim(), user: user.trim(), status, categoryId });
  };

  const resetFilters = () => {
    setSearch('');
    setUser('');
    setStatus('');
    setCategoryId('');
    setApplied({ page: 1, limit: 10, search: '', user: '', status: '', categoryId: '' });
  };

  const goToPage = (p: number) => {
    setApplied((prev) => ({ ...prev, page: p }));
    setPage(p);
  };

  const openDetail = async (id: string) => {
    try {
      const { data } = await api.get(`/support/admin/tickets/${id}`);
      setSelectedTicket(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    toast.success('Lista atualizada');
  };

  const stats = statsQuery.data || emptyStats;
  const statsCards = [
    { label: 'Total de Reclamações', value: stats.total, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-950' },
    { label: 'Abertas', value: stats.OPEN, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
    { label: 'Em andamento', value: stats.IN_PROGRESS, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Resolvidas', value: stats.RESOLVED, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
    { label: 'Fechadas', value: stats.CLOSED, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
  ];

  const tickets = listQuery.data?.data || [];
  const meta = listQuery.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reclamações</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as reclamações recebidas e acompanhe a resolução.
          </p>
        </div>
        <button onClick={refresh} className="btn-outline text-sm gap-2 inline-flex items-center">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statsCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className={'mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ' + card.bg}>
              <LifeBuoy className={'h-4 w-4 ' + card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar no título ou descrição"
                className="input-field pl-9"
              />
            </div>
            <input
              type="search"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Nome ou e-mail do usuário"
              className="input-field"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os status</option>
              <option value="OPEN">Aberta</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="RESOLVED">Resolvida</option>
              <option value="CLOSED">Fechada</option>
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as categorias</option>
              {(categoriesQuery.data || []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={applyFilters} className="btn-primary text-sm flex-1">
                Filtrar
              </button>
              <button onClick={resetFilters} className="btn-outline text-sm px-3">
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 font-medium">Protocolo</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Assunto</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Data</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Nenhuma reclamação encontrada.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      #{ticket.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-bold">
                          {ticket.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {ticket.user?.name || 'Usuário'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{ticket.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-gray-500 max-w-xs truncate">
                        {ticket.type.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                      {ticket.category.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(ticket.id)}
                        className="btn-ghost p-1.5"
                        aria-label={`Ver detalhes de ${ticket.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            {meta.total} reclamação(ns) - página {meta.page} de {meta.totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                const l = Number(e.target.value);
                setLimit(l);
                setApplied((prev) => ({ ...prev, limit: l, page: 1 }));
              }}
              className="input-field w-24 text-sm"
              aria-label="Itens por página"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button
              onClick={() => goToPage(meta.page - 1)}
              disabled={meta.page <= 1}
              className="btn-ghost p-1.5 disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="btn-ghost p-1.5 disabled:opacity-40"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onChanged={(updated) => setSelectedTicket(updated)}
        />
      )}
    </div>
  );
}

function TicketDetail({
  ticket,
  onClose,
  onChanged,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onChanged: (t: SupportTicket) => void;
}) {
  const queryClient = useQueryClient();
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [statusValue, setStatusValue] = useState<SupportTicketStatus>(ticket.status);
  const [savingNote, setSavingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingRespond, setSavingRespond] = useState(false);
  const [respondText, setRespondText] = useState(ticket.adminResponse || '');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    queryClient.invalidateQueries({ queryKey: ['support-detail', ticket.id] });
  };

  const changeStatus = async () => {
    setSavingStatus(true);
    try {
      const { data } = await api.patch(`/support/admin/tickets/${ticket.id}/status`, {
        status: statusValue,
        note: statusNote || undefined,
      });
      onChanged(data.data);
      setStatusNote('');
      invalidate();
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const { data } = await api.post(`/support/admin/tickets/${ticket.id}/notes`, {
        note: noteText,
      });
      const note: SupportTicketNote = data.data;
      onChanged({
        ...ticket,
        notes: [note, ...(ticket.notes || [])],
      });
      setNoteText('');
      invalidate();
      toast.success('Nota interna adicionada');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingNote(false);
    }
  };

  const respond = async () => {
    if (!respondText.trim()) return;
    setSavingRespond(true);
    try {
      const { data } = await api.post(`/support/admin/tickets/${ticket.id}/respond`, {
        response: respondText,
      });
      onChanged(data.data);
      invalidate();
      toast.success('Resposta enviada ao cliente');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingRespond(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative mx-auto my-8 w-[calc(100%-2rem)] max-w-3xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <StatusBadge status={ticket.status} />
            <span className="font-mono text-xs text-gray-500">
              #{ticket.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {ticket.user?.name || 'Usuário'}
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-1">{ticket.user?.email}</p>
            <p className="text-xs text-gray-400">
              {ticket.category.name} - {ticket.type.name}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(ticket.createdAt).toLocaleString('pt-BR')}
              </span>
              {ticket.browser && <span>Navegador: {ticket.browser}</span>}
              {ticket.os && <span>Sistema: {ticket.os}</span>}
              {ticket.device && <span>Dispositivo: {ticket.device}</span>}
            </div>
            {ticket.pageUrl && (
              <p className="mt-1 text-xs text-gray-400">
                Página: <span className="break-all">{ticket.pageUrl}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
              {ticket.description}
            </p>
          </div>

          {ticket.attachments.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <Paperclip className="h-4 w-4" />
                Anexos ({ticket.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticket.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-800 p-3"
                  >
                    {att.type === 'IMAGE' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={SUPPORT_FILE_URL(att.url)}
                        alt={att.fileName}
                        className="mb-2 max-h-40 w-full rounded-md object-cover"
                      />
                    ) : att.type === 'VIDEO' ? (
                      <video
                        src={SUPPORT_FILE_URL(att.url)}
                        controls
                        className="mb-2 max-h-40 w-full rounded-md"
                      />
                    ) : null}
                    <a
                      href={SUPPORT_FILE_URL(att.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                    >
                      <AttachmentIcon type={att.type} />
                      <span className="truncate">{att.fileName}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatBytes(att.size)}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticket.statusHistory && ticket.statusHistory.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Histórico de status
              </h4>
              <ol className="space-y-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                {ticket.statusHistory.map((entry) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary-500" />
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{entry.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {ticket.notes && ticket.notes.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <MessageSquare className="h-4 w-4" />
                Notas internas
              </h4>
              <div className="space-y-2">
                {ticket.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm"
                  >
                    <p className="text-gray-600 dark:text-gray-300">{note.note}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {note.admin?.name || 'Admin'} -{' '}
                      {new Date(note.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Alterar status
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value as SupportTicketStatus)}
                className="input-field sm:w-44"
              >
                <option value="OPEN">Aberta</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="RESOLVED">Resolvida</option>
                <option value="CLOSED">Fechada</option>
              </select>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Observação (opcional)"
                className="input-field flex-1"
              />
              <button onClick={changeStatus} disabled={savingStatus} className="btn-primary text-sm">
                {savingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Aplicar
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Responder ao cliente
            </h4>
            <textarea
              rows={3}
              value={respondText}
              onChange={(e) => setRespondText(e.target.value)}
              placeholder="Escreva a resposta que será enviada ao cliente..."
              className="input-field resize-y"
            />
            <button
              onClick={respond}
              disabled={savingRespond || !respondText.trim()}
              className="btn-primary mt-2 text-sm"
            >
              {savingRespond ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enviar resposta
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Adicionar nota interna
            </h4>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nota visível apenas para a equipe..."
              className="input-field resize-y"
            />
            <button
              onClick={addNote}
              disabled={savingNote || !noteText.trim()}
              className="btn-outline mt-2 text-sm"
            >
              {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Adicionar nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
