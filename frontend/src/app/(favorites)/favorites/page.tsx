'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Leaf, Trash2, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/use-cart';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';

interface FavoriteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  supplier: string;
  supplierId?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/favorites', { params: { limit: 100 } });
        const payload = res.data.data?.data ?? [];
        setFavorites(
          payload
            .filter((f: any) => f.product)
            .map((f: any) => ({
              id: f.id,
              name: f.product.name,
              slug: f.product.slug,
              price: Number(f.product.price) || 0,
              image: Array.isArray(f.product.images) && f.product.images.length > 0 ? PRODUCT_FILE_URL(f.product.images[0]) : '',
              supplier: f.supplier?.companyName || '',
              supplierId: f.supplier?.id || undefined,
              rating: Number(f.product.rating) || 0,
              reviews: Number(f.product.totalReviews) || 0,
              inStock: Number(f.product.stock) > 0 && f.product.status === 'ACTIVE',
            })),
        );
      } catch {
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const removeFavorite = async (id: string, name: string) => {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      toast.success(`${name} removido dos favoritos`);
    } catch {
      toast.error('Não foi possível remover o favorito');
    }
  };

  const addToCart = (product: FavoriteProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      unit: 'un',
      image: product.image,
      supplierName: product.supplier,
      supplierId: product.supplierId,
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
          <p className="text-sm text-gray-500">{isLoading ? 'Carregando...' : `${favorites.length} produto(s) salvos`}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : favorites.length === 0 ? (
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
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <Leaf className="h-12 w-12 text-gray-400" />
                  )}
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
                {product.supplier && <p className="text-xs text-gray-500 truncate">{product.supplier}</p>}
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating.toFixed(1)}</span>
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
