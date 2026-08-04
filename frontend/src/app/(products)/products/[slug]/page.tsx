'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, Truck, Shield, Package, ChevronLeft, ChevronRight,
  Minus, Plus, ShoppingCart, Heart, Share2, MapPin, Leaf, Clock,
  CheckCircle, Phone, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/use-cart';

const MOCK_PRODUCT = {
  id: '1',
  name: 'Trator Agrícola 4x4 Motor Turbodiesel 120cv',
  slug: 'trator-agricola-4x4',
  description: 'Trator agrícola de última geração com motor turbodiesel de 120cv, ideal para médias e grandes propriedades. Equipado com sistema de direção hidráulica, tomada de potência independente e cabine com ar-condicionado.',
  shortDescription: 'Motor 120cv, 4x4, cabine climatizada, ideal para médias e grandes propriedades.',
  brand: 'AgroTract',
  sku: 'TRAT-4X4-120CV',
  unit: 'un',
  minimumQuantity: 1,
  price: 249900.00,
  comparePrice: 289900.00,
  discountPercent: 14,
  stock: 5,
  images: [],
  tags: ['trator', '4x4', 'turbodiesel', '120cv'],
  status: 'ACTIVE' as const,
  featured: true,
  freeShipping: true,
  rating: 4.8,
  totalReviews: 42,
  category: { id: '1', name: 'Máquinas', slug: 'maquinas' },
  supplier: {
    id: '1',
    companyName: 'Máquinas Agrícolas LTDA',
    rating: 4.6,
    totalReviews: 128,
    totalProducts: 89,
    city: 'Ribeirão Preto',
    state: 'SP',
    phone: '(16) 3636-0000',
    whatsapp: '5516999999999',
    logoUrl: undefined,
  },
};

const MOCK_REVIEWS = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  user: { name: ['João Silva', 'Maria Oliveira', 'Carlos Souza', 'Ana Pereira', 'Pedro Santos'][i] },
  rating: 5 - (i % 2),
  title: ['Excelente produto', 'Bom custo-benefício', 'Entrega rápida', 'Produto de qualidade', 'Recomendo'][i],
  comment: 'Produto de altíssima qualidade, superou minhas expectativas. A entrega foi feita no prazo e o produto veio bem embalado.',
  createdAt: '2026-07-20T10:00:00.000Z',
}));

const RELATED_PRODUCTS = Array.from({ length: 4 }, (_, i) => ({
  id: String(i + 10),
  name: ['Colheitadeira Automotriz', 'Arado de Aiveca 4 Discos', 'Pulverizador Agrícola 2000L', 'Grade Niveladora 24 Discos'][i],
  slug: `related-${i + 1}`,
  price: [189900, 24990, 45990, 32990][i],
  supplier: 'Máquinas Agrícolas LTDA',
  rating: [4.7, 4.5, 4.6, 4.4][i],
  reviews: [28, 35, 19, 42],
}));

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { addItem } = useCart();

  const product = MOCK_PRODUCT;
  const imagens = Array.from({ length: 4 }, (_, i) => null);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      unit: product.unit,
      image: '',
      supplierName: product.supplier.companyName,
    }, quantity);
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast(isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  return (
    <div className="container-page py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600">Produtos</Link>
        <span>/</span>
        <Link href="/products?category=maquinas" className="hover:text-primary-600">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
            <Leaf className="h-24 w-24 text-gray-400" />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                -{product.discountPercent}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {imagens.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 transition-colors ${
                  selectedImage === i ? 'border-primary-500' : 'border-transparent'
                }`}
              >
                <Leaf className="h-8 w-8 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-green">{product.status === 'ACTIVE' ? 'Disponível' : 'Indisponível'}</span>
              {product.freeShipping && <span className="badge-blue">Frete Grátis</span>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Marca: {product.brand} | SKU: {product.sku}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.totalReviews} avaliações)</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm text-gray-500">{product.totalReviews > 0 ? `${Math.floor(product.totalReviews * 0.85)}% dos compradores recomendam` : ''}</span>
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

          <p className="text-sm text-gray-600 dark:text-gray-400">{product.shortDescription}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="badge-gray">{tag}</span>
            ))}
          </div>

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
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <Link href={`/suppliers/${product.supplier?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600">
                  {product.supplier?.companyName}
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{product.supplier?.rating}</span>
                  <span>({product.supplier?.totalReviews} avaliações)</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" /> {product.supplier?.city}, {product.supplier?.state}
              </p>
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Package className="h-4 w-4" /> {product.supplier?.totalProducts} produtos
              </p>
              <div className="flex gap-2 mt-3">
                <a href={`tel:${product.supplier?.phone}`} className="btn-outline flex-1 gap-2 text-xs">
                  <Phone className="h-4 w-4" /> Ligar
                </a>
                <a
                  href={`https://wa.me/${product.supplier?.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 gap-2 text-xs"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Descrição do Produto</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avaliações ({MOCK_REVIEWS.length})</h2>
            <div className="space-y-6">
              {MOCK_REVIEWS.map((review) => (
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
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Especificações</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Marca</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{product.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">SKU</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{product.sku}</dd>
              </div>
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
              <div className="flex justify-between">
                <dt className="text-gray-500">Categoria</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{product.category?.name}</dd>
              </div>
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

      <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Produtos Relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RELATED_PRODUCTS.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden card-hover"
            >
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Leaf className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs text-gray-500">{p.supplier}</p>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 line-clamp-2">{p.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{p.rating}</span>
                  <span className="text-xs text-gray-500">({p.reviews})</span>
                </div>
                <p className="text-xl font-bold text-primary-600">
                  R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
