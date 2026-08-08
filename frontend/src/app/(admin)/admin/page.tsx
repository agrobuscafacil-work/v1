'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import {
  Users, Store, Package, ShoppingBag, TrendingUp, DollarSign,
  Activity, Star, ArrowUp, ArrowDown, SearchIcon, CheckCircle,
  Clock, AlertTriangle, Eye, Download, MessageCircle, Send, X, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersMonth: number;
  usersChange: number;
  totalSuppliers: number;
  suppliersByStatus: Record<string, number>;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  prevRevenue: number;
  revenueChange: number;
  ordersChange: number;
  ordersThisMonth: number;
  deliveredOrders: number;
  conversionRate: number;
  monthly: { month: string; revenue: number; orders: number }[];
  topSearches: { id: string; term: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; role: string; active: boolean; createdAt: string }[];
  recentSuppliers: { id: string; companyName: string; tradingName: string; status: string; rating: number; createdAt: string }[];
  recentActivity: { id: string; type: string; text: string; time: string }[];
  sessions: { thisMonth: number };
  topPages: { page: string; count: number }[];
  conversations?: { total: number };
  reviews?: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

interface AdminChatConversation {
  id: string;
  customerId: string;
  supplierId: string;
  subject?: string | null;
  updatedAt: string;
  conversationName: string;
  conversationEmail: string;
  lastMessage?: string;
  unread: boolean;
  avatar: string;
}

interface AdminChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { id: string; name: string };
}

interface ChatModalState {
  id: string;
  name: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
};

