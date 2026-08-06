'use client';

import { useEffect, useState } from 'react';
import { Download, DollarSign, ShoppingBag, Package, TrendingUp, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { exportCSV, exportPDF } from '@/lib/export';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
};

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatMoney(value: number | string) {
  return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function buildMonthlySeries(sales: any) {
  const now = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 12);
  const slots: { key: string; month: string; value: number }[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= now) {
    slots.push({
      key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
      month: monthNames[d.getMonth()],
      value: 0,
    });
    d.setMonth(d.getMonth() + 1);
  }
  (sales.orders || []).forEach((o: any) => {
    const dt = new Date(o.createdAt);
    if (isNaN(dt.getTime())) return;
    const key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
    const slot = slots.find((s) => s.key === key);
    if (slot) slot.value += Number(o.total) || 0;
  });
  return slots.map(({ month, value }) => ({ month, value }));
}

export default function SupplierReportsPage() {
  const [exportMenu, setExportMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalProducts: number; totalServices: number; totalOrders: number; totalRevenue: number } | null>(null);
  const [monthlySales, setMonthlySales] = useState<{ month: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; customer: string; items: number; total: number; status: string; createdAt: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 12);
        const [statsRes, salesRes, topRes, ordersRes] = await Promise.all([
          api.get('/dashboard/supplier/stats'),
          api.get('/dashboard/supplier/sales', { params: { startDate: start.toISOString(), endDate: end.toISOString() } }),
          api.get('/dashboard/supplier/top-products', { params: { limit: 5 } }),
          api.get('/orders'),
        ]);
        setStats(statsRes.data.data ?? null);
        setMonthlySales(buildMonthlySeries(salesRes.data.data ?? { orders: [] }));
        setTopProducts(Array.isArray(topRes.data.data) ? topRes.data.data : []);
        const ordersData = ordersRes.data.data?.data ?? [];
        setOrders(ordersData.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer?.name || 'Cliente',
          items: o.items?.length ?? 0,
          total: Number(o.total),
          status: o.status,
          createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '—',
        })));
      } catch {
        toast.error('Erro ao carregar relatórios.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statsCards = [
    { label: 'Produtos', value: stats ? String(stats.totalProducts) : '—', change: '—', up: true, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Serviços', value: stats ? String(stats.totalServices) : '—', change: '—', up: true, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Pedidos', value: stats ? String(stats.totalOrders) : '—', change: '—', up: true, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
    { label: 'Receita', value: stats ? formatMoney(stats.totalRevenue) : '—', change: '—', up: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  ];

  const maxSale = Math.max(...monthlySales.map((d) => d.value), 1);

  function doExportCSV() {
    exportCSV('relatorio-vendas-' + new Date().toISOString().slice(0, 10),
      ['Mês', 'Valor'],
      monthlySales.map((d) => [d.month, String(d.value)])
    );
    setExportMenu(null);
    toast.success('CSV exportado');
  }

  function doExportPDF() {
    exportPDF('relatorio-vendas');
    setExportMenu(null);
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center py-24 gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando relatórios...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1">Métricas e análises da sua loja.</p>
        </div>
        <div className="relative">
          <button onClick={() => setExportMenu(exportMenu === 'main' ? null : 'main')} className="btn-outline text-sm gap-2 inline-flex items-center">
            <Download className="h-4 w-4" /> Exportar
          </button>
          {exportMenu === 'main' && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10">
              <button onClick={doExportCSV} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg"><FileSpreadsheet className="h-4 w-4" /> CSV</button>
              <button onClick={doExportPDF} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"><FileText className="h-4 w-4" /> PDF</button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={'h-8 w-8 rounded-lg ' + s.bg + ' flex items-center justify-center'}><s.icon className={'h-4 w-4 ' + s.color} /></div>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
            <span className={'text-xs ' + (s.up ? 'text-green-600' : 'text-red-600')}>{s.change}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendas Mensais</h2>
        <div className="h-48">
          <div className="flex items-end gap-2 h-36 mb-2">
            {monthlySales.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary-500 rounded-t" style={{ height: (d.value / maxSale) * 100 + '%' }} />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Produtos</h2>
          <div className="space-y-2">
            {topProducts.length === 0 && <p className="text-sm text-gray-500">Nenhum produto vendido ainda.</p>}
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} vendido(s)</p>
                </div>
                <span className="text-sm font-semibold text-primary-600">{formatMoney(p.totalRevenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pedidos Recentes</h2>
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-sm text-gray-500">Nenhum pedido recebido ainda.</p>}
            {orders.map((order) => {
              const statusInfo = statusLabels[order.status] || statusLabels.PENDING;
              return (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customer} - {order.items} item(ns) · {order.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary-600">{formatMoney(order.total)}</span>
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + statusInfo.color}>{statusInfo.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
