'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, X, Star, Leaf, ChevronDown, Grid3X3, List, Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

const sortOptions = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
];

const productCategories = ['maquinas', 'fertilizantes', 'sementes', 'defensivos', 'irrigacao', 'insumos', 'pecuaria', 'armazenagem', 'maquinas', 'fertilizantes', 'sementes', 'defensivos'];

const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: i % 2 === 0
    ? 'Trator Agrícola 4x4 Motor Turbodiesel'
    : 'Fertilizante NPK 10-10-10 50kg',
  slug: 'product-' + (i + 1),
  price: i % 2 === 0 ? 249900 : 189.90,
  comparePrice: i % 2 === 0 ? 289900 : 229.90,
  image: null,
  supplier: i % 2 === 0 ? 'Máquinas Agrícolas LTDA' : 'AgroQuímica Brasil',
  category: productCategories[i],
  rating: (4 + (i % 5) * 0.2).toFixed(1),
  reviews: i * 17 + 10,
  unit: i % 2 === 0 ? 'un' : 'sc',
  freeShipping: i % 3 === 0,
  createdAt: new Date(2026, 6, 29 - i),
}));

const categories = [
  { id: 'all', name: 'Todas as Categorias' },
  { id: 'insumos', name: 'Insumos' },
  { id: 'maquinas', name: 'Máquinas' },
  { id: 'sementes', name: 'Sementes' },
  { id: 'fertilizantes', name: 'Fertilizantes' },
  { id: 'defensivos', name: 'Defensivos' },
  { id: 'irrigacao', name: 'Irrigação' },
  { id: 'pecuaria', name: 'Pecuária' },
  { id: 'armazenagem', name: 'Armazenagem' },
];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [minRating, setMinRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProducts = MOCK_PRODUCTS
    .filter((p) => {
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (Number(p.rating) < minRating) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return Number(b.rating) - Number(a.rating);
        case 'newest': return b.createdAt.getTime() - a.createdAt.getTime();
        default: return 0;
      }
    });

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-sm text-gray-500">{MOCK_PRODUCTS.length} produtos encontrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-outline lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="ml-2">Filtros</span>
          </button>
          <div className="hidden sm:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-primary-600' : 'text-gray-500'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-primary-600' : 'text-gray-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div>
            <label className="label-field">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categorias</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Faixa de Preço</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Mínimo: R$ {priceRange[0].toLocaleString('pt-BR')}</label>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={100}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full accent-primary-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Máximo: R$ {priceRange[1].toLocaleString('pt-BR')}</label>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary-600"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Avaliação Mínima</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= minRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setPriceRange([0, 500000]);
              setMinRating(0);
            }}
            className="btn-ghost text-sm w-full"
          >
            Limpar Filtros
          </button>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-1/3 skeleton rounded" />
                    <div className="h-4 w-2/3 skeleton rounded" />
                    <div className="h-3 w-1/4 skeleton rounded" />
                    <div className="h-6 w-1/3 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Leaf className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mb-4">Tente ajustar sua busca ou limpar os filtros.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange([0, 500000]); setMinRating(0); }}
                className="btn-primary"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover ${
                    viewMode === 'grid' ? 'rounded-xl' : 'flex rounded-xl'
                  }`}
                >
                  <div className={`bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center ${
                    viewMode === 'grid' ? 'aspect-[4/3]' : 'w-48 shrink-0 aspect-square'
                  }`}>
                    <Leaf className="h-12 w-12 text-gray-400" />
                    {product.freeShipping && (
                      <span className="absolute top-2 left-2 badge-green text-xs">Frete Grátis</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.supplier}</p>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-primary-600">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {product.comparePrice && (
                        <p className="text-sm text-gray-400 line-through">
                          R$ {product.comparePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-500">Página 1 de 1</p>
            <div className="flex gap-2">
              <button disabled className="btn-outline text-sm">Anterior</button>
              <button className="btn-primary text-sm">1</button>
              <button disabled className="btn-outline text-sm">Próximo</button>
            </div>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white dark:bg-gray-900 p-6 overflow-y-auto shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="label-field">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Categorias</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${
                        selectedCategory === cat.id ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange([0, 500000]); setMinRating(0); setMobileFiltersOpen(false); }}
                className="btn-primary w-full"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
