'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Send, Mail, MailOpen, MessageCircle, Plus, Wifi, WifiOff, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchConversations, fetchConversationMessages, createConversation,
  sendMessage, markConversationRead, fetchFirstApprovedSupplier,
  ChatConversation, ChatMessage,
} from '@/lib/chat-api';
import { useChatSocket, joinConversation, leaveConversation, sendViaSocket, emitRead } from '@/lib/chat-socket';

export default function CustomerChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState('');
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [online, setOnline] = useState(false);
  const [sending, setSending] = useState(false);

  const myUserId = user?.id ?? '';

  const refreshConversations = useCallback(async () => {
    const convs = await fetchConversations(myUserId);
    setConversations(convs);
    return convs;
  }, [myUserId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const msgs = await fetchConversationMessages(conversationId, myUserId);
      setMessages((prev) => ({ ...prev, [conversationId]: msgs }));
      return msgs;
    },
    [myUserId],
  );

  useChatSocket({
    onMessage: (data) => {
      const convId = data.conversationId;
      setMessages((prev) => {
        const existing = prev[convId] ?? [];
        if (existing.some((m) => m.id === data.message.id)) return prev;
        return {
          ...prev,
          [convId]: [
            ...existing,
            {
              id: data.message.id,
              conversationId: convId,
              content: data.message.content,
              senderId: data.message.senderId,
              sentByMe: data.message.senderId === myUserId,
              createdAt: data.message.createdAt,
            },
          ],
        };
      });
      refreshConversations();
    },
    onConversationUpdated: (data) => {
      if (data.conversationId === selected) loadMessages(data.conversationId);
    },
  });

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return;
    (async () => {
      try {
        const supplier = await fetchFirstApprovedSupplier();
        if (supplier?.chatSettings) setOnline(supplier.chatSettings.online);
        let convs = await fetchConversations(myUserId);
        if (convs.length === 0 && supplier) {
          const created = await createConversation(supplier.id, 'Bem-vindo ao chat');
          convs = [created, ...convs];
        }
        if (cancelled) return;
        setConversations(convs);
        const first = convs[0];
        if (first) {
          setSelected(first.id);
          loadMessages(first.id);
        }
      } catch {
        if (!cancelled) toast.error('Erro ao carregar conversas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, myUserId, loadMessages]);

  useEffect(() => {
    if (selected) joinConversation(selected);
    return () => {
      if (selected) leaveConversation(selected);
    };
  }, [selected]);

  const filtered = conversations.filter((c) =>
    (c.otherPartyName.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  function handleSelect(id: string) {
    setSelected(id);
    markConversationRead(id).catch(() => undefined);
    emitRead(id);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    loadMessages(id);
  }

  async function handleSend() {
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    const content = reply.trim();
    setReply('');
    setMessages((prev) => ({
      ...prev,
      [selected]: [
        ...(prev[selected] ?? []),
        { id: 'temp-' + Date.now(), conversationId: selected, content, senderId: myUserId, sentByMe: true, createdAt: new Date().toISOString() },
      ],
    }));
    sendViaSocket({ conversationId: selected, content });
    try {
      await sendMessage(selected, content);
      loadMessages(selected);
    } catch {
      toast.error('Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  }

  async function handleNewConversation(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      const supplier = await fetchFirstApprovedSupplier();
      if (!supplier) {
        toast.error('Nenhum fornecedor disponível no momento.');
        return;
      }
      const conv = await createConversation(supplier.id, newSubject.trim());
      setConversations((prev) => [conv, ...prev]);
      setSelected(conv.id);
      setMessages((prev) => ({ ...prev, [conv.id]: [] }));
      await sendMessage(conv.id, newMessage.trim());
      await loadMessages(conv.id);
      setShowNew(false);
      setNewSubject('');
      setNewMessage('');
      toast.success('Conversa iniciada!');
    } catch {
      toast.error('Erro ao iniciar conversa.');
    }
  }

  const conv = conversations.find((c) => c.id === selected);
  const activeMessages = messages[selected] || [];

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16 text-center">
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat</h1>
        <p className="text-gray-500">Faça login para acessar o chat.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-page py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container-page py-6 lg:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Fale com a gente!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {online ? (
              <><Wifi className="h-4 w-4 text-green-500" /><span className="text-green-600 dark:text-green-400">Online</span></>
            ) : (
              <><WifiOff className="h-4 w-4 text-red-500" /><span className="text-red-600 dark:text-red-400">Offline</span></>
            )}
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary text-sm gap-1.5">
            <Plus className="h-4 w-4" /> Novo Chat
          </button>
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
                <div className="text-center py-8 text-sm text-gray-400">Nenhuma conversa.</div>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={'w-full text-left p-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ' + (selected === c.id ? 'bg-primary-50 dark:bg-primary-950' : '')}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {c.unread ? <Mail className="h-3.5 w-3.5 text-primary-600" /> : <MailOpen className="h-3.5 w-3.5 text-gray-400" />}
                    <p className={'text-sm flex-1 truncate ' + (c.unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{c.subject || c.otherPartyName}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0">{new Date(c.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {conv ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{conv.subject || conv.otherPartyName}</p>
                  <p className="text-xs text-gray-500">{conv.otherPartyName}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {activeMessages.map((msg) => (
                      <div key={msg.id} className={'flex ' + (msg.sentByMe ? 'justify-end' : 'justify-start')}>
                        <div className={'max-w-md rounded-xl px-4 py-2.5 text-sm ' + (msg.sentByMe ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                          <p>{msg.content}</p>
                          <p className={'text-xs mt-1 ' + (msg.sentByMe ? 'text-primary-100' : 'text-gray-400')}>{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
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

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Novo Chat</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleNewConversation} className="space-y-4">
              <div>
                <label className="label-field">Assunto</label>
                <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Ex: Dúvida sobre pedido" className="input-field" required />
              </div>
              <div>
                <label className="label-field">Mensagem</label>
                <textarea rows={3} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." className="input-field resize-none" required />
              </div>
              <button type="submit" className="btn-primary w-full">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}