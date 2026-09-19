'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import {
  Package, ShoppingBag, TrendingUp, DollarSign, Users,
  CheckCircle, Clock, XCircle, ArrowRight, Loader2, Store,
  MessageCircle, Send, X,
} from 'lucide-react';

const recentOrders = [] as Array<{ id: string; orderNumber: string; status: string; total: number; items: number; customer: string; createdAt: string }>;

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
};

interface CustomerConversation {
  id: string;
  subject: string;
  updatedAt: string;
  customer: { id: string; name: string; email?: string } | null;
  messages?: { id: string; content: string; senderId: string; readAt: string | null; createdAt: string }[];
}

interface DashboardMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

function formatChatTime(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return 'agora';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} min`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} h`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [chatCust, setChatCust] = useState<CustomerConversation | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<DashboardMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [customerConversations, setCustomerConversations] = useState<CustomerConversation[]>([]);
  const [stats, setStats] = useState<{
    totalProducts: number; totalServices: number; totalOrders: number; totalRevenue: number;
  } | null>(null);
  const [orders, setOrders] = useState<typeof recentOrders>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, conversationsRes] = await Promise.all([
          api.get('/dashboard/supplier/stats'),
          api.get('/orders'),
          api.get('/chat/conversations'),
        ]);
        setStats(statsRes.data.data ?? null);
        const ordersData = ordersRes.data.data?.data ?? [];
        setOrders(
          ordersData.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            total: Number(o.total),
            items: o.items?.length ?? 0,
            customer: o.customer?.name || 'Cliente',
            createdAt: o.createdAt,
          })),
        );
        setCustomerConversations(conversationsRes.data.data ?? []);
      } catch {
        setStats(null);
        setOrders([]);
        setCustomerConversations([]);
      }
    };
    load();
  }, []);

  const statsCards = [
    { label: 'Produtos', value: stats ? String(stats.totalProducts) : '—', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Serviços', value: stats ? String(stats.totalServices) : '—', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Pedidos', value: stats ? String(stats.totalOrders) : '—', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
    { label: 'Vendas', value: stats ? `R$ ${Number(stats.totalRevenue).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Clientes', value: '—', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
    { label: 'Taxa Conversão', value: '—', icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  ];

  async function openChat(c: CustomerConversation) {
    setChatCust(c);
    setChatLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${c.id}`);
      setChatMessages(res.data.data?.messages ?? []);
      await api.post(`/chat/conversations/${c.id}/read`);
      setCustomerConversations((previous) => previous.map((conversation) => (
        conversation.id === c.id
          ? { ...conversation, messages: (conversation.messages ?? []).map((message) => ({ ...message, readAt: message.readAt ?? new Date().toISOString() })) }
          : conversation
      )));
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  }

  async function sendChat() {
    if (!chatMsg.trim() || !chatCust) return;
    setChatSending(true);
    const content = chatMsg.trim();
    setChatMsg('');
    try {
      await api.post(`/chat/conversations/${chatCust.id}/messages`, { content, messageType: 'TEXT' });
      const res = await api.get(`/chat/conversations/${chatCust.id}`);
      setChatMessages(res.data.data?.messages ?? []);
      const conversationsRes = await api.get('/chat/conversations');
      setCustomerConversations(conversationsRes.data.data ?? []);
    } catch {
      setChatMsg(content);
    } finally {
      setChatSending(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel do Fornecedor</h1>
          <p className="text-sm text-gray-500 mt-1">Olá, {user?.name?.split(' ')[0]}! Acompanhe sua loja.</p>
        </div>
        <Link href="/supplier/products/new" className="btn-primary text-sm gap-2 inline-flex items-center">
          <Package className="h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pedidos Recentes</h2>
              <Link href="/supplier/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos</Link>
            </div>
            <div className="space-y-3">
              {orders.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum pedido recebido ainda.</p>
              )}
              {orders.map((order) => {
                const statusInfo = statusLabels[order.status] || statusLabels.PENDING;
                return (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.customer} - {order.items} item(ns)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary-600">
                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acesso Rápido</h2>
            <div className="space-y-2">
              {[
                { href: '/supplier/products', label: 'Gerenciar Produtos', icon: Package, desc: 'Adicione e edite seus produtos' },
                { href: '/supplier/orders', label: 'Pedidos Recebidos', icon: ShoppingBag, desc: 'Acompanhe os pedidos da sua loja' },
                { href: '/supplier/promotions', label: 'Promoções', icon: TrendingUp, desc: 'Crie ofertas e descontos' },
                { href: '/supplier/reports', label: 'Relatórios', icon: TrendingUp, desc: 'Veja métricas e relatórios de vendas' },
                { href: '/supplier/settings', label: 'Configurações', icon: Store, desc: 'Edite dados da sua loja' },
                { href: '/supplier/messages', label: 'Chat com Clientes', icon: MessageCircle, desc: 'Veja mensagens e converse' },
                { href: '/chat', label: 'Falar com Admin', icon: MessageCircle, desc: 'Converse com o suporte' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <link.icon className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Produtos com Estoque Baixo</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">3 produtos estão com estoque abaixo do mínimo.</p>
            </div>
            <Link href="/supplier/products" className="ml-auto btn-outline text-sm">Ver Produtos</Link>
          </div>
        </div>
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Loja Verificada</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Sua loja está aprovada e visível para clientes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversas com Clientes</h2>
          <Link href="/supplier/messages" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todas</Link>
        </div>
        <div className="space-y-1">
          {customerConversations.length === 0 && <p className="text-sm text-gray-500 py-3">Nenhuma conversa com clientes.</p>}
          {customerConversations.slice(0, 5).map((c) => {
            const lastMessage = c.messages?.[0];
            const unread = !!lastMessage && lastMessage.senderId !== user?.id && !lastMessage.readAt;
            const name = c.customer?.name || 'Cliente';
            return (
            <button key={c.id} onClick={() => openChat(c)} className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
              <div className={'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ' + (unread ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800')}>{name.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={'text-sm ' + (unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{name}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatChatTime(lastMessage?.createdAt ?? c.updatedAt)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{lastMessage?.content ?? c.subject}</p>
              </div>
              {unread && <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />}
            </button>
            );
          })}
        </div>
      </div>

      <ChatModal />
    </div>
  );

  function ChatModal() {
    if (!chatCust) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600">{(chatCust.customer?.name || 'C').charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{chatCust.customer?.name || 'Cliente'}</p>
                <p className="text-xs text-gray-500">{chatCust.customer?.email || chatCust.subject}</p>
              </div>
            </div>
            <button onClick={() => setChatCust(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {chatLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary-500 mx-auto" /> : chatMessages.map((m) => {
              const sentBySupplier = m.senderId === user?.id;
              return (
              <div key={m.id} className={'flex ' + (sentBySupplier ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[80%] rounded-xl px-4 py-2 text-sm ' + (sentBySupplier ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                  <p>{m.content}</p>
                  <p className={'text-xs mt-1 ' + (sentBySupplier ? 'text-primary-100' : 'text-gray-400')}>{formatMessageTime(m.createdAt)}</p>
                </div>
              </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 p-4">
            <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
              <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Digite sua mensagem..." className="input-field flex-1 text-sm" />
              <button type="submit" disabled={!chatMsg.trim() || chatSending || chatLoading} className="btn-primary p-2.5 rounded-lg">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
