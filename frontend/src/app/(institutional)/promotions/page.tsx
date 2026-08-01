'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tag, Percent, Clock, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

const promotions = [
  {
    id: '1',
    title: 'Semana do Plantio',
    desc: 'Descontos especiais em sementes e fertilizantes para a temporada de plantio.',
    discount: '20% OFF',
    expires: '15/08/2026',
    image: '🌱',
    bg: 'bg-green-50 dark:bg-green-950',
    color: 'text-green-600',
  },
  {
    id: '2',
    title: 'Mega Ofertas em Defensivos',
    desc: 'Proteja sua lavoura com preços imperdíveis em defensivos agrícolas selecionados.',
    discount: '35% OFF',
    expires: '31/08/2026',
    image: '🛡️',
    bg: 'bg-red-50 dark:bg-red-950',
    color: 'text-red-600',
  },
  {
    id: '3',
    title: 'Frete Grátis - Sudeste',
    desc: 'Pedidos acima de R$ 500,00 para a região Sudeste têm frete grátis.',
    discount: 'Frete Grátis',
    expires: '30/09/2026',
    image: '🚚',
    bg: 'bg-blue-50 dark:bg-blue-950',
    color: 'text-blue-600',
  },
  {
    id: '4',
    title: 'Combo Trator + Implementos',
    desc: 'Compre seu trator e ganhe 15% de desconto em implementos agrícolas.',
    discount: '15% OFF',
    expires: '31/12/2026',
    image: '🚜',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    color: 'text-yellow-600',
  },
  {
    id: '5',
    title: 'Desconto no 1º Pedido',
    desc: 'Novos clientes ganham 10% de desconto na primeira compra. Cupom: BEMVINDO10',
    discount: '10% OFF',
    expires: '31/12/2026',
    image: '🎉',
    bg: 'bg-purple-50 dark:bg-purple-950',
    color: 'text-purple-600',
  },
  {
    id: '6',
    title: 'Irrigação com Preço Especial',
    desc: 'Sistemas de irrigação com até 25% de desconto. Aproveite a oferta por tempo limitado.',
    discount: '25% OFF',
    expires: '15/09/2026',
    image: '💧',
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    color: 'text-cyan-600',
  },
];

export default function PromotionsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="container-page py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <Tag className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Promoções</h1>
          <p className="text-gray-500">Aproveite as melhores ofertas do agronegócio.</p>
        </div>

        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {['all', 'desconto', 'frete', 'combos'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'desconto' ? 'Descontos' : f === 'frete' ? 'Frete Grátis' : 'Combos'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className={`rounded-xl border border-gray-200 dark:border-gray-800 ${promo.bg} overflow-hidden group hover:shadow-lg transition-shadow`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{promo.image}</span>
                  <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-white dark:bg-gray-900 ${promo.color}`}>
                    <Percent className="h-3 w-3" />
                    {promo.discount}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{promo.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{promo.desc}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                  <Clock className="h-3 w-3" />
                  Válido até {promo.expires}
                </div>
                <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                  Ver Ofertas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
          <Sparkles className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Quer receber ofertas exclusivas?</h2>
          <p className="text-sm text-gray-500 mb-4">Cadastre-se e seja o primeiro a saber das promoções.</p>
          <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Cadastre-se Grátis
          </Link>
        </div>
      </div>
    </div>
  );
}
