'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Star, MapPin, Store, Package, ArrowRight, SlidersHorizontal, X } from 'lucide-react';

const MOCK_SUPPLIERS = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  companyName: ['AgroQuímica Brasil', 'Máquinas Agrícolas LTDA', 'Sementes Selecta', 'TechIrriga', 'Defensivos AgroFort', 'Pecuária Brasil', 'Fertilizantes Natural', 'Armazenagem Total', 'Logística Agro'][i],
  tradingName: `Fornecedor ${i + 1}`,
  rating: parseFloat((4 + ((i * 3) % 9) / 10).toFixed(1)),
  totalReviews: ((i * 31) % 280) + 15,
  totalProducts: ((i * 47) % 360) + 30,
  city: ['Ribeirão Preto', 'Londrina', 'Cuiabá', 'Campinas', 'Uberlândia', 'Campo Grande', 'Goiânia', 'Passo Fundo', 'Sorriso'][i],
  state: ['SP', 'PR', 'MT', 'SP', 'MG', 'MS', 'GO', 'RS', 'MT'][i],
  featured: i < 3,
  badges: ['Orgânico', 'Premium', 'Verificado'][i % 3],
}));

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const states = ['SP', 'PR', 'MT', 'MG', 'MS', 'GO', 'RS', 'SC', 'BA', 'PA'];

  const filtered = MOCK_SUPPLIERS.filter((s) => {
    if (searchTerm && !s.companyName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedState && s.state !== selectedState) return false;
    if (minRating && s.rating < minRating) return false;
    return true;
  });

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fornecedores</h1>
          <p className="text-sm text-gray-500">{MOCK_SUPPLIERS.length} fornecedores cadastrados</p>
        </div>
        <button onClick={() => setMobileFiltersOpen(true)} className="btn-outline lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="ml-2">Filtros</span>
        </button>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div>
            <label className="label-field">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Estado</h3>
            <div className="grid grid-cols-3 gap-1">
              {states.map((uf) => (
                <button
                  key={uf}
                  onClick={() => setSelectedState(selectedState === uf ? '' : uf)}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedState === uf
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {uf}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Avaliação Mínima</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setMinRating(minRating === star ? 0 : star)}>
                  <Star className={`h-5 w-5 ${star <= minRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { setSearchTerm(''); setSelectedState(''); setMinRating(0); }} className="btn-ghost text-sm w-full">
            Limpar Filtros
          </button>
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Store className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum fornecedor encontrado</h3>
              <p className="text-gray-500">Tente ajustar sua busca ou limpar os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((supplier) => (
                <Link
                  key={supplier.id}
                  href={`/suppliers/${supplier.id}`}
                  className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 card-hover"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                      <Store className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {supplier.companyName}
                      </h3>
                      <p className="text-sm text-gray-500">{supplier.tradingName}</p>
                    </div>
                    {supplier.featured && (
                      <span className="badge-yellow shrink-0">Destaque</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{supplier.rating}</span>
                      <span className="text-gray-500">({supplier.totalReviews})</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Package className="h-4 w-4" />
                      {supplier.totalProducts} produtos
                    </span>
                  </div>

                  <p className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4" />
                    {supplier.city}, {supplier.state}
                  </p>

                  {supplier.badges && (
                    <div className="flex gap-2">
                      <span className="badge-green">{supplier.badges}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white dark:bg-gray-900 p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="label-field">Buscar</label>
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Estado</h3>
                <div className="grid grid-cols-3 gap-1">
                  {states.map((uf) => (
                    <button key={uf} onClick={() => setSelectedState(selectedState === uf ? '' : uf)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg ${selectedState === uf ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {uf}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full">Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