function initialStats(): AdminStats {
  return {
    totalUsers: 0, activeUsers: 0, newUsersMonth: 0, usersChange: 0,
    totalSuppliers: 0, suppliersByStatus: {}, totalProducts: 0,
    totalOrders: 0, totalRevenue: 0, monthRevenue: 0, prevRevenue: 0,
    revenueChange: 0, ordersChange: 0, ordersThisMonth: 0, deliveredOrders: 0,
    conversionRate: 0, monthly: [], topSearches: [], recentUsers: [],
    recentSuppliers: [], recentActivity: [], sessions: { thisMonth: 0 },
    topPages: [], reviews: 0,
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats>(initialStats);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/dashboard/admin'),
          api.get('/orders/admin', { params: { limit: 10 } }),
        ]);
        if (cancelled) return;
        setAdminStats(statsRes.data.data ?? initialStats());
        setRecentOrders((ordersRes.data.data?.data ?? []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer?.name || '—',
          total: Number(o.total),
          status: o.status,
          createdAt: o.createdAt,
        })));
      } catch {
        if (cancelled) return;
        toast.error('Erro ao carregar o painel administrativo');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    const loadConversations = async () => {
      setConversationsLoading(true);
      try {
        const res = await api.get('/chat/admin/conversations');
        if (cancelled) return;
        const raw: any[] = res.data.data ?? [];
        setConversations(
          raw.map((c) => {
            const supplierName = c.supplier?.tradingName ?? c.supplier?.companyName;
            const customerName = c.customer?.name;
            const name = supplierName || customerName || 'Atendimento';
            const email = supplierName ? (c.supplier?.tradingName || c.supplier?.companyName) : (customerName || '');
            const last = c.messages?.[0];
            return {
              id: c.id,
              customerId: c.customerId,
              supplierId: c.supplierId,
              updatedAt: c.updatedAt,
              conversationName: name,
              conversationEmail: email,
              lastMessage: last?.content,
              unread: !!last && !last.readAt,
              avatar: name.charAt(0),
            };
          }),
        );
      } catch {
        if (cancelled) return;
        setConversations([]);
      } finally {
        if (!cancelled) setConversationsLoading(false);
      }
    };
    loadConversations();

    return () => { cancelled = true; };
  }, [user?.id]);

  const stats = [
    { label: 'Usuários Totais', value: adminStats.totalUsers ? String(adminStats.totalUsers) : '0', change: `${adminStats.usersChange >= 0 ? '+' : ''}${adminStats.usersChange}%`, up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Fornecedores', value: adminStats.totalSuppliers ? String(adminStats.totalSuppliers) : '0', change: '—', up: true, icon: Store, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
    { label: 'Produtos', value: adminStats.totalProducts ? String(adminStats.totalProducts) : '0', change: '—', up: true, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
    { label: 'Pedidos', value: adminStats.totalOrders ? String(adminStats.totalOrders) : '0', change: `${adminStats.ordersChange >= 0 ? '+' : ''}${adminStats.ordersChange}%`, up: adminStats.ordersChange >= 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Receita (mês)', value: adminStats.monthRevenue ? `R$ ${Number(adminStats.monthRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—', change: `${adminStats.revenueChange >= 0 ? '+' : ''}${adminStats.revenueChange}%`, up: adminStats.revenueChange >= 0, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Taxa Conversão', value: `${adminStats.conversionRate.toLocaleString('pt-BR')}%`, change: `${adminStats.conversionRate}% das sessões`, up: true, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950' },
  ];

  const [chatModal, setChatModal] = useState<ChatModalState | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<AdminChatMessage[]>([]);

  function openChat(c: AdminChatConversation) {
    setChatModal({ id: c.id, name: c.conversationName });
    setChatMessages([]);
    api
      .get(`/chat/admin/conversations/${c.id}`)
      .then((res) => {
        const conv = res.data.data;
        setChatMessages((conv.messages ?? []).map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          createdAt: m.createdAt,
          sender: m.sender,
        })));
      })
      .catch(() => toast.error('Erro ao carregar mensagens'));
  }

  function sendChat() {
    if (!chatMsg.trim() || !chatModal) return;
    api
      .post(`/chat/admin/conversations/${chatModal.id}/messages`, { content: chatMsg.trim(), messageType: 'TEXT' })
      .then((res) => {
        const m = res.data.data;
        setChatMessages((p) => [...p, { id: m.id, content: m.content, senderId: m.senderId, createdAt: m.createdAt, sender: m.sender }]);
        setChatMsg('');
      })
      .catch(() => toast.error('Erro ao enviar mensagem'));
  }

  const maxRevenue = adminStats.monthly.length ? Math.max(...adminStats.monthly.map((d) => d.revenue), 1) : 1;
  const suppliersStatusMap = adminStats.suppliersByStatus || {};
  const approvedSuppliers = suppliersStatusMap.APPROVED ?? 0;
  const pendingSuppliers = suppliersStatusMap.PENDING ?? 0;
  const blockedSuppliers = suppliersStatusMap.BLOCKED ?? 0;
  const rejectedSuppliers = suppliersStatusMap.REJECTED ?? 0;
  const totalSupplierCount = approvedSuppliers + pendingSuppliers + blockedSuppliers + rejectedSuppliers;

  return (
    <div className="p-6 lg:p-8">
      {loading && (
        <div className="flex items-center justify-center gap-2 mb-6 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
          <p className="text-sm text-gray-500 mt-1">Bem-vindo, {user?.name?.split(' ')[0]}. Visão completa do sistema.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'suppliers', label: 'Fornecedores' },
            { id: 'orders', label: 'Pedidos' },
            { id: 'financial', label: 'Financeiro' },
            { id: 'usage', label: 'Uso' },
            { id: 'searches', label: 'Buscas' },
            { id: 'messages', label: 'Mensagens' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === s.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <div className={`flex items-center gap-1 text-xs ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.change} vs mês anterior
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Receita Mensal</h2>
                <Link href="/admin/reports" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Ver relatórios</Link>
              </div>
              {adminStats.monthly.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-gray-500">Sem vendas no período.</div>
              ) : (
                <div className="h-48">
                  <div className="flex items-end gap-2 h-36 mb-2">
                    {adminStats.monthly.map((d) => (
                      <div key={d.month + d.revenue} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary-500 dark:bg-primary-600 rounded-t transition-all hover:bg-primary-600" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }} />
                        <span className="text-xs text-gray-500">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Itens Mais Buscados</h2>
              {adminStats.topSearches.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma busca registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {adminStats.topSearches.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm text-gray-900 dark:text-white">{item.term}</p>
                          <span className="text-xs text-gray-500">{item.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                          <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${(item.count / adminStats.topSearches[0].count) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/admin/reports" className="mt-4 inline-block text-xs text-primary-600 hover:text-primary-700 font-medium">Ver todos os termos</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Últimos Usuários</h2>
                <Link href="/admin/users" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Ver todos</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="pb-2 font-medium">Nome</th>
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStats.recentUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50">
                        <td className="py-2.5 text-gray-900 dark:text-white">{u.name}</td>
                        <td className="py-2.5 text-gray-500">{u.email}</td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.role === 'SUPPLIER' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>{u.role === 'SUPPLIER' ? 'Fornecedor' : 'Cliente'}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.active ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}>{u.active ? 'Ativo' : 'Bloqueado'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atividade Recente</h2>
              {adminStats.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>
              ) : (
                <div className="space-y-4">
                  {adminStats.recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        {item.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                        {item.type === 'supplier' && <Store className="h-4 w-4 text-green-600" />}
                        {item.type === 'order' && <ShoppingBag className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeSection === 'suppliers' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Visão Geral dos Fornecedores</h2>
            <Link href="/admin/suppliers" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Gerenciar</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <p className="text-2xl font-bold text-green-600">{approvedSuppliers}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Aprovados</p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
              <p className="text-2xl font-bold text-yellow-600">{pendingSuppliers}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Pendentes</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <p className="text-2xl font-bold text-red-600">{blockedSuppliers}</p>
              <p className="text-sm text-red-700 dark:text-red-300">Bloqueados</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-2xl font-bold text-blue-600">{totalSupplierCount}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Fornecedor</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Avaliação</th>
                  <th className="pb-3 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {adminStats.recentSuppliers.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{s.tradingName || s.companyName}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === 'APPROVED' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                        s.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                        'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}>{s.status === 'APPROVED' ? 'Aprovado' : s.status === 'PENDING' ? 'Pendente' : s.status === 'BLOCKED' ? 'Bloqueado' : 'Rejeitado'}</span>
                    </td>
                    <td className="py-3 text-gray-500">{s.rating > 0 ? `${s.rating} ★` : '-'}</td>
                    <td className="py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'orders' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Todos os Pedidos</h2>
            <div className="flex gap-2">
              <button onClick={() => toast.success('Relatório exportado!')} className="btn-outline text-xs gap-1 inline-flex items-center">
                <Download className="h-3.5 w-3.5" /> Exportar
              </button>
              <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Gerenciar</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-center">
              <p className="text-lg font-bold text-blue-600">{adminStats.ordersThisMonth}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Pedidos no mês</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-center">
              <p className="text-lg font-bold text-green-600">{adminStats.deliveredOrders}</p>
              <p className="text-xs text-green-700 dark:text-green-300">Entregues</p>
            </div>
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-3 text-center">
              <p className="text-lg font-bold text-purple-600">{adminStats.totalOrders - adminStats.deliveredOrders}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">Em andamento</p>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-3 text-center">
              <p className="text-lg font-bold text-orange-600">{conversations.length}</p>
              <p className="text-xs text-orange-700 dark:text-orange-300">Conversas</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || statusLabels.PENDING;
                  return (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                      <td className="py-3 text-gray-500">{order.customer}</td>
                      <td className="py-3 font-semibold text-primary-600">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span></td>
                      <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'financial' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório Financeiro</h2>
            <div className="flex gap-2">
              <button onClick={() => toast.success('Relatório exportado!')} className="btn-outline text-xs gap-1 inline-flex items-center">
                <Download className="h-3.5 w-3.5" /> Exportar PDF
              </button>
              <Link href="/admin/reports" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver completo</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Receita Total (mês)</p>
              <p className="text-xl font-bold text-green-600">R$ {adminStats.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Ticket Médio</p>
              <p className="text-xl font-bold text-primary-600">R$ {adminStats.deliveredOrders > 0 ? (adminStats.monthRevenue / adminStats.deliveredOrders).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Comissões (5%)</p>
              <p className="text-xl font-bold text-orange-600">R$ {(adminStats.monthRevenue * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Receita Líquida</p>
              <p className="text-xl font-bold text-emerald-600">R$ {(adminStats.monthRevenue * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="h-48 mb-4">
            {adminStats.monthly.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-sm text-gray-500">Sem vendas no período.</div>
            ) : (
              <div className="flex items-end gap-2 h-36 mb-2">
                {adminStats.monthly.map((d) => (
                  <div key={'fin' + d.month + d.revenue} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-400 dark:bg-emerald-500 rounded-t transition-all hover:bg-emerald-500" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }} />
                    <span className="text-xs text-gray-500">{d.month}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 text-center">Evolução da receita</p>
          </div>
        </div>
      )}

      {activeSection === 'usage' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório de Utilização</h2>
            <button onClick={() => toast.success('Relatório exportado!')} className="btn-outline text-xs gap-1 inline-flex items-center">
              <Download className="h-3.5 w-3.5" /> Exportar PDF
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Usuários Ativos</p>
              <p className="text-2xl font-bold text-blue-600">{adminStats.activeUsers}</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">Novos Cadastros (mês)</p>
              <p className="text-2xl font-bold text-green-600">{adminStats.newUsersMonth}</p>
            </div>
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-4">
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Sessões (mês)</p>
              <p className="text-2xl font-bold text-purple-600">{adminStats.sessions.thisMonth}</p>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-4">
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">Avaliações</p>
              <p className="text-2xl font-bold text-orange-600">{adminStats.reviews}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 mb-1">Páginas Mais Acessadas</p>
              {adminStats.topPages.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma visita registrada.</p>
              ) : (
                <div className="space-y-2">
                  {adminStats.topPages.map((p) => (
                    <div key={p.page} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{p.page}</span>
                      <span className="font-medium">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 mb-1">Conversas</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Total</span><span className="font-medium">{conversations.length}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Não lidas</span><span className="font-medium">{conversations.filter((c) => c.unread).length}</span></div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 mb-1">Fornecedores</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Aprovados</span><span className="font-medium">{approvedSuppliers}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Pendentes</span><span className="font-medium">{pendingSuppliers}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'searches' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Itens Mais Buscados</h2>
            <button onClick={() => toast.success('Relatório exportado!')} className="btn-outline text-xs gap-1 inline-flex items-center">
              <Download className="h-3.5 w-3.5" /> Exportar PDF
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Termos de busca mais populares</p>
          {adminStats.topSearches.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma busca registrada ainda.</p>
          ) : (
            <div className="space-y-4">
              {adminStats.topSearches.map((item, i) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                      <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{item.term}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 ml-7">
                    <div className="h-2 rounded-full bg-primary-500" style={{ width: `${(item.count / adminStats.topSearches[0].count) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'messages' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mensagens</h2>
            <Link href="/admin/messages" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todas</Link>
          </div>
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma conversa.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => openChat(c)} className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className={'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ' + (c.unread ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800')}>{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={'text-sm ' + (c.unread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>{c.conversationName}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(c.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage || 'Clique para ver a conversa'}</p>
                  </div>
                  {c.unread && <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ChatModal />
    </div>
  );

  function ChatModal() {
    if (!chatModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col" style={{ maxHeight: '560px' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600">{chatModal.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{chatModal.name}</p>
                <p className="text-xs text-gray-500">Conversa</p>
              </div>
            </div>
            <button onClick={() => setChatModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {chatMessages.map((m) => (
              <div key={m.id} className={'flex ' + (m.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[80%] rounded-xl px-4 py-2 text-sm ' + (m.senderId === user?.id ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                  <p>{m.content}</p>
                  <p className={'text-xs mt-1 ' + (m.senderId === user?.id ? 'text-primary-100' : 'text-gray-400')}>{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
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