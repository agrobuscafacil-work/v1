import Link from 'next/link';
import type { Metadata } from 'next';
import { Leaf, Sprout, Tractor, Droplets, Bug, Wind, ShoppingBag, Warehouse, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Explore todas as categorias de produtos e serviços para o agronegócio no AgroBuscaFácil.',
};

const categories = [
  { name: 'Insumos', slug: 'insumos', count: 234, description: 'Fertilizantes, corretivos e insumos básicos para sua lavoura.', icon: Sprout },
  { name: 'Máquinas', slug: 'maquinas', count: 156, description: 'Tratores, colheitadeiras, implementos e equipamentos agrícolas.', icon: Tractor },
  { name: 'Sementes', slug: 'sementes', count: 189, description: 'Sementes certificadas de soja, milho, trigo e outras culturas.', icon: Leaf },
  { name: 'Fertilizantes', slug: 'fertilizantes', count: 312, description: 'Fertilizantes NPK, organominerais e foliares.', icon: Droplets },
  { name: 'Defensivos', slug: 'defensivos', count: 178, description: 'Herbicidas, inseticidas, fungicidas e outros defensivos.', icon: Bug },
  { name: 'Irrigação', slug: 'irrigacao', count: 95, description: 'Sistemas de irrigação, bombas, tubulações e acessórios.', icon: Wind },
  { name: 'Pecuária', slug: 'pecuaria', count: 267, description: 'Produtos para pecuária, nutrição animal e veterinária.', icon: ShoppingBag },
  { name: 'Armazenagem', slug: 'armazenagem', count: 143, description: 'Silos, secadores, balanças e equipamentos de armazenagem.', icon: Warehouse },
  { name: 'Serviços', slug: 'servicos', count: 89, description: 'Serviços especializados como análise de solo e consultoria.', icon: Leaf },
  { name: 'Logística', slug: 'logistica', count: 67, description: 'Transporte, frete e logística especializada para o agro.', icon: Sprout },
];

export default function CategoriesPage() {
  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
        <p className="text-sm text-gray-500 mt-1">Explore nossas categorias e encontre o que precisa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group flex items-start gap-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 card-hover"
          >
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
              <cat.icon className="h-7 w-7 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </h2>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              <span className="inline-block mt-2 text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full">
                {cat.count} produtos
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
