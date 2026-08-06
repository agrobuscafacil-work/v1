'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Shield, Truck, Leaf, ArrowRight, Star, Clock, TrendingUp, Store, Sprout, Wheat, Sun, Wind } from 'lucide-react';
import { api } from '@/lib/api';

const categoryIcons: Record<string, any> = {
  insumos: Sprout,
  maquinas: Wheat,
  sementes: Leaf,
  fertilizantes: Sun,
  defensivos: Shield,
  irrigacao: Wind,
  pecuaria: Store,
  armazenagem: Truck,
};

const steps = [
  { icon: Search, title: 'Busque', description: 'Encontre produtos, máquinas e serviços para sua produção rural.' },
  { icon: Shield, title: 'Compare', description: 'Analise preços, avaliações e fornecedores com transparência total.' },
  { icon: Truck, title: 'Receba', description: 'Receba seus insumos no prazo, com logística especializada para o agro.' },
  { icon: Leaf, title: 'Cultive', description: 'Produza mais e melhor com os melhores fornecedores do mercado.' },
];

interface CategoryItem {
  name: string;
  slug: string;
  icon: any;
}

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  supplier: string;
  rating: number;
  reviews: number;
}

interface TopSupplier {
  id: string;
  name: string;
  rating: number;
  city: string;
  state: string;
  products: number;
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes, supRes] = await Promise.all([
          api.get('/categories').catch(() => null),
          api.get('/products', { params: { featured: true, limit: 4 } }).catch(() => null),
          api.get('/suppliers', { params: { limit: 50 } }).catch(() => null),
        ]);

        if (catRes) {
          const payload = Array.isArray(catRes.data.data) ? catRes.data.data : [];
          setCategories(
            payload
              .filter((c: any) => c.slug)
              .map((c: any) => ({
                name: c.name,
                slug: c.slug,
                icon: categoryIcons[c.slug] || categoryIcons[c.slug?.toLowerCase()] || Store,
              }))
              .slice(0, 8),
          );
        }

        if (prodRes) {
          const payload = prodRes.data.data?.data ?? [];
          setFeaturedProducts(
            payload.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: Number(p.price) || 0,
              supplier: p.supplier?.companyName || '',
              rating: Number(p.rating) || 0,
              reviews: Number(p.totalReviews) || 0,
            })),
          );
        }

        if (supRes) {
          const payload = supRes.data.data?.data ?? [];
          setTopSuppliers(
            payload
              .map((s: any) => ({
                id: s.id,
                name: s.companyName,
                rating: Number(s.rating) || 0,
                city: s.addresses?.[0]?.city || '',
                state: s.addresses?.[0]?.state || '',
                products: Number(s.totalProducts) || 0,
              }))
              .sort((a: any, b: any) => b.rating - a.rating)
              .slice(0, 6),
          );
        }
      } catch {
        // dados estáticos mantidos em branco em caso de indisponibilidade da API
      }
    };
    load();
  }, []);

  return (
    <>
      <section className="relative bg-gradient-to-b from-green-950 via-primary-900 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 bg-field-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-900" />

        <div className="absolute top-10 left-10 text-green-400/20 animate-leaf-drift">
          <Leaf className="h-16 w-16" />
        </div>
        <div className="absolute top-20 right-20 text-green-300/15 animate-leaf-drift" style={{ animationDelay: '2s' }}>
          <Sprout className="h-12 w-12" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-green-400/20 animate-leaf-drift" style={{ animationDelay: '4s' }}>
          <Leaf className="h-10 w-10" />
        </div>
        <div className="absolute top-1/3 right-10 text-secondary-400/10 animate-sway">
          <Sun className="h-20 w-20" />
        </div>

        <div className="container-page relative py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-800/60 border border-primary-500/30 px-4 py-1.5 mb-6 backdrop-blur-sm">
              <Sprout className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-200 font-medium">Marketplace B2B e B2C do Agronegócio</span>
            </div>
            <h1 className="heading-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Conectando o{' '}
              <span className="bg-gradient-to-r from-secondary-300 via-secondary-400 to-yellow-400 bg-clip-text text-transparent">Campo</span>{' '}
              ao Futuro
            </h1>
            <p className="text-lg sm:text-xl text-primary-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Encontre os melhores fornecedores, produtos e serviços para sua produção rural.
              Tudo em um só lugar, com segurança e agilidade.
            </p>
            <div className="max-w-xl mx-auto">
              <form action="/search" method="GET" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="O que você precisa? Tratores, sementes, fertilizantes..."
                    className="w-full rounded-xl border-0 bg-white px-12 py-4 text-base text-gray-900 shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>
                <button type="submit" className="btn-secondary rounded-xl px-8 text-base shadow-lg">
                  Buscar
                </button>
              </form>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-sm text-primary-200">
              <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-secondary-400" /> Fornecedores verificados</span>
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-secondary-400" /> Frete para todo Brasil</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary-400" /> Entrega garantida</span>
            </div>
          </div>
        </div>

        <div className="relative h-24 bg-gradient-to-b from-primary-900 to-transparent" />
      </section>

      {categories.length > 0 && (
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-950 relative">
          <div className="absolute inset-0 bg-leaf-pattern opacity-50" />
          <div className="container-page relative">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sprout className="h-5 w-5 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Navegue</span>
                </div>
                <h2 className="heading-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Categorias</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Explore nossas categorias de produtos e serviços</p>
              </div>
              <Link href="/categories" className="btn-ghost text-sm hidden sm:inline-flex items-center gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 card-hover hover:border-primary-200 dark:hover:border-primary-800"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-50 to-green-50 dark:from-primary-950 dark:to-green-950 flex items-center justify-center group-hover:from-primary-100 group-hover:to-green-100 dark:group-hover:from-primary-900 dark:group-hover:to-green-900 transition-all duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7 text-primary-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link href="/categories" className="btn-outline text-sm">
                Ver todas as categorias
              </Link>
            </div>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950 relative">
          <div className="absolute inset-0 bg-field-pattern opacity-30" />
          <div className="container-page relative">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Wheat className="h-5 w-5 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Destaques</span>
                </div>
                <h2 className="heading-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Produtos em Destaque</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Os produtos mais populares do marketplace</p>
              </div>
              <Link href="/products" className="btn-ghost text-sm hidden sm:inline-flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover hover:border-primary-200 dark:hover:border-primary-800"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-green-50 dark:from-primary-950 dark:to-green-950 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-primary-300 dark:text-primary-700">
                      <Leaf className="h-16 w-16 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-semibold text-primary-600">
                      Destaque
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {product.supplier && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.supplier}</p>}
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <p className="text-xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/products" className="btn-outline text-sm">
                Ver todos os produtos
              </Link>
            </div>
          </div>
        </section>
      )}

      {topSuppliers.length > 0 && (
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-950 relative">
          <div className="absolute inset-0 bg-leaf-pattern opacity-30" />
          <div className="container-page relative">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Store className="h-5 w-5 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Parceiros</span>
                </div>
                <h2 className="heading-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Fornecedores Top</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Os melhores fornecedores do agronegócio</p>
              </div>
              <Link href="/suppliers" className="btn-ghost text-sm hidden sm:inline-flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSuppliers.map((supplier) => (
                <Link
                  key={supplier.id}
                  href={`/suppliers/${supplier.id}`}
                  className="flex items-center gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 card-hover hover:border-primary-200 dark:hover:border-primary-800 group"
                >
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary-50 to-earth-50 dark:from-primary-950 dark:to-earth-950 flex items-center justify-center">
                    <Store className="h-7 w-7 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{supplier.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {supplier.city || supplier.state ? `${supplier.city}, ${supplier.state}` : 'Localização não informada'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {supplier.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">{supplier.products} produtos</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/suppliers" className="btn-outline text-sm">
                Ver todos os fornecedores
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950 relative">
        <div className="absolute inset-0 bg-field-pattern opacity-20" />
        <div className="container-page relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-2">
              <Wind className="h-5 w-5 text-primary-600" />
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Passos</span>
            </div>
            <h2 className="heading-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Como Funciona</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Em quatro passos simples você encontra o que precisa</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-flex mb-4">
                  <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-green-50 dark:from-primary-900 dark:to-green-950 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 relative">
        <div className="container-page">
          <div className="relative rounded-2xl bg-gradient-to-br from-primary-700 via-primary-800 to-green-900 overflow-hidden px-8 py-12 lg:py-16 text-center">
            <div className="absolute inset-0 bg-field-pattern opacity-10" />
            <div className="absolute top-5 left-5 text-green-300/10 animate-leaf-drift">
              <Leaf className="h-12 w-12" />
            </div>
            <div className="absolute bottom-5 right-5 text-secondary-300/10 animate-sway">
              <Wheat className="h-14 w-14" />
            </div>
            <div className="relative max-w-2xl mx-auto">
              <Sprout className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
              <h2 className="heading-display text-3xl lg:text-4xl font-bold text-white mb-4">
                Comece a Vender no AgroBuscaFácil
              </h2>
              <p className="text-lg text-primary-100/90 mb-8">
                Cadastre sua empresa e alcance milhares de compradores do agronegócio em todo o Brasil.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-secondary-500 to-yellow-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:from-secondary-600 hover:to-yellow-600 transition-all duration-200">
                  Quero Vender
                </Link>
                <Link href="/auth/register" className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200">
                  Quero Comprar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
