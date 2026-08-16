'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Star, Truck, Shield, Package, Minus, Plus, ShoppingCart, Heart, Share2, MapPin, Leaf, Clock,
  CheckCircle, Phone, MessageCircle, Loader2, ChevronDown, ChevronUp, Pencil, Trash2,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';
import ConfirmDialog from '@/components/ui/confirm-dialog';

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
  userId?: string;
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

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [confirmDeleteReview, setConfirmDeleteReview] = useState<ProductReview | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const pRes = await api.get(`/products/slug/${slug}`);
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
            userId: rev.user?.id,
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
  }, [slug]);

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
      toast.success(isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error('Faça login para favoritar produtos');
        return;
      }
      toast.error('Não foi possível atualizar os favoritos');
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para avaliar este produto');
      return;
    }
    if (reviewRating < 1) {
      toast.error('Selecione a quantidade de estrelas');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Escreva um pequeno comentário sobre o produto');
      return;
    }
    if (!product.supplier.id) {
      toast.error('Fornecedor não identificado');
      return;
    }
    setSubmittingReview(true);
    try {
      if (editingReview) {
        const res = await api.put(`/reviews/${editingReview.id}`, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        const updated = res.data.data;
        toast.success('Avaliação atualizada!');
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id
              ? {
                  ...r,
                  rating: Number(updated.rating) || reviewRating,
                  comment: updated.comment || reviewComment.trim(),
                  title: updated.title || '',
                }
              : r
          )
        );
        setProduct((prev) => {
          if (!prev) return prev;
          const delta = reviewRating - editingReview.rating;
          const rating =
            prev.totalReviews > 0
              ? (prev.rating * prev.totalReviews + delta) / prev.totalReviews
              : reviewRating;
          return { ...prev, rating };
        });
        setEditingReview(null);
      } else {
        const mine = reviews.find((r) => user?.id && r.userId === user.id);
        if (mine) {
          toast.error('Você já avaliou este produto. Para alterar sua avaliação, clique em "Editar avaliação".');
          return;
        }
        const res = await api.post('/reviews', {
          supplierId: product.supplier.id,
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        const created = res.data.data;
        toast.success('Avaliação publicada! Obrigado pelo seu feedback.');
        const existing = reviews.find(
          (r) => r.id === created.id || (user?.id && r.userId === user.id)
        );
        if (existing) {
          setReviews((prev) =>
            prev.map((r) =>
              r.id === existing.id
                ? {
                    ...r,
                    rating: Number(created.rating) || reviewRating,
                    comment: created.comment || reviewComment.trim(),
                    title: created.title || '',
                  }
                : r
            )
          );
          setProduct((prev) => {
            if (!prev) return prev;
            const delta = reviewRating - existing.rating;
            const rating =
              prev.totalReviews > 0
                ? (prev.rating * prev.totalReviews + delta) / prev.totalReviews
                : reviewRating;
            return { ...prev, rating };
          });
        } else {
          const myReview: ProductReview = {
            id: created.id,
            userId: user?.id,
            user: { name: created.user?.name || user?.name || 'Você' },
            rating: Number(created.rating) || reviewRating,
            title: created.title || '',
            comment: created.comment || reviewComment.trim(),
            createdAt: created.createdAt,
          };
          setReviews((prev) => [myReview, ...prev]);
          setProduct((prev) => {
            if (!prev) return prev;
            const total = prev.totalReviews + 1;
            const rating = (prev.rating * prev.totalReviews + reviewRating) / total;
            return { ...prev, rating, totalReviews: total };
          });
        }
      }
      setReviewRating(0);
      setReviewComment('');
      setReviewHover(0);
      setShowReviewForm(false);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error('Faça login para avaliar este produto');
      } else {
        const msg =
          err?.response?.data?.message ||
          'Erro ao enviar avaliação. Tente novamente.';
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const startEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setShowReviewForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReview = async (review: ProductReview) => {
    setDeletingReviewId(review.id);
    try {
      await api.delete(`/reviews/${review.id}`);
      toast.success('Avaliação apagada.');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      setProduct((prev) => {
        if (!prev || prev.totalReviews <= 1) return prev ? { ...prev, rating: 0, totalReviews: 0 } : prev;
        const total = prev.totalReviews - 1;
        const rating = (prev.rating * prev.totalReviews - review.rating) / total;
        return { ...prev, rating, totalReviews: total };
      });
      if (editingReview?.id === review.id) {
        setEditingReview(null);
        setReviewRating(0);
        setReviewComment('');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Erro ao apagar avaliação. Tente novamente.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setDeletingReviewId(null);
      setConfirmDeleteReview(null);
    }
  };

  const toggleReviewForm = () => {
    if (editingReview) {
      setEditingReview(null);
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      return;
    }
    const mine = reviews.find((r) => user?.id && r.userId === user.id);
    if (mine) {
      startEditReview(mine);
    } else {
      setShowReviewForm((v) => !v);
    }
  };

  const toggleReview = (id: string) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Avaliações ({reviews.length})</h2>
              <button
                type="button"
                onClick={toggleReviewForm}
                className="btn-primary gap-2 text-sm"
              >
                {showReviewForm || editingReview ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Fechar
                  </>
                ) : reviews.some((r) => user?.id && r.userId === user.id) ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    Editar avaliação
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    Avaliar
                  </>
                )}
              </button>
            </div>

            {showReviewForm && (
              <div className="mb-8 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {editingReview ? 'Editar sua avaliação' : 'Avaliar este produto'}
                  </h3>
                  {editingReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReview(null);
                        setReviewRating(0);
                        setReviewComment('');
                      }}
                      className="text-xs text-gray-500 hover:text-primary-600"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Dê sua nota de 0.0 a 5.0 e conte sua experiência.</p>

                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const star = i + 1;
                    const filled = star <= (reviewHover || reviewRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                        aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            filled
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {reviewRating > 0 ? reviewRating.toFixed(1) : '0.0'}
                  </span>
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Escreva um pequeno comentário sobre o produto..."
                  maxLength={1000}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="btn-primary mt-3 gap-2"
                >
                  {submittingReview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                  {editingReview ? 'Salvar alterações' : 'Enviar avaliação'}
                </button>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const expanded = !!expandedReviews[review.id];
                  const isMine = isAuthenticated && user?.id && review.userId === user.id;
                  return (
                    <div key={review.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                          {review.user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {review.user.name}
                            {isMine && (
                              <span className="ml-2 text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/50 rounded-full px-2 py-0.5">Você</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-0.5 ml-auto">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                          ))}
                          <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        {isMine && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditReview(review)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              aria-label="Editar avaliação"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteReview(review)}
                              disabled={deletingReviewId === review.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                              aria-label="Apagar avaliação"
                              title="Apagar"
                            >
                              {deletingReviewId === review.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleReview(review.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label={expanded ? 'Esconder comentário' : 'Mostrar comentário'}
                        >
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {expanded && review.comment && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
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
      <ConfirmDialog
        open={!!confirmDeleteReview}
        title="Apagar avaliação"
        message="Tem certeza que deseja apagar sua avaliação? Esta ação não pode ser desfeita."
        confirmLabel="Apagar"
        danger
        loading={deletingReviewId === confirmDeleteReview?.id}
        onConfirm={() => confirmDeleteReview && handleDeleteReview(confirmDeleteReview)}
        onCancel={() => setConfirmDeleteReview(null)}
      />
    </div>
  );
}
