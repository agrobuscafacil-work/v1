'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { openSupplierConversation, sendMessage as sendChatMessage } from '@/lib/chat-api';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';
import {
  Star, MapPin, Phone, MessageCircle, Clock, Package, Truck,
  CheckCircle, Leaf, Mail, Globe, BadgeCheck, X, Send, Wifi, WifiOff, Loader2, CalendarDays, Store,
} from 'lucide-react';

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
  rating: number;
  totalReviews: number;
  totalProducts: number;
  website: string;
  city: string;
  state: string;
  foundedYear: number | null;
  certifications: string[];
  badges: string[];
  featured: boolean;
  businessHours: { day?: string; hours?: string }[] | null;
  deliveryInfo: any;
  online: boolean;
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
}

interface SupplierService {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

interface SupplierReview {
  id: string;
  user: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const DEFAULT_BUSINESS_HOURS = [
  { day: 'Seg - Sex', hours: '08:00 - 18:00' },
  { day: 'Sábado', hours: '08:00 - 12:00' },
  { day: 'Domingo', hours: 'Fechado' },
];

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth();
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [services, setServices] = useState<SupplierService[]>([]);
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [s, p, sv, r] = await Promise.all([
          api.get(`/suppliers/${params.id}`),
          api.get('/products', { params: { supplierId: params.id, limit: 6 } }),
          api.get('/services', { params: { supplierId: params.id, limit: 10 } }),
          api.get('/reviews', { params: { supplierId: params.id, limit: 10 } }),
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
          rating: Number(sup.rating) || 0,
          totalReviews: Number(sup.totalReviews) || 0,
          totalProducts: Number(sup.totalProducts) || 0,
          website: sup.website || '',
          city: address?.city || '',
          state: address?.state || '',
          foundedYear: sup.foundedYear || null,
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
        setProducts(
          productsPayload.map((prod: any) => ({
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: Number(prod.price) || 0,
            image: Array.isArray(prod.images) && prod.images.length > 0 ? PRODUCT_FILE_URL(prod.images[0]) : '',
            rating: Number(prod.rating) || 0,
            reviews: Number(prod.totalReviews) || 0,
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
        setReviews(
          reviewsPayload.map((rev: any) => ({
            id: rev.id,
            user: { name: rev.user?.name || 'Cliente' },
            rating: Number(rev.rating) || 0,
            comment: rev.comment || '',
            createdAt: rev.createdAt,
          })),
        );
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.id]);

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
            {supplier.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={PRODUCT_FILE_URL(supplier.logoUrl)} alt={supplier.companyName} className="h-24 w-24 rounded-2xl object-cover bg-white/20 backdrop-blur" />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Leaf className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{supplier.companyName}</h1>
                {supplier.featured && <BadgeCheck className="h-6 w-6 text-blue-400" />}
              </div>
              <p className="text-primary-100 mb-2">{supplier.tradingName}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-primary-100">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {locationLabel}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {supplier.rating.toFixed(1)} ({supplier.totalReviews})</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {supplier.totalProducts} produtos</span>
                {supplier.foundedYear && (
                  <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Desde {supplier.foundedYear}</span>
                )}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sobre</h2>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos ({products.length})</h2>
              <Link href={`/products?supplier=${supplier.id}`} className="btn-ghost text-sm">Ver todos</Link>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum produto cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="flex gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 card-hover"
                  >
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
                    </div>
                  </Link>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avaliações ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma avaliação ainda.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{review.user.name}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Informações de Contato</h3>
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
              <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" /> {locationLabel}
              </p>
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
                <p className="text-2xl font-bold text-primary-600">{supplier.totalProducts}</p>
                <p className="text-xs text-gray-500">Produtos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{supplier.totalReviews}</p>
                <p className="text-xs text-gray-500">Avaliações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{supplier.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Nota média</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{supplier.foundedYear ?? '—'}</p>
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
    </div>
  );
}
