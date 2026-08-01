'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, Star, Leaf, SlidersHorizontal, X, Loader2 } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    setSearchTerm(query);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setResults(
        query
          ? Array.from({ length: 8 }, (_, i) => ({
              id: String(i + 1),
              name: `${query} - Resultado ${i + 1}`,
              slug: `result-${i + 1}`,
              price: Math.floor(Math.random() * 50000) + 50,
              supplier: 'Fornecedor Exemplo',
              rating: parseFloat((4 + Math.random()).toFixed(1)),
              reviews: Math.floor(Math.random() * 200),
            }))
          : []
      );
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {query ? `Resultados para "${query}"` : 'Buscar Produtos'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Buscando...' : `${results.length} resultado(s) encontrado(s)`}
        </p>
      </div>

      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Buscar produtos, fornecedores..."
              className="input-field pl-12 py-3 text-base"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-6">Buscar</button>
        </div>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
            <SearchIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum resultado encontrado</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {query
              ? `Não encontramos resultados para "${query}". Tente termos diferentes ou menos específicos.`
              : 'Digite um termo para buscar produtos e fornecedores.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn-primary">Ver Todos os Produtos</Link>
            <Link href="/categories" className="btn-outline">Explorar Categorias</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover"
            >
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Leaf className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs text-gray-500">{product.supplier}</p>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <p className="text-xl font-bold text-primary-600">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container-page py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 skeleton rounded" />
          <div className="h-12 w-full max-w-2xl skeleton rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
