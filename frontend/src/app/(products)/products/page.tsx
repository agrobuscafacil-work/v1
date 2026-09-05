'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, X, Star, Leaf, ChevronDown, Grid3X3, List, Loader2, ShoppingCart, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { productCategories } from '@/lib/categories';
import { PRODUCT_FILE_URL } from '@/lib/products';
import { useCart } from '@/hooks/use-cart';

const sortOptions = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
];

interface DisplayProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  image: string | null;
  supplier: string;
  supplierId: string;
  categoryId: string;
  rating: number;
  reviews: number;
  unit: string;
  freeShipping: boolean;
  createdAt: Date;
  saleMode: 'DIRECT' | 'CONTACT_ONLY';
  supplierWhatsapp?: string;
  productCode?: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [minRating, setMinRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const categories = [
    { id: 'all', name: 'Todas as Categorias' },
    ...productCategories.map(({ slug, name }) => ({ id: slug, name })),
  ];

  const firstLoad = useRef(true);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const supplierId = query.get('supplierId');
    const category = query.get('category');
    if (supplierId) setSelectedSupplierId(supplierId);
    if (category && categories.some((item) => item.id === category)) setSelectedCategory(category);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      if (firstLoad.current) {
        setIsLoading(true);
        firstLoad.current = false;
      }
      try {
        const params: Record<string, string | number> = { limit: 50 };
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (searchTerm) params.search = searchTerm;
        if (selectedSupplierId) params.supplierId = selectedSupplierId;
        const res = await api.get('/products', { params, signal: ctrl.signal });
        const data = res.data.data?.data ?? [];
        setProducts(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price),
            comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
            image: p.images?.[0] || null,
            supplier: p.supplier?.companyName || 'Fornecedor',
            supplierId: p.supplier?.id || p.supplierId || '',
            categoryId: p.categoryId,
            rating: Number(p.rating) || 0,
            reviews: Number(p.totalReviews) || 0,
            unit: p.unit || 'un',
            freeShipping: !!p.freeShipping,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            saleMode: p.saleMode || 'DIRECT',
            supplierWhatsapp: p.supplier?.whatsapp || '',
                      productCode: p.productCode?.code || '',
          })),
        );
      } catch {
        if (!ctrl.signal.aborted) {
          setProducts((prev) => (prev.length > 0 ? prev : []));
        }
      } finally {
        if (!ctrl.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => ctrl.abort();
  }, [selectedCategory, searchTerm, selectedSupplierId]);

  const priceCap = useMemo(() => {
    const max = products.reduce((m, p) => Math.max(m, p.price), 0);
    return max > 0 ? Math.ceil(max / 1000) * 1000 : 500000;
  }, [products]);

  const effMin = Math.min(priceRange[0], priceCap);
  const effMax = Math.min(priceRange[1], priceCap);

  const filteredProducts = products
    .filter((p) => {
      if (p.price < effMin || p.price > effMax) return false;
      if (Number(p.rating) < minRating) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'newest': return b.createdAt.getTime() - a.createdAt.getTime();
        default: return 0;
      }
    });

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-sm text-gray-500">{filteredProducts.length} produtos encontrados</p>
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
                <label className="text-xs text-gray-500">Mínimo: R$ {effMin.toLocaleString('pt-BR')}</label>
                <input
                  type="range"
                  min={0}
                  max={priceCap}
                  step={100}
                  value={effMin}
                  onChange={(e) => setPriceRange([Math.min(Number(e.target.value), effMax), priceRange[1]])}
                  className="w-full accent-primary-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Máximo: R$ {effMax.toLocaleString('pt-BR')}</label>
                <input
                  type="range"
                  min={0}
                  max={priceCap}
                  step={100}
                  value={effMax}
                  onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), effMin)])}
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
              setPriceRange([0, priceCap]);
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
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange([0, priceCap]); setMinRating(0); }}
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
                <div
                  key={product.id}
                  className={`group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover flex flex-col ${
                    viewMode === 'grid' ? 'rounded-xl' : 'flex-row rounded-xl'
                  }`}
                >
                  <Link href={`/products/${product.slug}`} className={`flex-1 ${viewMode === 'grid' ? '' : 'flex flex-1'}`}>
                    <div className={`bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center ${
                      viewMode === 'grid' ? 'aspect-[4/3] w-full' : 'w-48 shrink-0 aspect-square'
                    }`}>
                      {product.image ? (
                        <Image
                          src={PRODUCT_FILE_URL(product.image)}
                          alt={product.name}
                          fill
                          sizes={viewMode === 'grid' ? '(max-width: 640px) 50vw, 25vw' : '192px'}
                          className="object-cover"
                        />
                      ) : (
                        <Leaf className="h-12 w-12 text-gray-400" />
                      )}
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
                        {product.productCode && <p className="text-xs text-gray-500">Código: {product.productCode}</p>}
                        {product.comparePrice && (
                          <p className="text-sm text-gray-400 line-through">
                            R$ {product.comparePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-3 pt-0">
                    {product.saleMode === 'CONTACT_ONLY' ? <div className="flex gap-2">
                      {product.supplierWhatsapp && <a href={`https://wa.me/${product.supplierWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="btn-primary flex-1 gap-2 text-xs"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
                      <Link href={`/suppliers/${product.supplierId}`} onClick={(e) => { e.stopPropagation(); }} className="btn-outline flex-1 gap-2 text-xs"><MessageCircle className="h-4 w-4" /> Chat Online</Link>
                    </div> : <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          unit: product.unit,
                          image: product.image ? PRODUCT_FILE_URL(product.image) : '',
                          supplierName: product.supplier,
                          supplierId: product.supplierId,
                        }, 1);
                        router.push('/checkout');
                      }}
                      className="btn-primary w-full gap-2 text-sm"
                    >
                      <ShoppingCart className="h-4 w-4" /> Comprar
                    </button>}
                  </div>
                </div>
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
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange([0, priceCap]); setMinRating(0); setMobileFiltersOpen(false); }}
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
