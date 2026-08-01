'use client';

import { useState } from 'react';
import { Percent, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const promos = [
  { id: '1', name: 'Semana do Plantio', discount: '20%', products: 8, starts: '01/08/2026', ends: '15/08/2026', status: 'active' },
  { id: '2', name: 'Liquidação de Inverno', discount: '15%', products: 12, starts: '01/07/2026', ends: '31/07/2026', status: 'ended' },
  { id: '3', name: 'Frete Grátis Sudeste', discount: 'Frete Grátis', products: 5, starts: '01/08/2026', ends: '30/09/2026', status: 'scheduled' },
];

export default function SupplierPromotionsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promoções</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas ofertas e descontos.</p>
        </div>
        <button onClick={() => toast.success('Nova promoção criada!')} className="btn-primary text-sm gap-2 inline-flex items-center">
          <Plus className="h-4 w-4" /> Nova Promoção
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <div key={p.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <Percent className="h-6 w-6 text-primary-600" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                p.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                p.status === 'scheduled' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>{p.status === 'active' ? 'Ativa' : p.status === 'scheduled' ? 'Agendada' : 'Encerrada'}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{p.name}</p>
            <p className="text-2xl font-bold text-primary-600 mb-3">{p.discount}</p>
            <p className="text-sm text-gray-500 mb-2">{p.products} produtos</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" /> {p.starts} - {p.ends}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
