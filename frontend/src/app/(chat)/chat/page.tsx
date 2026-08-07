'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Mail, MailOpen, MessageCircle, Plus, Wifi, WifiOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { getChatSettings, defaultChatSettings, ChatSettings } from '@/lib/chat-settings';
import {
  getAllConversations, getConversationMessages, sendMessage,
  markConversationRead, addConversation, ChatConversation, ChatMessage,
} from '@/lib/chat-store';

const CUST_PREFIX = 'cust_';

export default function CustomerChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState('');
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [settings, setSettings] = useState<ChatSettings>(() => getChatSettings());

  useEffect(() => {
    const all = getAllConversations();
    const custConvs = all.filter((c) => c.id.startsWith(CUST_PREFIX) || c.email === user?.email);
    if (custConvs.length === 0) {
      const newConv: ChatConversation = {
        id: CUST_PREFIX + Date.now(),
        name: user?.name || 'Cliente',
        email: user?.email || '',
        subject: 'Bem-vindo ao chat',
        lastMessage: 'Como podemos ajudar?',
        time: 'Agora mesmo',
        unread: false,
      };
      addConversation(newConv);
      sendMessage(newConv.id, 'Olá! Bem-vindo ao atendimento AgroBuscaFácil. Como podemos ajudar?', false);
    }
    queueMicrotask(() => {
      const convs = getAllConversations();
      const first = convs.filter((c) => c.id.startsWith(CUST_PREFIX) || c.email === user?.email)[0];
      setSelected(first?.id ?? '');
      setConversations(convs);
      if (first) setMessages((prev) => ({ ...prev, [first.id]: getConversationMessages(first.id) }));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(getAllConversations());
      if (selected) setMessages((prev) => ({ ...prev, [selected]: getConversationMessages(selected) }));
    }, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  const myConvs = conversations.filter(
    (c) => c.id.startsWith(CUST_PREFIX) || c.email === user?.email
  );

  const filtered = myConvs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(id: string) {
    setSelected(id);
    markConversationRead(id);
    setConversations(getAllConversations());
    setMessages((prev) => ({ ...prev, [id]: getConversationMessages(id) }));
  }

  function handleSend() {
    if (!reply.trim() || !selected) return;
    try {
      sendMessage(selected, reply, true);
      setConversations(getAllConversations());
      setMessages((prev) => ({ ...prev, [selected]: getConversationMessages(selected) }));
      setReply('');
    } catch {
      toast.error('Erro ao enviar mensagem.');
    }
  }

  function handleNewConversation(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    const id = CUST_PREFIX + Date.now();
    const conv: ChatConversation = {
      id,
      name: user?.name || 'Cliente',
      email: user?.email || '',
      subject: newSubject.trim(),
      lastMessage: newMessage.trim(),
      time: 'Agora mesmo',
      unread: true,
    };
    addConversation(conv);
    sendMessage(id, newMessage.trim(), true);
    setConversations(getAllConversations());
    setSelected(id);
    setMessages((prev) => ({ ...prev, [id]: getConversationMessages(id) }));
    setShowNew(false);
    setNewSubject('');
    setNewMessage('');
    toast.success('Conversa iniciada!');
  }

  const conv = myConvs.find((c) => c.id === selected);
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

  return (
    <div className="container-page py-6 lg:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Fale com a gente!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {settings.online ? (
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
                    <p className={'text-sm flex-1 truncate ' + (c.unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{c.subject}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0">{c.time}</span>
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{conv.subject}</p>
                  <p className="text-xs text-gray-500">Atendimento AgroBuscaFácil</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {activeMessages.map((msg) => (
                      <div key={msg.id} className={'flex ' + (msg.sentByMe ? 'justify-end' : 'justify-start')}>
                        <div className={'max-w-md rounded-xl px-4 py-2.5 text-sm ' + (msg.sentByMe ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                          <p>{msg.text}</p>
                          <p className={'text-xs mt-1 ' + (msg.sentByMe ? 'text-primary-100' : 'text-gray-400')}>{msg.time}</p>
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
                    <button onClick={handleSend} disabled={!reply.trim()} className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
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
