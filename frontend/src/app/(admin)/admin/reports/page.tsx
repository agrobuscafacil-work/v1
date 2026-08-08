'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, DollarSign, ShoppingBag, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { exportCSV, exportPDF } from '@/lib/export';

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  customer: {
    id: string;
    name: string;
    email: string;
  };
  supplier: {
    id: string;
    companyName: string;
    tradingName: string;
  };
}

const reportTypes = [
  { id: 'financial', label: 'Relatório Financeiro', icon: DollarSign },
  { id: 'usage', label: 'Relatório de Uso', icon: Users },
  { id: 'searches', label: 'Produtos Mais Vendidos', icon: TrendingUp },
];

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState('financial');
  const [exportMenu, setExportMenu] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<Record<string, any>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordersRes, dashboardRes] = await Promise.all([
          api.get('/orders/admin', { params: { limit: 500 } }),
          api.get('/dashboard/admin'),
        ]);
        const payload = ordersRes.data.data?.data ?? [];
        setOrders(payload);
        setDashboardStats(dashboardRes.data.data ?? {});
      } catch (e: any) {
        const msg = e?.response?.data?.message;
        toast.error(typeof msg === 'string' ? msg : 'Erro ao carregar relatórios.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const delivered = orders.filter((o) => o.status === 'DELIVERED');
  const revenueOrders = delivered.length > 0 ? delivered : orders;
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const avgTicket = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;
  const commission = totalRevenue * 0.05;

  const monthlyData = Array.from(
    orders.reduce((map, o) => {
      const d = new Date(o.createdAt);
      const key = d.getFullYear() * 12 + d.getMonth();
      const label = monthNames[d.getMonth()] + '/' + String(d.getFullYear()).slice(2);
      const current = map.get(key);
      if (current) {
        current.revenue += Number(o.total);
        current.orders += 1;
      } else {
        map.set(key, { month: label, revenue: Number(o.total), orders: 1 });
      }
      return map;
    }, new Map<number, { month: string; revenue: number; orders: number }>()),
  )
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value);

  const topProducts = Array.from(
    orders.reduce((map, o) => {
      (o.items || []).forEach((item) => {
        const name = item.product?.name || 'Produto sem nome';
        const current = map.get(name);
        const revenue = Number(item.unitPrice) * Number(item.quantity);
        if (current) {
          current.quantity += Number(item.quantity);
          current.revenue += revenue;
        } else {
          map.set(name, { name, quantity: Number(item.quantity), revenue });
        }
      });
      return map;
    }, new Map<string, { name: string; quantity: number; revenue: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topSuppliers = Array.from(
    orders.reduce((map, o) => {
      const name = o.supplier?.companyName || 'Fornecedor removido';
      map.set(name, (map.get(name) || 0) + Number(o.total));
      return map;
    }, new Map<string, number>()),
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const maxRevenue = monthlyData.length ? Math.max(...monthlyData.map((d) => d.revenue)) : 1;
  const maxOrders = monthlyData.length ? Math.max(...monthlyData.map((d) => d.orders)) : 1;

  const dashboard = dashboardStats || {};
  const activeUsers = Number(dashboard.activeUsers) || 0;
  const newUsersMonth = Number(dashboard.newUsersMonth) || 0;
  const sessionsThisMonth = Number(dashboard.sessions?.thisMonth) || 0;
  const conversionRate = Number(dashboard.conversionRate) || 0;
  const reviews = Number(dashboard.reviews) || 0;

  const reportCards = [
    { label: 'Vendas do Mês', value: 'R$ ' + totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), change: `${dashboard.revenueChange >= 0 ? '+' : ''}${dashboard.revenueChange ?? 0}%`, up: (dashboard.revenueChange ?? 0) >= 0, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Usuários Ativos', value: activeUsers ? activeUsers.toLocaleString('pt-BR') : '0', change: '—', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Pedidos Realizados', value: totalOrders.toLocaleString('pt-BR'), change: `${dashboard.ordersChange >= 0 ? '+' : ''}${dashboard.ordersChange ?? 0}%`, up: (dashboard.ordersChange ?? 0) >= 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Taxa Conversão', value: `${conversionRate.toLocaleString('pt-BR')}%`, change: 'das sessões', up: true, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950' },
  ];

  function doExportCSV(report: string) {
    const filename = 'relatorio-' + report + '-' + new Date().toISOString().slice(0, 10);
    if (report === 'financial') {
      exportCSV(filename, ['Mês', 'Receita', 'Pedidos'], monthlyData.map((d) => [d.month, String(d.revenue), String(d.orders)]));
    } else if (report === 'usage') {
      const usageData = [
        ['Usuários Ativos', String(activeUsers)],
        ['Novos Cadastros', String(newUsersMonth)],
        ['Sessões (mês)', String(sessionsThisMonth)],
        ['Avaliações', String(reviews)],
      ];
      exportCSV(filename, ['Métrica', 'Valor'], usageData);
    } else if (report === 'searches') {
      exportCSV(filename, ['#', 'Produto', 'Vendidos'], topProducts.map((s, i) => [String(i + 1), s.name, String(s.quantity)]));
    }
    setExportMenu(null);
    toast.success('CSV exportado');
  }

  function doExportPDF(report: string) {
    exportPDF('relatorio-' + report);
    setExportMenu(null);
  }

  return (
    <div className="p-6 lg:p-8">
      {loading && (
        <div className="flex items-center justify-center gap-2 mb-6 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1">Análises e métricas da plataforma.</p>
        </div>
      </div>

      {!loading && orders.length === 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4 mb-8 text-sm text-amber-700 dark:text-amber-300">
          Nenhum pedido encontrado. Os relatórios serão exibidos assim que houver vendas registradas.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={'h-8 w-8 rounded-lg ' + card.bg + ' flex items-center justify-center'}>
                <card.icon className={'h-4 w-4 ' + card.color} />
              </div>
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</p>
            <span className={'text-xs ' + (card.up ? 'text-green-600' : 'text-red-600')}>{card.change}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Receita & Pedidos</h2>
          <div className="relative">
            <button onClick={() => setExportMenu(exportMenu === 'chart' ? null : 'chart')} className="btn-outline text-sm gap-2 inline-flex items-center">
              <Download className="h-4 w-4" /> Exportar
            </button>
            {exportMenu === 'chart' && (
              <div className="absolute right-0 mt-2 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10">
                <button onClick={() => doExportCSV('financial')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg"><FileSpreadsheet className="h-4 w-4" /> CSV</button>
                <button onClick={() => doExportPDF('financial')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"><FileText className="h-4 w-4" /> PDF</button>
              </div>
            )}
          </div>
        </div>
        <div className="h-64">
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-500">Sem dados de vendas no período.</div>
          ) : (
            <>
              <div className="flex items-end gap-2 h-48 mb-2">
                {monthlyData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center gap-0.5">
                      <div className="w-full bg-primary-500 dark:bg-primary-600 rounded-t" style={{ height: (d.revenue / maxRevenue) * 100 + '%' }} />
                      <div className="w-full bg-emerald-400 dark:bg-emerald-500 rounded-t" style={{ height: (d.orders / maxOrders) * 80 + '%' }} />
                    </div>
                    <span className="text-xs text-gray-500">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-primary-500" /> Receita</div>
                <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-emerald-400" /> Pedidos</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={'flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ' + (activeReport === r.id ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800')}
          >
            <div className={'h-10 w-10 rounded-lg flex items-center justify-center ' + (activeReport === r.id ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
              <r.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{r.label}</p>
              <p className="text-xs text-gray-500">
                {r.id === 'financial' ? 'Receitas, despesas e projeções' : r.id === 'usage' ? 'Usuários ativos e sessões' : 'Termos e categorias populares'}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        {activeReport === 'financial' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório Financeiro</h2>
              <div className="relative">
                <button onClick={() => setExportMenu(exportMenu === 'financial' ? null : 'financial')} className="btn-outline text-sm gap-2 inline-flex items-center">
                  <Download className="h-4 w-4" /> Exportar
                </button>
                {exportMenu === 'financial' && (
                  <div className="absolute right-0 mt-2 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10">
                    <button onClick={() => doExportCSV('financial')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg"><FileSpreadsheet className="h-4 w-4" /> CSV</button>
                    <button onClick={() => doExportPDF('financial')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"><FileText className="h-4 w-4" /> PDF</button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Receita Total (mês)</p>
                <p className="text-xl font-bold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Ticket Médio</p>
                <p className="text-xl font-bold text-primary-600">R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Comissões (5%)</p>
                <p className="text-xl font-bold text-orange-600">R$ {commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Receita Líquida</p>
                <p className="text-xl font-bold text-emerald-600">R$ {(totalRevenue - commission).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'usage' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório de Uso</h2>
              <div className="relative">
                <button onClick={() => setExportMenu(exportMenu === 'usage' ? null : 'usage')} className="btn-outline text-sm gap-2 inline-flex items-center">
                  <Download className="h-4 w-4" /> Exportar
                </button>
                {exportMenu === 'usage' && (
                  <div className="absolute right-0 mt-2 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10">
                    <button onClick={() => doExportCSV('usage')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg"><FileSpreadsheet className="h-4 w-4" /> CSV</button>
                    <button onClick={() => doExportPDF('usage')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"><FileText className="h-4 w-4" /> PDF</button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Usuários Ativos</p>
                <p className="text-xl font-bold text-blue-600">{activeUsers.toLocaleString('pt-BR')}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Novos Cadastros (mês)</p>
                <p className="text-xl font-bold text-green-600">+{newUsersMonth.toLocaleString('pt-BR')}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Sessões (mês)</p>
                <p className="text-xl font-bold text-purple-600">{sessionsThisMonth.toLocaleString('pt-BR')}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Avaliações Aprovadas</p>
                <p className="text-xl font-bold text-orange-600">{reviews.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'searches' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos Mais Vendidos</h2>
              <div className="relative">
                <button onClick={() => setExportMenu(exportMenu === 'searches' ? null : 'searches')} className="btn-outline text-sm gap-2 inline-flex items-center">
                  <Download className="h-4 w-4" /> Exportar
                </button>
                {exportMenu === 'searches' && (
                  <div className="absolute right-0 mt-2 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10">
                    <button onClick={() => doExportCSV('searches')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg"><FileSpreadsheet className="h-4 w-4" /> CSV</button>
                    <button onClick={() => doExportPDF('searches')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"><FileText className="h-4 w-4" /> PDF</button>
                  </div>
                )}
              </div>
            </div>
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">Nenhum produto vendido no período.</div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-1">
                        <div className="h-1.5 rounded-full bg-primary-500" style={{ width: (item.quantity / topProducts[0].quantity) * 100 + '%' }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{item.quantity} vendidos</p>
                      <p className="text-xs text-gray-400">R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Fornecedores com Maior Receita</h3>
              {topSuppliers.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum fornecedor com vendas no período.</p>
              ) : (
                <div className="space-y-2">
                  {topSuppliers.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-1">
                          <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: (item.total / topSuppliers[0].total) * 100 + '%' }} />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
