'use client';

import { useState } from 'react';
import { BarChart3, Download, DollarSign, ShoppingBag, Users, TrendingUp, FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportCSV, exportPDF } from '@/lib/export';

const stats = [
  { label: 'Vendas (mês)', value: 'R$ 12.450', change: '+18%', up: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  { label: 'Pedidos', value: '18', change: '+12%', up: true, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  { label: 'Clientes', value: '156', change: '+8%', up: true, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
  { label: 'Ticket Médio', value: 'R$ 691', change: '+5%', up: true, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
];

const monthlySales = [
  { month: 'Fev', value: 8900 }, { month: 'Mar', value: 10200 }, { month: 'Abr', value: 9800 },
  { month: 'Mai', value: 11400 }, { month: 'Jun', value: 10800 }, { month: 'Jul', value: 12450 },
];

const maxSale = Math.max(...monthlySales.map((d) => d.value));

export default function SupplierReportsPage() {
  const [exportMenu, setExportMenu] = useState<string | null>(null);

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
        {stats.map((s) => (
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
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
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
    </div>
  );
}
