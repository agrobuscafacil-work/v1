'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getChatSettings } from '@/lib/chat-settings';
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
  totalSuppliers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const monthlyData = [
  { month: 'Jan', revenue: 85000, orders: 520 },
  { month: 'Fev', revenue: 92000, orders: 580 },
  { month: 'Mar', revenue: 78000, orders: 490 },
  { month: 'Abr', revenue: 101000, orders: 620 },
  { month: 'Mai', revenue: 95000, orders: 590 },
  { month: 'Jun', revenue: 112000, orders: 710 },
  { month: 'Jul', revenue: 127890, orders: 892 },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
};

const topSearches = [
  { term: 'Semente de Soja', count: 1234, trend: 'up' },
  { term: 'Fertilizante NPK', count: 987, trend: 'up' },
  { term: 'Trator Agrícola', count: 876, trend: 'up' },
  { term: 'Defensivo Glifosato', count: 654, trend: 'down' },
  { term: 'Sistema de Irrigação', count: 543, trend: 'up' },
  { term: 'Ração para Gado', count: 489, trend: 'up' },
  { term: 'Semente de Milho', count: 432, trend: 'up' },
  { term: 'Pulverizador Costal', count: 387, trend: 'down' },
  { term: 'Adubo Foliar', count: 298, trend: 'up' },
  { term: 'Cerca Elétrica Rural', count: 215, trend: 'down' },
];

