import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { productCategories } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Explore todas as categorias de produtos e serviços para o agronegócio no AgroBuscaFácil.',
};

export default function CategoriesPage() {
  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
        <p className="text-sm text-gray-500 mt-1">Explore nossas categorias e encontre o que precisa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productCategories.map((cat) => (
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
