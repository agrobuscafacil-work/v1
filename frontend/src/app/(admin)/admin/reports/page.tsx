'use client';

import { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, DollarSign, ShoppingBag, FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportCSV, exportPDF } from '@/lib/export';

const reportCards = [
  { label: 'Vendas do Mês', value: 'R$ 127.890', change: '+15%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  { label: 'Usuários Ativos', value: '1.247', change: '+12%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  { label: 'Pedidos Realizados', value: '892', change: '+23%', up: true, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  { label: 'Taxa Conversão', value: '3,2%', change: '-0,5%', up: false, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950' },
];

const monthlyData = [
  { month: 'Jan', revenue: 85000, orders: 520 },
  { month: 'Fev', revenue: 92000, orders: 580 },
  { month: 'Mar', revenue: 78000, orders: 490 },
  { month: 'Abr', revenue: 101000, orders: 620 },
  { month: 'Mai', revenue: 95000, orders: 590 },
  { month: 'Jun', revenue: 112000, orders: 710 },
  { month: 'Jul', revenue: 127890, orders: 892 },
];

const reportTypes = [
  { id: 'financial', label: 'Relatório Financeiro', icon: DollarSign },
  { id: 'usage', label: 'Relatório de Uso', icon: Users },
  { id: 'searches', label: 'Itens Mais Buscados', icon: TrendingUp },
];

const topSearches = [
  { term: 'Semente de Soja', count: 1234, trend: 'up' },
  { term: 'Fertilizante NPK', count: 987, trend: 'up' },
  { term: 'Trator Agrícola', count: 876, trend: 'up' },
  { term: 'Defensivo Glifosato', count: 654, trend: 'down' },
  { term: 'Sistema de Irrigação', count: 543, trend: 'up' },
  { term: 'Arado de Disco', count: 432, trend: 'down' },
  { term: 'Semente de Milho', count: 398, trend: 'up' },
  { term: 'Pulverizador Agrícola', count: 312, trend: 'up' },
];

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState('financial');

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
  const maxOrders = Math.max(...monthlyData.map((d) => d.orders));
  const [exportMenu, setExportMenu] = useState<string | null>(null);

  function doExportCSV(report: string) {
    const filename = 'relatorio-' + report + '-' + new Date().toISOString().slice(0, 10);
    if (report === 'financial') {
      exportCSV(filename, ['Mês', 'Receita', 'Pedidos'], monthlyData.map((d) => [d.month, String(d.revenue), String(d.orders)]));
    } else if (report === 'usage') {
      const usageData = [
        ['Usuários Ativos', '1.247'],
        ['Novos Cadastros', '+124'],
        ['Sessões (mês)', '8.342'],
        ['Tempo Médio', '4m 32s'],
      ];
      exportCSV(filename, ['Métrica', 'Valor'], usageData);
    } else if (report === 'searches') {
      exportCSV(filename, ['#', 'Termo', 'Buscas'], topSearches.map((s, i) => [String(i + 1), s.term, String(s.count)]));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1">Análises e métricas da plataforma.</p>
        </div>
      </div>

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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Receita & Pedidos (2026)</h2>
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
                <p className="text-xl font-bold text-green-600">R$ 127.890,00</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Ticket Médio</p>
                <p className="text-xl font-bold text-primary-600">R$ 143,37</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Comissões (5%)</p>
                <p className="text-xl font-bold text-orange-600">R$ 6.394,50</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Receita Líquida</p>
                <p className="text-xl font-bold text-emerald-600">R$ 121.495,50</p>
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
                <p className="text-sm text-gray-500">Usuários Ativos (mês)</p>
                <p className="text-xl font-bold text-blue-600">1.247</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Novos Cadastros</p>
                <p className="text-xl font-bold text-green-600">+124</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Sessões (mês)</p>
                <p className="text-xl font-bold text-purple-600">8.342</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-500">Tempo Médio</p>
                <p className="text-xl font-bold text-orange-600">4m 32s</p>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'searches' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Itens Mais Buscados</h2>
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
            <div className="space-y-2">
              {topSearches.map((item, i) => (
                <div key={item.term} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.term}</p>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-1">
                      <div className="h-1.5 rounded-full bg-primary-500" style={{ width: (item.count / topSearches[0].count) * 100 + '%' }} />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
