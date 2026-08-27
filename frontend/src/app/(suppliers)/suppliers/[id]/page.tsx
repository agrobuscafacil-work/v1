'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/use-auth';
import { openSupplierConversation, sendMessage as sendChatMessage } from '@/lib/chat-api';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';
import { useCart } from '@/hooks/use-cart';
import {
  Star, MapPin, Phone, MessageCircle, Clock, Package, Truck,
  CheckCircle, Leaf, Mail, Globe, BadgeCheck, X, Send, Wifi, WifiOff, Loader2, CalendarDays, Store, Pencil, Trash2, ShoppingCart, ThumbsUp,
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface SupplierInfo {
  id: string;
  companyName: string;
  tradingName: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  sellerRating: number;
  sellerTotalReviews: number;
  totalProducts: number;
  website: string;
  city: string;
  state: string;
  foundedYear: number | null;
  foundationDate: string | null;
  certifications: string[];
  badges: string[];
  featured: boolean;
  businessHours: { day?: string; hours?: string }[] | null;
  deliveryInfo: any;
  online: boolean;
  address?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  autoReplyMessage?: string | null;
  welcomeMessage?: string | null;
}

interface SupplierProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  unit: string;
  saleMode: 'DIRECT' | 'CONTACT_ONLY';
  productCode?: string;
}

