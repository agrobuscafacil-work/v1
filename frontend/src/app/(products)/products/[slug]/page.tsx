'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, Truck, Shield, Package, Minus, Plus, ShoppingCart, Heart, Share2, MapPin, Leaf, Clock,
  CheckCircle, Phone, MessageCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/use-cart';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brand: string;
  sku: string;
  unit: string;
  minimumQuantity: number;
  price: number;
  comparePrice: number | null;
  discountPercent: number;
  stock: number;
  images: string[];
  tags: string[];
  status: string;
  featured: boolean;
  freeShipping: boolean;
  rating: number;
  totalReviews: number;
  category: { id: string; name: string; slug: string };
  supplier: {
    id: string;
    companyName: string;
    tradingName: string;
    logoUrl: string | null;
    rating: number;
    totalReviews: number;
    totalProducts: number;
    phone: string;
    whatsapp: string;
    city: string;
    state: string;
  };
}

interface ProductReview {
  id: string;
  user: { name: string };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  rating: number;
  totalReviews: number;
  supplierName: string;
  image: string;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const pRes = await api.get(`/products/slug/${params.slug}`);
        const p = pRes.data.data;
        if (cancelled) return;

        const sup = p.supplier || {};
        const address = Array.isArray(sup.addresses) ? sup.addresses[0] : undefined;
        setProduct({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          shortDescription: p.shortDescription || '',
          brand: p.brand || '',
          sku: p.sku || '',
          unit: p.unit || 'un',
          minimumQuantity: Number(p.minimumQuantity) || 1,
          price: Number(p.price) || 0,
          comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
          discountPercent: Number(p.discountPercent) || 0,
          stock: Number(p.stock) || 0,
          images: Array.isArray(p.images) ? p.images : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          status: p.status,
          featured: !!p.featured,
          freeShipping: !!p.freeShipping,
          rating: Number(p.rating) || 0,
          totalReviews: Number(p.totalReviews) || 0,
          category: p.category || { id: '', name: '', slug: '' },
          supplier: {
            id: sup.id || '',
            companyName: sup.companyName || '',
            tradingName: sup.tradingName || '',
            logoUrl: sup.logoUrl || null,
            rating: Number(sup.rating) || 0,
            totalReviews: Number(sup.totalReviews) || 0,
            totalProducts: Number(sup.totalProducts) || 0,
            phone: sup.phone || '',
            whatsapp: sup.whatsapp || '',
            city: address?.city || '',
            state: address?.state || '',
          },
        });

        const [rRes, relRes, favRes] = await Promise.all([
          api.get('/reviews', { params: { productId: p.id, limit: 10 } }),
          api.get('/products', { params: { categoryId: p.categoryId, limit: 4 } }),
          api.get('/favorites/check', { params: { productId: p.id } }).catch(() => null),
        ]);

        if (cancelled) return;

        const reviewsPayload = rRes.data.data?.data ?? [];
        setReviews(
          reviewsPayload.map((rev: any) => ({
            id: rev.id,
            user: { name: rev.user?.name || 'Cliente' },
            rating: Number(rev.rating) || 0,
            title: rev.title || '',
            comment: rev.comment || '',
            createdAt: rev.createdAt,
          })),
        );

        const relPayload = relRes.data.data?.data ?? [];
        setRelated(
          relPayload
            .filter((rp: any) => rp.id !== p.id)
            .map((rp: any) => ({
              id: rp.id,
              slug: rp.slug,
              name: rp.name,
              price: Number(rp.price) || 0,
              rating: Number(rp.rating) || 0,
              totalReviews: Number(rp.totalReviews) || 0,
              supplierName: rp.supplier?.companyName || '',
              image: Array.isArray(rp.images) && rp.images.length > 0 ? PRODUCT_FILE_URL(rp.images[0]) : '',
            })),
        );

        if (favRes && favRes.data.data?.isFavorited) {
          setIsFavorited(true);
          const favList = await api.get('/favorites', { params: { limit: 100 } }).catch(() => null);
          if (!cancelled && favList) {
            const found = (favList.data.data?.data ?? []).find((f: any) => f.productId === p.id);
            if (found) setFavoriteId(found.id);
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="container-page py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container-page py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Produto não encontrado</h1>
        <Link href="/products" className="btn-primary mt-4">Voltar para produtos</Link>
      </div>
    );
  }

