'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Send, Mail, MailOpen, MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface Conversation {
  id: string;
  subject: string | null;
  updatedAt: string;
  customer: { id: string; name: string; avatarUrl?: string } | null;
  supplier: { id: string; companyName: string; tradingName?: string | null; logoUrl?: string | null } | null;
  messages?: { id: string; content: string; senderId: string; readAt: string | null; createdAt: string }[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { id: string; name: string; avatarUrl?: string };
}

function formatTime(value: string) {
  const d = new Date(value);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function timeOfDay(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function convName(c: Conversation) {
  if (c.customer?.name && c.supplier?.companyName) return `${c.customer.name} x ${c.supplier.companyName}`;
  return c.customer?.name ?? c.supplier?.companyName ?? 'Conversa';
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState('');
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUserId = user?.id ?? null;

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/admin/conversations');
      const data = res.data.data ?? [];
      setConversations(data);
      if (data.length > 0 && !selected) setSelected(data[0].id);
    } catch {
      toast.error('Erro ao carregar conversas.');
    }
  }, [selected]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await api.get(`/chat/admin/conversations/${convId}`);
      setMessages(res.data.data?.messages ?? []);
    } catch {
      toast.error('Erro ao carregar mensagens.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/chat/admin/conversations');
        if (cancelled) return;
        const data = res.data.data ?? [];
        setConversations(data);
        if (data.length > 0) setSelected(data[0].id);
      } catch {
        toast.error('Erro ao carregar conversas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    api
      .get(`/chat/admin/conversations/${selected}`)
      .then((res) => {
        if (!cancelled) setMessages(res.data.data?.messages ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Erro ao carregar mensagens.');
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
      if (selected) loadMessages(selected);
    }, 5000);
    return () => clearInterval(interval);
  }, [selected, loadConversations, loadMessages]);

  const filtered = conversations.filter((c) =>
    convName(c).toLowerCase().includes(search.toLowerCase()) ||
    (c.subject ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(id: string) {
    setSelected(id);
    api.post(`/chat/admin/conversations/${id}/read`).catch(() => undefined);
  }

  async function handleSend() {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/chat/admin/conversations/${selected}/messages`, { content: reply.trim() });
      setReply('');
      await loadMessages(selected);
      await loadConversations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  }

  const conv = conversations.find((c) => c.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Central de atendimento.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex h-[600px]">
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar conversas..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">Nenhuma conversa encontrada.</div>
              )}
              {filtered.map((c) => {
                const last = c.messages?.[0];
                const unread = !!last && last.senderId !== currentUserId && !last.readAt;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={'w-full text-left p-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ' + (selected === c.id ? 'bg-primary-50 dark:bg-primary-950' : '')}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      {unread ? <Mail className="h-3.5 w-3.5 text-primary-600" /> : <MailOpen className="h-3.5 w-3.5 text-gray-400" />}
                      <p className={'text-sm flex-1 truncate ' + (unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{convName(c)}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0">{formatTime(last?.createdAt ?? c.updatedAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{last?.content ?? c.subject ?? 'Sem mensagens'}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {conv ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{convName(conv)}</p>
                  <p className="text-xs text-gray-500">{conv.subject ?? 'Conversa entre cliente e fornecedor'}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={'flex ' + (msg.senderId === currentUserId ? 'justify-end' : 'justify-start')}>
                        <div className={'max-w-md rounded-xl px-4 py-2.5 text-sm ' + (msg.senderId === currentUserId ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                          <p className="text-xs text-gray-400 mb-0.5">{msg.sender?.name ?? ''}</p>
                          <p>{msg.content}</p>
                          <p className={'text-xs mt-1 ' + (msg.senderId === currentUserId ? 'text-primary-100' : 'text-gray-400')}>{timeOfDay(msg.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} disabled={!reply.trim() || sending} className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Selecione uma conversa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
