'use client';

import { useState } from 'react';
import { Truck, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const shippingOptions = [
  { id: '1', name: 'Transportadora ABC', region: 'Sudeste', price: 25.90, estimated: '3-5 dias', active: true },
  { id: '2', name: 'Transportadora XYZ', region: 'Sul', price: 35.90, estimated: '4-7 dias', active: true },
  { id: '3', name: 'Correios PAC', region: 'Nacional', price: 45.90, estimated: '7-15 dias', active: true },
];

export default function SupplierShippingPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fretes</h1>
          <p className="text-sm text-gray-500 mt-1">Configure opções de frete para sua loja.</p>
        </div>
        <button onClick={() => toast.success('Novo frete adicionado!')} className="btn-primary text-sm gap-2 inline-flex items-center">
          <Plus className="h-4 w-4" /> Novo Frete
        </button>
      </div>
      <div className="space-y-4">
        {shippingOptions.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{s.region}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-600">R$ {s.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{s.estimated}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
