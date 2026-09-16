import Link from 'next/link';
import type { Metadata } from 'next';
import { Leaf, Target, Eye, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história do AgroBuscaFácil, nossa missão, visão e valores no agronegócio brasileiro.',
};

export default function AboutPage() {
  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900 mb-4">
          <Leaf className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Sobre o AgroBuscaFácil
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Somos a maior plataforma de marketplace B2B e B2C do agronegócio brasileiro.
          Conectamos fornecedores e compradores de forma simples, rápida e segura,
          impulsionando o desenvolvimento do setor agropecuário no Brasil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <Target className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Missão</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Conectar pessoas e negócios do agronegócio através de tecnologia,
            promovendo eficiência, transparência e crescimento sustentável do setor.
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <Eye className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Visão</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ser a principal plataforma digital do agronegócio na América Latina,
            referência em inovação, confiança e impacto positivo no campo.
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <Heart className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Valores</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Transparência, inovação, sustentabilidade, compromisso com o cliente
            e valorização do agronegócio brasileiro.
          </p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Nossa História</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            O AgroBuscaFácil nasceu em 2026 da visão de empreendedores que enxergaram
            a necessidade de digitalizar o comércio de insumos e produtos agrícolas no Brasil.
            Percebemos que pequenos e médios produtores rurais enfrentavam dificuldades para
            encontrar fornecedores confiáveis e comparar preços de forma eficiente.
          </p>
          <p>
            Com uma plataforma intuitiva e focada nas necessidades do agro, começamos conectando
            fornecedores locais a produtores da região Sudeste. Rapidamente, a demanda cresceu e
            expandimos para todo o Brasil, tornando-nos referência no setor.
          </p>
          <p>
            Hoje, conectamos fornecedores e compradores em todo o Brasil, simplificando o comércio agrícola e impulsionando o agronegócio brasileiro.
          </p>
        </div>
      </div>
    </div>
  );
}