  const images = product.images.length > 0
    ? product.images.map((img) => PRODUCT_FILE_URL(img))
    : [];
  const hasSupplier = !!product.supplier.id;
  const locationLabel = product.supplier.city || product.supplier.state
    ? `${product.supplier.city}, ${product.supplier.state}`
    : 'Localização não informada';

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      unit: product.unit,
      image: images[0] || '',
      supplierName: product.supplier.companyName,
      supplierId: product.supplier.id,
    }, quantity);
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Faça login para favoritar produtos');
      return;
    }
    try {
      if (isFavorited) {
        if (!favoriteId) {
          toast.error('Não foi possível localizar o favorito');
          return;
        }
        await api.delete(`/favorites/${favoriteId}`);
      } else {
        const res = await api.post('/favorites', { productId: product.id });
        setFavoriteId(res.data.data?.id || null);
      }
      setIsFavorited(!isFavorited);
      toast(isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch {
      toast.error('Não foi possível atualizar os favoritos');
    }
  };

  return (
    <div className="container-page py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600">Produtos</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[selectedImage] ?? images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <Leaf className="h-24 w-24 text-gray-400" />
            )}
            {product.discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                -{product.discountPercent}%
              </span>
            )}
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-green">{product.status === 'ACTIVE' ? 'Disponível' : 'Indisponível'}</span>
              {product.freeShipping && <span className="badge-blue">Frete Grátis</span>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            {product.brand && <p className="text-sm text-gray-500 mt-1">Marca: {product.brand}{product.sku ? ` | SKU: ${product.sku}` : ''}</p>}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.totalReviews} avaliações)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-primary-600">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {product.comparePrice && (
              <>
                <p className="text-lg text-gray-400 line-through">
                  R$ {product.comparePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="badge-red">Economize R$ {(product.comparePrice - product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.shortDescription}</p>
          )}

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge-gray">{tag}</span>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-outline p-2"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  className="btn-outline p-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">Estoque: {product.stock} {product.unit}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="btn-primary flex-1 gap-2">
                <ShoppingCart className="h-4 w-4" />
                Adicionar ao Carrinho
              </button>
              <button
                onClick={toggleFavorite}
                className={`btn-outline px-3 ${isFavorited ? 'text-red-500 border-red-300' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500' : ''}`} />
              </button>
              <button className="btn-outline px-3">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Truck className="h-4 w-4 text-primary-600" />
              <span>Frete para todo Brasil</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4 text-primary-600" />
              <span>Compra segura</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Package className="h-4 w-4 text-primary-600" />
              <span>Entrega garantida</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 text-primary-600" />
              <span>Mínimo: {product.minimumQuantity} {product.unit}</span>
            </div>
          </div>

          {hasSupplier && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                  {product.supplier.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={PRODUCT_FILE_URL(product.supplier.logoUrl)} alt={product.supplier.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Leaf className="h-6 w-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <Link href={`/suppliers/${product.supplier.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600">
                    {product.supplier.companyName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{product.supplier.rating.toFixed(1)}</span>
                    <span>({product.supplier.totalReviews} avaliações)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" /> {locationLabel}
                </p>
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Package className="h-4 w-4" /> {product.supplier.totalProducts} produtos
                </p>
                <div className="flex gap-2 mt-3">
                  {product.supplier.phone ? (
                    <a href={`tel:${product.supplier.phone}`} className="btn-outline flex-1 gap-2 text-xs">
                      <Phone className="h-4 w-4" /> Ligar
                    </a>
                  ) : null}
                  {product.supplier.whatsapp ? (
                    <a
                      href={`https://wa.me/${product.supplier.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex-1 gap-2 text-xs"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Descrição do Produto</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avaliações ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma avaliação ainda.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{review.user.name}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{review.title}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Especificações</h3>
            <dl className="space-y-3 text-sm">
              {product.brand && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Marca</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{product.brand}</dd>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">SKU</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{product.sku}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Unidade</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{product.unit}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Qtd. Mínima</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{product.minimumQuantity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Estoque</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{product.stock}</dd>
              </div>
              {product.category.name && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Categoria</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{product.category.name}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Formas de Pagamento</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Cartão de Crédito</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Boleto Bancário</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> PIX</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Transferência Bancária</p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover"
              >
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Leaf className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {p.supplierName && <p className="text-xs text-gray-500 truncate">{p.supplierName}</p>}
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{p.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({p.totalReviews})</span>
                  </div>
                  <p className="text-xl font-bold text-primary-600">
                    R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
