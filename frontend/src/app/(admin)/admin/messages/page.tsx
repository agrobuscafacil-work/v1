'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Mail, MailOpen, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getChatSettings, defaultChatSettings } from '@/lib/chat-settings';
import {
  getAllConversations, getConversationMessages, sendMessage,
  markConversationRead, seedInitialConversations, ChatMessage, ChatConversation,
} from '@/lib/chat-store';

export default function AdminMessagesPage() {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState(conversations[0]?.id || '');
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatSettings, setChatSettings] = useState(defaultChatSettings);

  useEffect(() => {
    setChatSettings(getChatSettings());
  }, []);

  useEffect(() => {
    seedInitialConversations();
    const all = getAllConversations();
    setConversations(all);
    setSelected((prev) => prev || all[0]?.id || '');
  }, []);

  useEffect(() => {
    if (!selected) return;
    setMessages((prev) => ({ ...prev, [selected]: getConversationMessages(selected) }));
  }, [selected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(getAllConversations());
      if (selected) {
        setMessages((prev) => ({ ...prev, [selected]: getConversationMessages(selected) }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(id: string) {
    setSelected(id);
    markConversationRead(id);
    setConversations(getAllConversations());
  }

  function handleSend() {
    if (!reply.trim() || !selected) return;
    try {
      sendMessage(selected, reply, true);
      setConversations(getAllConversations());
      setMessages((prev) => ({ ...prev, [selected]: getConversationMessages(selected) }));
      setReply('');

      const settings = getChatSettings();
      if (settings.autoReplyEnabled) {
        setTimeout(() => {
          try {
            sendMessage(selected, settings.autoReplyMessage, false);
            setConversations(getAllConversations());
            setMessages((prev) => ({ ...prev, [selected]: getConversationMessages(selected) }));
          } catch {}
        }, 2000);
      }
    } catch {
      toast.error('Erro ao enviar mensagem.');
    }
  }

  const conv = conversations.find((c) => c.id === selected);
  const activeMessages = messages[selected] || [];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Central de atendimento.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {chatSettings.online ? (
            <><Wifi className="h-4 w-4 text-green-500" /><span className="text-green-600 dark:text-green-400">Online</span></>
          ) : (
            <><WifiOff className="h-4 w-4 text-red-500" /><span className="text-red-600 dark:text-red-400">Offline</span></>
          )}
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
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={'w-full text-left p-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ' + (selected === c.id ? 'bg-primary-50 dark:bg-primary-950' : '')}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {c.unread ? <Mail className="h-3.5 w-3.5 text-primary-600" /> : <MailOpen className="h-3.5 w-3.5 text-gray-400" />}
                    <p className={'text-sm flex-1 truncate ' + (c.unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{c.name}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-0.5">{c.subject}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMessage}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {conv ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{conv.name}</p>
                  <p className="text-xs text-gray-500">{conv.email} - {conv.subject}</p>
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
                  <div className="flex items-center gap-2">
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
    </div>
  );
}