interface SupplierService {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

interface SupplierReview {
  id: string;
  userId?: string;
  user: { id?: string; name: string };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  helpfulCount: number;
  liked?: boolean;
}

const DEFAULT_BUSINESS_HOURS = [
  { day: 'Seg - Sex', hours: '08:00 - 18:00' },
  { day: 'Sábado', hours: '08:00 - 12:00' },
  { day: 'Domingo', hours: 'Fechado' },
];

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [services, setServices] = useState<SupplierService[]>([]);
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [sellerReviews, setSellerReviews] = useState<SupplierReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingReview, setEditingReview] = useState<SupplierReview | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editRatingHover, setEditRatingHover] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SupplierReview | null>(null);
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [editingSellerReview, setEditingSellerReview] = useState<any | null>(null);
  const [editSellerRating, setEditSellerRating] = useState(0);
  const [editSellerRatingHover, setEditSellerRatingHover] = useState(0);
  const [editSellerComment, setEditSellerComment] = useState('');
  const [editSellerTitle, setEditSellerTitle] = useState('');
  const [submittingSellerEdit, setSubmittingSellerEdit] = useState(false);
  const [expandedSellerReviews, setExpandedSellerReviews] = useState<Record<string, boolean>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatSent, setChatSent] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ text: string; sentByMe: boolean }[]>([]);
  const [chatConvId, setChatConvId] = useState('');

  async function handleChatSend() {
    if (!chatMessage.trim() || chatSending || !supplier) return;
    setChatSending(true);
    const text = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [
      ...prev,
      { text: 'Olá! Como podemos ajudar?', sentByMe: false },
      { text, sentByMe: true },
    ]);
    try {
      if (!chatConvId) {
        const conv = await openSupplierConversation(supplier.id, user?.id ?? '', 'Chat - ' + supplier.companyName);
        setChatConvId(conv.id);
      }
      await sendChatMessage(chatConvId, text);
      setChatSent(true);
    } catch {
      toast.error('Erro ao enviar mensagem.');
    } finally {
      setChatSending(false);
    }
  }

  const startEditReview = (review: SupplierReview) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditTitle(review.title || '');
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    if (editRating < 1) { toast.error('Selecione a quantidade de estrelas'); return; }
    if (!editComment.trim()) { toast.error('Escreva um comentário'); return; }
    setSubmittingEdit(true);
    try {
      const res = await api.put(`/reviews/${editingReview.id}`, { rating: editRating, comment: editComment.trim(), title: editTitle });
      const updated = res.data.data;
      toast.success('Avaliação atualizada!');
      setReviews((prev) => prev.map((r) => r.id === editingReview.id ? { ...r, rating: Number(updated.rating) || editRating, comment: updated.comment || editComment.trim(), title: updated.title || '' } : r));
      setEditingReview(null); setEditRating(0); setEditComment(''); setEditTitle('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao atualizar';
      toast.error(Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally { setSubmittingEdit(false); }
  };

  const handleDeleteReview = async (review: SupplierReview) => {
    setDeletingId(review.id);
    try {
      await api.delete(`/reviews/${review.id}`);
      toast.success('Avaliação removida');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      if (editingReview?.id === review.id) { setEditingReview(null); setEditRating(0); setEditComment(''); setEditTitle(''); }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao remover');
    } finally { setDeletingId(null); setConfirmDelete(null); }
  };

  const startEditSellerReview = (review: any) => {
    setEditingSellerReview(review);
    setEditSellerRating(review.rating);
    setEditSellerComment(review.comment || '');
    setEditSellerTitle(review.title || '');
  };

  const handleUpdateSellerReview = async () => {
    if (!editingSellerReview) return;
    if (editSellerRating < 1) { toast.error('Selecione a quantidade de estrelas'); return; }
    if (!editSellerComment.trim()) { toast.error('Escreva um comentário'); return; }
    setSubmittingSellerEdit(true);
    try {
      const res = await api.put(`/reviews/seller/${editingSellerReview.id}`, { rating: editSellerRating, comment: editSellerComment.trim(), title: editSellerTitle });
      const updated = res.data.data;
      toast.success('Avaliação do fornecedor atualizada!');
      setSellerReviews((prev) => prev.map((r) => r.id === editingSellerReview.id ? { ...r, rating: Number(updated.rating) || editSellerRating, comment: updated.comment || editSellerComment.trim(), title: updated.title || '' } : r));
      setEditingSellerReview(null); setEditSellerRating(0); setEditSellerComment(''); setEditSellerTitle('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao atualizar';
      toast.error(Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally { setSubmittingSellerEdit(false); }
  };

  const handleDeleteSellerReview = async (review: any) => {
    setDeletingId(review.id);
    try {
      await api.delete(`/reviews/seller/${review.id}`);
      toast.success('Avaliação do fornecedor removida');
      setSellerReviews((prev) => prev.filter((r: any) => r.id !== review.id));
      if (editingSellerReview?.id === review.id) { setEditingSellerReview(null); setEditSellerRating(0); setEditSellerComment(''); setEditSellerTitle(''); }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao remover');
    } finally { setDeletingId(null); setConfirmDelete(null); }
  };

  const handleLikeReview = async (review: SupplierReview, isSellerReview = false) => {
    if (!user?.id) {
      toast.error('Faça login para curtir avaliações');
      return;
    }
    setLikingReviewId(review.id);
    const basePath = isSellerReview ? '/reviews/seller' : '/reviews';
    try {
      const res = review.liked
        ? await api.delete(`${basePath}/${review.id}/like`)
        : await api.post(`${basePath}/${review.id}/like`);
      const result = res.data.data;
      const update = (item: SupplierReview) => item.id === review.id
        ? { ...item, liked: !!result.liked, helpfulCount: Number(result.helpfulCount) || 0 }
        : item;
      if (isSellerReview) setSellerReviews((prev) => prev.map(update));
      else setReviews((prev) => prev.map(update));
    } catch (err: any) {
      if (err?.response?.status === 401) toast.error('Faça login para curtir avaliações');
      else toast.error('Não foi possível atualizar a curtida');
    } finally {
      setLikingReviewId(null);
    }
  };

  const toggleReview = (id: string) => setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSellerReview = (id: string) => setExpandedSellerReviews((prev) => ({ ...prev, [id]: !prev[id] }));

  const sortedReviews = [...reviews].sort((a: any, b: any) => {
    const aIsMine = user?.id && a.userId === user.id;
    const bIsMine = user?.id && b.userId === user.id;
    if (aIsMine && !bIsMine) return -1;
    if (!aIsMine && bIsMine) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedSellerReviews = [...sellerReviews].sort((a: any, b: any) => {
    const aIsMine = user?.id && a.userId === user.id;
    const bIsMine = user?.id && b.userId === user.id;
    if (aIsMine && !bIsMine) return -1;
    if (!aIsMine && bIsMine) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatFoundationDate = (date: string | null) => date ? date.slice(0, 4) : null;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [s, p, sv, r, sr] = await Promise.all([
          api.get(`/suppliers/${id}`),
          api.get('/products', { params: { supplierId: id, limit: 6 } }),
          api.get('/services', { params: { supplierId: id, limit: 10 } }),
          api.get('/reviews', { params: { supplierId: id, limit: 10 } }),
          api.get('/reviews/seller', { params: { supplierId: id, limit: 10 } }).catch(() => ({ data: { data: { data: [] } } })),
        ]);

        const sup = s.data.data;
        const address = Array.isArray(sup.addresses) ? sup.addresses[0] : undefined;
        setSupplier({
          id: sup.id,
          companyName: sup.companyName,
          tradingName: sup.tradingName || '',
          description: sup.description || '',
          logoUrl: sup.logoUrl || null,
          bannerUrl: sup.bannerUrl || null,
          phone: sup.phone || '',
          whatsapp: sup.whatsapp || '',
          email: sup.email || '',
          sellerRating: Number(sup.sellerRating) || 0,
          sellerTotalReviews: Number(sup.sellerTotalReviews) || 0,
          totalProducts: Number(sup.totalProducts) || 0,
          website: sup.website || '',
          city: address?.city || '',
          state: address?.state || '',
          address: address ? { ...address, latitude: address.latitude == null ? null : Number(address.latitude), longitude: address.longitude == null ? null : Number(address.longitude) } : undefined,
          foundedYear: sup.foundedYear || null,
          foundationDate: sup.foundationDate || null,
          certifications: Array.isArray(sup.certifications) ? sup.certifications : [],
          badges: Array.isArray(sup.badges) ? sup.badges : [],
          featured: !!sup.featured,
          businessHours: Array.isArray(sup.businessHours) ? sup.businessHours : null,
          deliveryInfo: sup.deliveryInfo,
          online: sup.chatSettings?.online ?? true,
          autoReplyMessage: sup.chatSettings?.autoReplyMessage ?? null,
          welcomeMessage: sup.chatSettings?.welcomeMessage ?? null,
        });
        setIsOnline(sup.chatSettings?.online ?? true);

        const productsPayload = p.data.data?.data ?? [];
        setProductCount(Number(p.data.data?.meta?.total ?? sup.totalProducts ?? 0));
        setProducts(
          productsPayload.map((prod: any) => ({
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: Number(prod.price) || 0,
            image: Array.isArray(prod.images) && prod.images.length > 0 ? PRODUCT_FILE_URL(prod.images[0]) : '',
            rating: Number(prod.rating) || 0,
            reviews: Number(prod.totalReviews) || 0,
            unit: prod.unit || 'un',
            saleMode: prod.saleMode || 'DIRECT',
                      productCode: prod.productCode?.code || '',
          })),
        );

        const servicesPayload = sv.data.data?.data ?? [];
        setServices(
          servicesPayload.map((serv: any) => ({
            id: serv.id,
            name: serv.name,
            description: serv.description || '',
            price: serv.price != null ? Number(serv.price) : null,
          })),
        );

        const reviewsPayload = r.data.data?.data ?? [];
        const reviewsWithLikeStatus = await Promise.all(reviewsPayload.map(async (rev: any) => {
          let liked = false;
          if (user?.id) {
            liked = !!(await api.get(`/reviews/${rev.id}/like/status`).catch(() => null))?.data?.data?.liked;
          }
          return {
            id: rev.id,
            userId: rev.user?.id,
            user: { id: rev.user?.id, name: rev.user?.name || 'Cliente' },
            rating: Number(rev.rating) || 0,
            title: rev.title || '',
            comment: rev.comment || '',
            createdAt: rev.createdAt,
            verifiedPurchase: !!rev.verifiedPurchase,
            helpfulCount: Number(rev.helpfulCount) || 0,
            liked,
          };
        }));
        setReviews(reviewsWithLikeStatus);

        const sellerRaw: any = (sr as any)?.data?.data;
        const sellerReviewsPayload = Array.isArray(sellerRaw) ? sellerRaw : Array.isArray(sellerRaw?.data) ? sellerRaw.data : [];
        const sellerReviewsWithLikeStatus = await Promise.all((sellerReviewsPayload as any[]).map(async (rev: any) => {
          let liked = false;
          if (user?.id) {
            liked = !!(await api.get(`/reviews/seller/${rev.id}/like/status`).catch(() => null))?.data?.data?.liked;
          }
          return {
            id: rev.id,
            userId: rev.user?.id,
            user: { id: rev.user?.id, name: rev.user?.name || 'Cliente' },
            rating: Number(rev.rating) || 0,
            title: rev.title || '',
            comment: rev.comment || '',
            createdAt: rev.createdAt,
            verifiedPurchase: !!rev.verifiedPurchase,
            helpfulCount: Number(rev.helpfulCount) || 0,
            liked,
          };
        }));
        setSellerReviews(sellerReviewsWithLikeStatus);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container-page py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (notFound || !supplier) {
    return (
      <div className="container-page py-16 text-center">
        <Store className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fornecedor não encontrado</h1>
        <Link href="/suppliers" className="btn-primary mt-4">Voltar para fornecedores</Link>
      </div>
    );
  }

  const workingHours = supplier.businessHours && supplier.businessHours.length > 0
    ? supplier.businessHours
    : DEFAULT_BUSINESS_HOURS;
  const locationLabel = supplier.city || supplier.state
    ? `${supplier.city}, ${supplier.state}`
    : 'Localização não informada';

  return (
    <div className="container-page py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/suppliers" className="hover:text-primary-600">Fornecedores</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{supplier.companyName}</span>
      </nav>

      <div className="relative rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden mb-8">
        {supplier.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={PRODUCT_FILE_URL(supplier.bannerUrl)} alt={supplier.companyName} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-8 py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="flex flex-col items-center gap-2 shrink-0">
              {supplier.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={PRODUCT_FILE_URL(supplier.logoUrl)} alt={supplier.companyName} className="h-24 w-24 rounded-2xl object-cover bg-white/20 backdrop-blur" />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Leaf className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{supplier.companyName}</h1>
                {supplier.featured && <BadgeCheck className="h-6 w-6 text-blue-400" />}
              </div>
              <p className="text-primary-100 mb-2">{supplier.tradingName}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-primary-100">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {locationLabel}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {supplier.sellerRating.toFixed(1)} ({supplier.sellerTotalReviews})</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {productCount} produtos</span>
                {formatFoundationDate(supplier.foundationDate) && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Desde {formatFoundationDate(supplier.foundationDate)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {supplier.badges.map((badge) => (
          <span key={badge} className="badge-yellow">{badge}</span>
        ))}
        {supplier.certifications.map((cert) => (
          <span key={cert} className="badge-green"><CheckCircle className="h-3 w-3 mr-1" />{cert}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sobre a Loja</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{supplier.description || 'Fornecedor parceiro da AgroBusca Fácil.'}</p>
            {supplier.deliveryInfo && (
              <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Truck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{typeof supplier.deliveryInfo === 'string' ? supplier.deliveryInfo : JSON.stringify(supplier.deliveryInfo)}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos ({productCount})</h2>
              <Link href={`/products?supplierId=${encodeURIComponent(supplier.id)}`} className="btn-ghost text-sm">Ver todos</Link>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum produto cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 card-hover"
                  >
                    <Link href={`/products/${product.slug}`} className="flex gap-4 flex-1 min-w-0">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover bg-gray-100 dark:bg-gray-800" />
                      ) : (
                        <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                        <p className="text-lg font-bold text-primary-600 mt-1">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                                              {product.productCode && <p className="text-xs text-gray-500">Código: {product.productCode}</p>}
                      </div>
                    </Link>
                    {product.saleMode === 'CONTACT_ONLY' ? <div className="flex flex-col gap-2 self-center shrink-0">
                      {supplier.whatsapp && <a href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2 text-xs px-3 py-2"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
                      <Link href={`/suppliers/${supplier.id}`} className="btn-outline gap-2 text-xs px-3 py-2"><MessageCircle className="h-4 w-4" /> Chat Online</Link>
                    </div> : <button
                      onClick={() => {
                        if (!supplier) return;
                        addItem({
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          unit: product.unit,
                          image: product.image,
                          supplierName: supplier.companyName,
                          supplierId: supplier.id,
                        }, 1);
                        router.push('/checkout');
                      }}
                      className="btn-primary self-center gap-2 text-xs px-3 py-2 shrink-0"
                    >
                      <ShoppingCart className="h-4 w-4" /> Comprar
                    </button>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {services.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Serviços</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    {service.price != null && (
                      <p className="text-lg font-bold text-primary-600 mt-2">
                        R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avaliações do Fornecedor ({sellerReviews.length})</h2>
            {editingSellerReview && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-800">Editando avaliação do fornecedor</p>
                  <button onClick={() => { setEditingSellerReview(null); setEditSellerRating(0); setEditSellerComment(''); setEditSellerTitle(''); }} className="text-xs text-gray-500 hover:text-primary-600">Cancelar</button>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const star = i + 1;
                    const filled = star <= (editSellerRatingHover || editSellerRating);
                    return <button key={star} type="button" onClick={() => setEditSellerRating(star)} onMouseEnter={() => setEditSellerRatingHover(star)} onMouseLeave={() => setEditSellerRatingHover(0)} className="p-0.5"><Star className={`h-6 w-6 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>;
                  })}
                  <span className="ml-2 text-sm font-medium">{editSellerRating.toFixed(1)}</span>
                </div>
                <input value={editSellerTitle} onChange={(e) => setEditSellerTitle(e.target.value)} placeholder="Título (opcional)" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <textarea value={editSellerComment} onChange={(e) => setEditSellerComment(e.target.value)} rows={3} placeholder="Seu comentário..." className="w-full rounded-lg border px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleUpdateSellerReview} disabled={submittingSellerEdit} className="btn-primary gap-2">{submittingSellerEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Salvar</button>
                  <button onClick={() => setConfirmDelete(editingSellerReview as any)} className="btn-outline gap-2 text-red-600 border-red-200"><Trash2 className="h-4 w-4" /> Remover</button>
                </div>
              </div>
            )}
            {sellerReviews.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma avaliação do fornecedor ainda.</p>
            ) : (
              <div className="space-y-4">
                {sortedSellerReviews.map((review: any) => {
                  const expanded = !!expandedSellerReviews[review.id];
                  const isMine = user?.id && review.userId === user.id;
                  return (
                  <div key={review.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-bold text-green-700">{review.user.name.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">{review.user.name} {isMine && <span className="text-xs text-primary-600 bg-primary-50 rounded-full px-2 py-0.5">Você</span>} {review.verifiedPurchase && <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5"><CheckCircle className="h-3 w-3" /> Verificada</span>}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}
                        <span className="ml-1 text-xs font-medium">{review.rating.toFixed(1)}</span>
                      </div>
                      {isMine && (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => startEditSellerReview(review)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100" title="Editar"><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setConfirmDelete(review as any)} disabled={deletingId === review.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" title="Remover">{deletingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                        </div>
                      )}
                      <button type="button" onClick={() => toggleSellerReview(review.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100"><span className="text-xs">{expanded ? '▲' : '▼'}</span></button>
                    </div>
                    {(expanded || review.title) && review.title && <p className="mt-2 text-sm font-semibold">{review.title}</p>}
                    {expanded && review.comment && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 border-t pt-2">{review.comment}</p>}
                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={() => handleLikeReview(review, true)} disabled={likingReviewId === review.id} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${review.liked ? 'text-primary-700 bg-primary-50 dark:bg-primary-900/40' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`} aria-label={review.liked ? 'Remover curtida' : 'Curtir avaliação'}>
                        {likingReviewId === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className={`h-3.5 w-3.5 ${review.liked ? 'fill-current' : ''}`} />}
                        {review.helpfulCount}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contato</h3>
            <div className="space-y-3 text-sm">
              {supplier.phone ? (
                <a href={`tel:${supplier.phone}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  <Phone className="h-4 w-4" /> {supplier.phone}
                </a>
              ) : null}
              {supplier.email ? (
                <a href={`mailto:${supplier.email}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  <Mail className="h-4 w-4" /> {supplier.email}
                </a>
              ) : null}
              {supplier.website ? (
                <a href={`https://${supplier.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  <Globe className="h-4 w-4" /> {supplier.website}
                </a>
              ) : null}
            </div>
            <div className="mt-4 space-y-2">
              {supplier.phone ? (
                <a href={`tel:${supplier.phone}`} className="btn-outline w-full gap-2">
                  <Phone className="h-4 w-4" /> Ligar
                </a>
              ) : null}
              {supplier.whatsapp ? (
                <a href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-primary w-full gap-2">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              ) : null}
              <button onClick={() => setIsChatOpen(true)} className="btn-outline w-full gap-2">
                <MessageCircle className="h-4 w-4" /> Chat Online
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Endereço e localização</h3>
            {supplier.address ? (
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary-600" />
                  <span>{supplier.address.street}, {supplier.address.number}{supplier.address.complement ? `, ${supplier.address.complement}` : ''}<br />
                    {supplier.address.neighborhood}, {supplier.address.city} - {supplier.address.state}<br />
                    CEP {supplier.address.zipCode}</span>
                </p>
                {supplier.address.latitude != null && supplier.address.longitude != null && (
                  <a href={`https://www.google.com/maps?q=${supplier.address.latitude},${supplier.address.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-primary-200 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-950" title="Abrir localização da loja no mapa">
                    <MapPin className="h-3.5 w-3.5" /> Ver no mapa
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Endereço da loja não informado.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Horários de Funcionamento</h3>
            <div className="space-y-2 text-sm">
              {workingHours.map((wh, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{wh.day || 'Horário'}</span>
                  <span className={`font-medium ${wh.hours === 'Fechado' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {wh.hours || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{productCount}</p>
                <p className="text-xs text-gray-500">Produtos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{supplier.sellerTotalReviews}</p>
                <p className="text-xs text-gray-500">Avaliações do fornecedor</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{supplier.sellerRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Nota do fornecedor</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{formatFoundationDate(supplier.foundationDate) ?? '—'}</p>
                <p className="text-xs text-gray-500">Fundação</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatOpen(false)} />
          <div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat com {supplier.companyName}</h2>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            {!isAuthenticated ? (
              <div className="space-y-4 text-center py-4">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Faça login para iniciar o chat com o fornecedor.</p>
                <Link href="/auth/login" className="btn-primary w-full">Entrar</Link>
              </div>
            ) : chatSent ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-900 dark:text-white font-medium">Mensagem enviada!</p>
                <p className="text-sm text-gray-500 mt-1">O fornecedor responderá em breve.</p>
                <button onClick={() => setIsChatOpen(false)} className="btn-primary mt-4">Fechar</button>
              </div>
            ) : isOnline ? (
              <div className="flex flex-col h-[400px]">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatHistory.length === 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-xs rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Olá! Como podemos ajudar?</p>
                      </div>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={'flex ' + (msg.sentByMe ? 'justify-end' : 'justify-start')}>
                      <div className={'max-w-xs rounded-lg p-3 ' + (msg.sentByMe ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300')}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                  />
                  <button onClick={handleChatSend} disabled={!chatMessage.trim() || chatSending} className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Fornecedor offline. Deixe sua mensagem e ele receberá por email.</p>
                </div>
                <div>
                  <label className="label-field">Mensagem</label>
                  <textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} className="input-field min-h-[100px]" placeholder="Digite sua mensagem..." />
                </div>
                <button
                  onClick={handleChatSend}
                  disabled={!chatMessage.trim() || chatSending}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  Enviar Mensagem
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} title="Remover avaliação" message={`Deseja remover a avaliação de ${confirmDelete?.user?.name ?? 'este cliente'}?`} confirmLabel="Remover" danger loading={deletingId === confirmDelete?.id} onConfirm={() => {
        if (!confirmDelete) return;
        const isSeller = sellerReviews.some((r: any) => r.id === confirmDelete.id);
        if (isSeller) handleDeleteSellerReview(confirmDelete as any);
        else handleDeleteReview(confirmDelete);
      }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