const convs = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', lastMsg: 'Meu pedido ABF-2024-0010 ainda não chegou.', time: '5 min atrás', unread: true, avatar: 'J' },
  { id: 'c2', name: 'Fertilizantes ABC', email: 'contato@fertabc.com', lastMsg: 'Gostaria de saber o status da análise do meu cadastro.', time: '1 hora atrás', unread: true, avatar: 'F' },
  { id: 'c3', name: 'Maria Oliveira', email: 'maria@email.com', lastMsg: 'O produto veio diferente do anunciado.', time: '3 horas atrás', unread: false, avatar: 'M' },
  { id: 'c4', name: 'Agro Tech Ltda', email: 'admin@agrotech.com', lastMsg: 'Preciso atualizar os preços do catálogo.', time: '1 dia atrás', unread: false, avatar: 'A' },
  { id: 'c5', name: 'Carlos Pereira', email: 'carlos@email.com', lastMsg: 'Solicito o cancelamento do pedido.', time: '2 dias atrás', unread: false, avatar: 'C' },
  { id: 'c6', name: 'Máquinas Agrícolas LTDA', email: 'contato@maquinasagri.com', lastMsg: 'O trator 75cv está disponível?', time: '2 dias atrás', unread: false, avatar: 'M' },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; orderNumber: string; customer: string; total: number; status: string; date: string }>>([]);
  const [recentUsers, setRecentUsers] = useState<Array<{ name: string; email: string; role: string; status: string }>>([]);
  const [topSuppliers, setTopSuppliers] = useState<Array<{ name: string; products: number; revenue: string; rating: number; status: string }>>([]);
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, usersRes, suppliersRes] = await Promise.all([
          api.get('/dashboard/admin'),
          api.get('/orders/admin', { params: { limit: 10 } }),
          api.get('/users', { params: { limit: 8 } }),
          api.get('/suppliers/admin', { params: { limit: 10 } }),
        ]);
        setAdminStats(statsRes.data.data ?? null);
        const orders = ordersRes.data.data?.data ?? [];
        setRecentOrders(
          orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customer: o.customer?.name || '—',
            total: Number(o.total),
            status: o.status,
            date: new Date(o.createdAt).toLocaleDateString('pt-BR'),
          })),
        );
        const users = usersRes.data.data?.data ?? [];
        setRecentUsers(
          users.map((u: any) => ({
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.active ? 'Ativo' : 'Bloqueado',
          })),
        );
        const suppliers = suppliersRes.data.data?.data ?? [];
        setTopSuppliers(
          suppliers.map((s: any) => ({
            name: s.companyName,
            products: s.totalProducts,
            revenue: '—',
            rating: s.rating,
            status: s.status === 'APPROVED' ? 'Ativo' : 'Pendente',
          })),
        );
      } catch {
        toast.error('Erro ao carregar o painel administrativo');
        setRecentOrders([]);
        setRecentUsers([]);
        setTopSuppliers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Usuários Totais', value: adminStats ? String(adminStats.totalUsers) : '—', change: '+12%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Fornecedores', value: adminStats ? String(adminStats.totalSuppliers) : '—', change: '+5%', up: true, icon: Store, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
    { label: 'Produtos', value: adminStats ? String(adminStats.totalProducts) : '—', change: '+18%', up: true, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
    { label: 'Pedidos', value: adminStats ? String(adminStats.totalOrders) : '—', change: '+23%', up: true, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Receita (mês)', value: adminStats ? `R$ ${Number(adminStats.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—', change: '+15%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Taxa Conversão', value: '3,2%', change: '-0,5%', up: false, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950' },
  ];
  const [chatConv, setChatConv] = useState<typeof convs[0] | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);

  function openChat(c: typeof convs[0]) {
    setChatConv(c);
    setChatMessages([
      { id: '1', sender: c.email.includes('@email.com') ? 'customer' : 'supplier', text: c.lastMsg, time: '10:00' },
    ]);
  }

  function sendChat() {
    if (!chatMsg.trim() || !chatConv) return;
    const m = { id: Date.now().toString(), sender: 'admin', text: chatMsg.trim(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((p) => [...p, m]);
    setChatMsg('');
    const settings = getChatSettings();
    if (settings.autoReplyEnabled) {
      setTimeout(() => {
        setChatMessages((p) => [...p, { id: (Date.now() + 1).toString(), sender: chatConv.email.includes('@email.com') ? 'customer' : 'supplier', text: settings.autoReplyMessage, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      }, 1200);
    }
  }

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
              <div className="h-48">
                <div className="flex items-end gap-2 h-36 mb-2">
                  {monthlyData.map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary-500 dark:bg-primary-600 rounded-t transition-all hover:bg-primary-600" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }} />
                      <span className="text-xs text-gray-500">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Itens Mais Buscados</h2>
              <div className="space-y-3">
                {topSearches.map((item, i) => (
                  <div key={item.term} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm text-gray-900 dark:text-white">{item.term}</p>
                        <span className="text-xs text-gray-500">{item.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${(item.count / topSearches[0].count) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    {recentUsers.map((u) => (
                      <tr key={u.email} className="border-b border-gray-50 dark:border-gray-800/50">
                        <td className="py-2.5 text-gray-900 dark:text-white">{u.name}</td>
                        <td className="py-2.5 text-gray-500">{u.email}</td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.role === 'SUPPLIER' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>{u.role === 'SUPPLIER' ? 'Fornecedor' : 'Cliente'}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.status === 'Ativo' || u.status === 'Aprovado' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                            u.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                            'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}>{u.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atividade Recente</h2>
              <div className="space-y-4">
                  {[
                    { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', text: 'Novo usuário cadastrado: Lucas Mendes', time: '5 min atrás' },
                    { icon: Store, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', text: 'Fornecedor "AgroTec Sistemas" solicitou cadastro', time: '12 min atrás' },
                    { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', text: 'Produto "Drone Agrícola" cadastrado no sistema', time: '25 min atrás' },
                    { icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', text: 'Novo pedido #ABF-2024-0010 recebido', time: '1 hora atrás' },
                    { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'Avaliação 5 estrelas para "NutriPlant Fertilizantes"', time: '1 hora atrás' },
                    { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'Pagamento do pedido #ABF-2024-0008 confirmado', time: '2 horas atrás' },
                    { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', text: 'Fornecedor "Defensivos Nacional" aprovado pela moderação', time: '3 horas atrás' },
                    { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950', text: 'Estoque baixo: Fertilizante Orgânico Húmus', time: '4 horas atrás' },
                  ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <p className="text-2xl font-bold text-green-600">72</p>
              <p className="text-sm text-green-700 dark:text-green-300">Aprovados</p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
              <p className="text-2xl font-bold text-yellow-600">8</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Pendentes</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <p className="text-2xl font-bold text-red-600">6</p>
              <p className="text-sm text-red-700 dark:text-red-300">Inativos</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-2xl font-bold text-blue-600">86</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Fornecedor</th>
                  <th className="pb-3 font-medium">Produtos</th>
                  <th className="pb-3 font-medium">Receita</th>
                  <th className="pb-3 font-medium">Avaliação</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliers.map((s) => (
                  <tr key={s.name} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                    <td className="py-3 text-gray-500">{s.products}</td>
                    <td className="py-3 font-semibold text-primary-600">{s.revenue}</td>
                    <td className="py-3 text-gray-500">{s.rating > 0 ? `${s.rating} ★` : '-'}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === 'Ativo' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                        'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                      }`}>{s.status}</span>
                    </td>
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
              <p className="text-lg font-bold text-blue-600">128</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Novos</p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-center">
              <p className="text-lg font-bold text-yellow-600">245</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Processando</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-center">
              <p className="text-lg font-bold text-green-600">419</p>
              <p className="text-xs text-green-700 dark:text-green-300">Entregues</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-center">
              <p className="text-lg font-bold text-red-600">100</p>
              <p className="text-xs text-red-700 dark:text-red-300">Cancelados</p>
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
                      <td className="py-3 text-gray-500">{order.date}</td>
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
              <p className="text-xl font-bold text-green-600">R$ 127.890</p>
              <span className="text-xs text-green-600">+15% vs mês anterior</span>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Ticket Médio</p>
              <p className="text-xl font-bold text-primary-600">R$ 143,37</p>
              <span className="text-xs text-green-600">+8% vs mês anterior</span>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Comissões (5%)</p>
              <p className="text-xl font-bold text-orange-600">R$ 6.394,50</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 mb-1">Receita Projetada (próx. mês)</p>
              <p className="text-xl font-bold text-emerald-600">R$ 145.000</p>
              <span className="text-xs text-green-600">+13% projeção</span>
            </div>
          </div>
          <div className="h-48 mb-4">
            <div className="flex items-end gap-2 h-36 mb-2">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-emerald-400 dark:bg-emerald-500 rounded-t transition-all hover:bg-emerald-500" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }} />
                  <span className="text-xs text-gray-500">{d.month}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">Evolução da receita em 2026</p>
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
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Usuários Ativos (mês)</p>
              <p className="text-2xl font-bold text-blue-600">1.247</p>
              <span className="text-xs text-green-600">+12% vs mês anterior</span>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">Novos Cadastros</p>
              <p className="text-2xl font-bold text-green-600">+124</p>
              <span className="text-xs text-green-600">+8% vs mês anterior</span>
            </div>
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-4">
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Sessões</p>
              <p className="text-2xl font-bold text-purple-600">8.342</p>
              <span className="text-xs text-green-600">+22% vs mês anterior</span>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-4">
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">Tempo Médio</p>
              <p className="text-2xl font-bold text-orange-600">4m 32s</p>
              <span className="text-xs text-green-600">+5% vs mês anterior</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 mb-1">Dispositivos</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Desktop</span><span className="font-medium">58%</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Mobile</span><span className="font-medium">35%</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Tablet</span><span className="font-medium">7%</span></div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 mb-1">Navegador</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Chrome</span><span className="font-medium">62%</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Firefox</span><span className="font-medium">14%</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">Safari</span><span className="font-medium">12%</span></div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 mb-1">Páginas Mais Acessadas</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">/products</span><span className="font-medium">4.2k</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">/</span><span className="font-medium">3.8k</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-700 dark:text-gray-300">/search</span><span className="font-medium">2.1k</span></div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-4">Termos de busca mais populares dos últimos 30 dias</p>
              <div className="space-y-4">
                {topSearches.map((item, i) => (
                  <div key={item.term}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                        <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{item.term}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 ml-7">
                      <div className="h-2 rounded-full bg-primary-500" style={{ width: `${(item.count / topSearches[0].count) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Categorias Mais Acessadas</h3>
              <div className="space-y-3">
                {[
                  { cat: 'Sementes e Mudas', pct: 32 },
                  { cat: 'Fertilizantes', pct: 28 },
                  { cat: 'Defensivos', pct: 22 },
                  { cat: 'Máquinas e Equipamentos', pct: 18 },
                  { cat: 'Irrigação', pct: 15 },
                  { cat: 'Implementos', pct: 12 },
                ].map((c) => (
                  <div key={c.cat}>
                    <div className="flex items-center justify-between text-sm mb-0.5">
                      <span className="text-gray-700 dark:text-gray-300">{c.cat}</span>
                      <span className="text-gray-500">{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white dark:bg-gray-700">
                      <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'messages' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mensagens</h2>
            <Link href="/admin/messages" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todas</Link>
          </div>
          <div className="space-y-2">
            {convs.map((c) => (
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
      )}

      <ChatModal />
    </div>
  );
  
  function ChatModal() {
    if (!chatConv) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col" style={{ maxHeight: '560px' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600">{chatConv.avatar}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{chatConv.name}</p>
                <p className="text-xs text-gray-500">{chatConv.email}</p>
              </div>
            </div>
            <button onClick={() => setChatConv(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {chatMessages.map((m) => (
              <div key={m.id} className={'flex ' + (m.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[80%] rounded-xl px-4 py-2 text-sm ' + (m.sender === 'admin' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                  <p>{m.text}</p>
                  <p className={'text-xs mt-1 ' + (m.sender === 'admin' ? 'text-primary-100' : 'text-gray-400')}>{m.time}</p>
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
