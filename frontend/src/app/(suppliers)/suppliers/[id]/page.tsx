'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getChatSettings } from '@/lib/chat-settings';
import { addPendingMessage } from '@/lib/chat-store';
import {
  Star, MapPin, Phone, MessageCircle, Clock, Package, Truck,
  Shield, CheckCircle, Leaf, Mail, Globe, BadgeCheck, X, Send, Wifi, WifiOff,
} from 'lucide-react';

const MOCK_SUPPLIER = {
  id: '1',
  companyName: 'AgroQuímica Brasil',
  tradingName: 'AgroQuímica Brasil LTDA',
  description: 'Referência nacional em insumos agrícolas, com mais de 20 anos de experiência no mercado. Oferecemos produtos de alta qualidade com preços competitivos e entrega para todo o Brasil.',
  logoUrl: null,
  bannerUrl: null,
  phone: '(16) 3636-0000',
  whatsapp: '5516999999999',
  email: 'contato@agroquimica.com.br',
  rating: 4.8,
  totalReviews: 256,
  totalProducts: 342,
  totalOrders: 15890,
  totalSales: 45000000,
  website: 'www.agroquimica.com.br',
  city: 'Ribeirão Preto',
  state: 'SP',
  certifications: ['ISO 9001', 'Orgânico Brasil', 'Boas Práticas Agrícolas'],
  badges: ['Premium', 'Verificado', 'Top Fornecedor'],
  featured: true,
  workingHours: [
    { day: 'Seg - Sex', hours: '07:00 - 18:00' },
    { day: 'Sábado', hours: '08:00 - 12:00' },
    { day: 'Domingo', hours: 'Fechado' },
  ],
};

const MOCK_PRODUCTS = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  name: ['Fertilizante NPK 10-10-10', 'Herbicida Glifosato 5L', 'Inseticida Organofosforado', 'Semente de Soja RR', 'Fungicida Multiuso', 'Adubo Orgânico 25kg'][i],
  slug: `product-${i + 1}`,
  price: [189.90, 89.90, 129.90, 349.90, 159.90, 49.90][i],
  image: null,
  rating: [4.8, 4.6, 4.7, 4.9, 4.5, 4.4][i],
  reviews: [128, 89, 56, 234, 45, 167],
}));

const MOCK_SERVICES = [
  { id: '1', name: 'Consultoria Técnica', description: 'Consultoria especializada em manejo agrícola.', price: 1500 },
  { id: '2', name: 'Análise de Solo', description: 'Análise completa de solo com recomendações.', price: 350 },
  { id: '3', name: 'Aplicação Aérea', description: 'Serviço de aplicação aérea de defensivos.', price: 2500 },
];

const MOCK_REVIEWS = Array.from({ length: 4 }, (_, i) => ({
  id: String(i + 1),
  user: { name: ['João Silva', 'Maria Oliveira', 'Carlos Souza', 'Ana Pereira'][i] },
  rating: 5 - (i % 2),
  comment: 'Excelente fornecedor, produtos de qualidade e entrega no prazo.',
  createdAt: '2026-07-20T10:00:00.000Z',
}));

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supplier = MOCK_SUPPLIER;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(getChatSettings().online);
  }, []);
  const [chatName, setChatName] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatSent, setChatSent] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ text: string; sentByMe: boolean }[]>([]);

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
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-8 py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Leaf className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{supplier.companyName}</h1>
                <BadgeCheck className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-primary-100 mb-2">{supplier.tradingName}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-primary-100">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {supplier.city}, {supplier.state}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {supplier.rating} ({supplier.totalReviews})</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {supplier.totalProducts} produtos</span>
                <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> {supplier.totalOrders} pedidos</span>
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
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{supplier.description}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos ({MOCK_PRODUCTS.length})</h2>
              <Link href={`/products?supplier=${supplier.id}`} className="btn-ghost text-sm">Ver todos</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_PRODUCTS.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 card-hover"
                >
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Leaf className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <p className="text-lg font-bold text-primary-600 mt-1">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {MOCK_SERVICES.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Serviços</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_SERVICES.map((service) => (
                  <div key={service.id} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    <p className="text-lg font-bold text-primary-600 mt-2">
                      R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avaliações ({MOCK_REVIEWS.length})</h2>
            <div className="space-y-4">
              {MOCK_REVIEWS.map((review) => (
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
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Informações de Contato</h3>
            <div className="space-y-3 text-sm">
              <a href={`tel:${supplier.phone}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                <Phone className="h-4 w-4" /> {supplier.phone}
              </a>
              <a href={`mailto:${supplier.email}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                <Mail className="h-4 w-4" /> {supplier.email}
              </a>
              <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                <Globe className="h-4 w-4" /> {supplier.website}
              </a>
              <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" /> {supplier.city}, {supplier.state}
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <a href={`tel:${supplier.phone}`} className="btn-outline w-full gap-2">
                <Phone className="h-4 w-4" /> Ligar
              </a>
              <a href={`https://wa.me/${supplier.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-primary w-full gap-2">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <button onClick={() => setIsChatOpen(true)} className="btn-outline w-full gap-2">
                <MessageCircle className="h-4 w-4" /> Chat Online
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Horários de Funcionamento</h3>
            <div className="space-y-2 text-sm">
              {supplier.workingHours.map((wh, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{wh.day}</span>
                  <span className={`font-medium ${wh.hours === 'Fechado' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {wh.hours}
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
                <p className="text-2xl font-bold text-primary-600">{supplier.totalOrders}</p>
                <p className="text-xs text-gray-500">Pedidos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{supplier.totalReviews}</p>
                <p className="text-xs text-gray-500">Avaliações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {(supplier.totalSales / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500">Em vendas</p>
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
            {!chatName || !chatEmail ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Identifique-se para iniciar o chat:</p>
                <div>
                  <label className="label-field">Seu nome</label>
                  <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} className="input-field" placeholder="Digite seu nome" />
                </div>
                <div>
                  <label className="label-field">Seu email</label>
                  <input type="email" value={chatEmail} onChange={(e) => setChatEmail(e.target.value)} className="input-field" placeholder="Digite seu email" />
                </div>
                <button onClick={() => { if (!chatName.trim() || !chatEmail.trim()) { toast.error('Preencha seu nome e email'); return; } toast.success('Bem-vindo!'); }} className="btn-primary w-full">Iniciar Chat</button>
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
                    onKeyDown={(e) => { if (e.key === 'Enter' && chatMessage.trim()) { addPendingMessage({ supplierId: supplier.id, supplierName: supplier.companyName, customerName: chatName, customerEmail: chatEmail, text: chatMessage }); setChatHistory((prev) => [...prev, { text: chatMessage, sentByMe: true }]); setChatMessage(''); } }}
                  />
                  <button onClick={() => { if (chatMessage.trim()) { addPendingMessage({ supplierId: supplier.id, supplierName: supplier.companyName, customerName: chatName, customerEmail: chatEmail, text: chatMessage }); setChatHistory((prev) => [...prev, { text: chatMessage, sentByMe: true }]); setChatMessage(''); } }} className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
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
                  onClick={() => {
                    if (!chatMessage.trim()) { toast.error('Digite uma mensagem'); return; }
                    addPendingMessage({ supplierId: supplier.id, supplierName: supplier.companyName, customerName: chatName, customerEmail: chatEmail, text: chatMessage });
                    setChatSent(true);
                    toast.success('Mensagem enviada com sucesso!');
                  }}
                  className="btn-primary w-full"
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
