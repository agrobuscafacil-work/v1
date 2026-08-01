'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Leaf, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/use-cart';

interface FavoriteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  supplier: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  addedAt: string;
}

const MOCK_FAVORITES: FavoriteProduct[] = [
  { id: '1', name: 'Trator Agrícola 4x4 120cv', slug: 'trator-agricola-4x4', price: 249900, supplier: 'Máquinas Agrícolas LTDA', rating: 4.8, reviews: 42, inStock: true, addedAt: '2024-03-20' },
  { id: '2', name: 'Fertilizante NPK 10-10-10 50kg', slug: 'fertilizante-npk', price: 189.90, supplier: 'AgroQuímica Brasil', rating: 4.6, reviews: 128, inStock: true, addedAt: '2024-03-18' },
  { id: '3', name: 'Semente de Soja RR 40kg', slug: 'semente-soja-rr', price: 349.90, supplier: 'Sementes Selecta', rating: 4.9, reviews: 87, inStock: false, addedAt: '2024-03-15' },
  { id: '4', name: 'Sistema de Irrigação por Gotejo', slug: 'irrigacao-gotejo', price: 15990, supplier: 'TechIrriga', rating: 4.7, reviews: 56, inStock: true, addedAt: '2024-03-10' },
  { id: '5', name: 'Herbicida Glifosato 5L', slug: 'herbicida-glifosato', price: 89.90, supplier: 'Defensivos AgroFort', rating: 4.5, reviews: 203, inStock: true, addedAt: '2024-03-08' },
  { id: '6', name: 'Arado de Aiveca 4 Discos', slug: 'arado-aiveca', price: 24990, supplier: 'Máquinas Agrícolas LTDA', rating: 4.4, reviews: 35, inStock: true, addedAt: '2024-03-05' },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(MOCK_FAVORITES);

  const removeFavorite = (id: string, name: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success(`${name} removido dos favoritos`);
  };

  const { addItem } = useCart();

  const addToCart = (product: FavoriteProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      unit: 'un',
      image: '',
      supplierName: product.supplier,
    });
  };

  return (
    <div className="container-page py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950">
          <Heart className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Favoritos</h1>
          <p className="text-sm text-gray-500">{favorites.length} produto(s) salvos</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-500 mb-6">Salve produtos para encontrá-los facilmente depois.</p>
          <Link href="/products" className="btn-primary gap-2">
            <ArrowLeft className="h-4 w-4" /> Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="group relative rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                  <Leaf className="h-12 w-12 text-gray-400" />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="badge-red text-sm">Indisponível</span>
                    </div>
                  )}
                </div>
              </Link>

              <button
                onClick={() => removeFavorite(product.id, product.name)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>

              <div className="p-4 space-y-2">
                <p className="text-xs text-gray-500">{product.supplier}</p>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <p className="text-lg font-bold text-primary-600">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className="btn-primary w-full text-sm gap-2 mt-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
