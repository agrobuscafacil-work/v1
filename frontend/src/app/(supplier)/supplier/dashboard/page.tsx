'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getChatSettings } from '@/lib/chat-settings';
import {
  Package, ShoppingBag, TrendingUp, DollarSign, Users,
  CheckCircle, Clock, XCircle, ArrowRight, Loader2, Store,
  MessageCircle, Send, X,
} from 'lucide-react';

const statsCards = [
  { label: 'Produtos', value: '15', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  { label: 'Pedidos', value: '32', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  { label: 'Vendas (mês)', value: 'R$ 18.740', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  { label: 'Clientes', value: '198', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
  { label: 'Taxa Conversão', value: '6,8%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  { label: 'Avaliação', value: '4.8 ★', icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
];

const recentOrders = [
  { id: '1', orderNumber: 'ABF-2024-0010', status: 'PENDING', total: 45990.00, items: 1, customer: 'Lucas Mendes', createdAt: '2026-07-29T10:30:00' },
  { id: '2', orderNumber: 'ABF-2024-0008', status: 'PROCESSING', total: 7890.00, items: 2, customer: 'Fernanda Almeida', createdAt: '2026-07-28T14:15:00' },
  { id: '3', orderNumber: 'ABF-2024-0007', status: 'PROCESSING', total: 3499.90, items: 1, customer: 'Maria Oliveira', createdAt: '2026-07-28T09:45:00' },
  { id: '4', orderNumber: 'ABF-2024-0006', status: 'SHIPPED', total: 259.90, items: 1, customer: 'Juliana Costa', createdAt: '2026-07-27T16:30:00' },
  { id: '5', orderNumber: 'ABF-2024-0005', status: 'SHIPPED', total: 567.50, items: 1, customer: 'Carlos Pereira', createdAt: '2026-07-27T11:00:00' },
  { id: '6', orderNumber: 'ABF-2024-0004', status: 'DELIVERED', total: 12589.90, items: 3, customer: 'Ana Souza', createdAt: '2026-07-25T08:20:00' },
  { id: '7', orderNumber: 'ABF-2024-0003', status: 'DELIVERED', total: 18990.00, items: 1, customer: 'Roberto Lima', createdAt: '2026-07-24T13:40:00' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
};

const custChats = [
  { id: 'cc1', name: 'João Silva', email: 'joao@email.com', lastMsg: 'Meu pedido ABF-2024-0010 ainda não chegou.', time: '5 min atrás', unread: true, avatar: 'J' },
  { id: 'cc2', name: 'Maria Oliveira', email: 'maria@email.com', lastMsg: 'O trator está disponível para entrega?', time: '1 hora atrás', unread: true, avatar: 'M' },
  { id: 'cc3', name: 'Carlos Pereira', email: 'carlos@email.com', lastMsg: 'Quero cancelar o pedido #0005.', time: '3 horas atrás', unread: false, avatar: 'C' },
  { id: 'cc4', name: 'Ana Souza', email: 'ana@email.com', lastMsg: 'Recebi o produto. Obrigado!', time: '1 dia atrás', unread: false, avatar: 'A' },
  { id: 'cc5', name: 'Pedro Santos', email: 'pedro@email.com', lastMsg: 'Tem desconto para compra em volume?', time: '2 dias atrás', unread: false, avatar: 'P' },
];

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [chatCust, setChatCust] = useState<typeof custChats[0] | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);

  function openChat(c: typeof custChats[0]) {
    setChatCust(c);
    setChatMessages([
      { id: '1', sender: 'customer', text: c.lastMsg, time: '10:00' },
    ]);
  }

  function sendChat() {
    if (!chatMsg.trim() || !chatCust) return;
    const m = { id: Date.now().toString(), sender: 'supplier', text: chatMsg.trim(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((p) => [...p, m]);
    setChatMsg('');
    const settings = getChatSettings();
    if (settings.autoReplyEnabled) {
      setTimeout(() => {
        setChatMessages((p) => [...p, { id: (Date.now() + 1).toString(), sender: 'customer', text: settings.autoReplyMessage, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      }, 1200);
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
              {recentOrders.map((order) => {
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
          {custChats.map((c) => (
            <button key={c.id} onClick={() => openChat(c)} className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
              <div className={'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ' + (c.unread ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800')}>{c.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={'text-sm ' + (c.unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{c.name}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
              </div>
              {c.unread && <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <ChatModal />
    </div>
  );

  function ChatModal() {
    if (!chatCust) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col" style={{ maxHeight: '560px' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600">{chatCust.avatar}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{chatCust.name}</p>
                <p className="text-xs text-gray-500">{chatCust.email}</p>
              </div>
            </div>
            <button onClick={() => setChatCust(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {chatMessages.map((m) => (
              <div key={m.id} className={'flex ' + (m.sender === 'supplier' ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[80%] rounded-xl px-4 py-2 text-sm ' + (m.sender === 'supplier' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                  <p>{m.text}</p>
                  <p className={'text-xs mt-1 ' + (m.sender === 'supplier' ? 'text-primary-100' : 'text-gray-400')}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 p-4">
            <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
              <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Digite sua mensagem..." className="input-field flex-1 text-sm" />
              <button type="submit" disabled={!chatMsg.trim()} className="btn-primary p-2.5 rounded-lg">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
