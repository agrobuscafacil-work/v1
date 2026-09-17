import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Target, Eye, Heart, Sprout, Leaf, TrendingUp, Tractor, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história do AgroBuscaFácil, nossa missão, visão e valores no agronegócio brasileiro.',
};

const stats = [
  { value: '2026', label: 'Fundação' },
  { value: '100%', label: 'Foco no agro' },
  { value: 'B2B + B2C', label: 'Modelo de negócio' },
  { value: 'Brasil', label: 'Feito no Brasil' },
];

const pillars = [
  {
    icon: Target,
    title: 'Missão',
    text: 'Conectar pessoas e negócios do agronegócio através de tecnologia, promovendo eficiência, transparência e crescimento sustentável do setor.',
    topClass: 'from-green-100 to-green-200 dark:from-green-950 dark:to-green-900',
  },
  {
    icon: Eye,
    title: 'Visão',
    text: 'Ser a principal plataforma digital do agronegócio na América Latina, referência em inovação, confiança e impacto positivo no campo.',
    topClass: 'from-amber-100 to-yellow-200 dark:from-amber-950 dark:to-yellow-900',
  },
  {
    icon: Heart,
    title: 'Valores',
    text: 'Transparência, inovação, sustentabilidade, compromisso com o cliente e valorização do agronegócio brasileiro.',
    topClass: 'from-orange-100 to-amber-200 dark:from-orange-950 dark:to-amber-900',
  },
];

const phases = [
  {
    icon: Sprout,
    title: '2026 · Semente',
    text: 'O AgroBuscaFácil nasceu em 2026 da visão de empreendedores que enxergaram a necessidade de digitalizar o comércio de insumos e produtos agrícolas no Brasil. Percebemos que pequenos e médios produtores rurais enfrentavam dificuldades para encontrar fornecedores confiáveis e comparar preços de forma eficiente.',
  },
  {
    icon: Leaf,
    title: 'Crescimento',
    text: 'Com uma plataforma intuitiva e focada nas necessidades do agro, começamos conectando fornecedores locais a produtores da região.',
  },
  {
    icon: Tractor,
    title: 'Colheita',
    text: 'Hoje, queremos conectar os fornecedores e compradores em todo o Brasil, simplificando o comércio agrícola e impulsionando o agronegócio brasileiro.',
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* HERO with farm photo */}
      <section className="relative overflow-hidden bg-green-950">
        <Image
          src="/images/hero-lavoura.jpg"
          alt="Lavoura de milho ao pôr do sol"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/75 via-green-950/55 to-green-950/90 pointer-events-none" />
        <div className="container-page relative py-20 lg:py-28 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-300 mb-3">
            Início / Sobre nós
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Nascemos no <span className="text-secondary-400">campo</span>
          </h1>
          <p className="text-lg text-green-100/90 leading-relaxed max-w-2xl mx-auto">
            O AgroBuscaFácil nasceu em 2026 para digitalizar o comércio de insumos e
            produtos agrícolas no Brasil — do pequeno produtor ao grande distribuidor.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="container-page py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl bg-white dark:bg-gray-900 border-t-4 border-primary-500 border border-gray-200 dark:border-gray-800 p-6"
            >
              <p className="text-2xl lg:text-3xl font-bold text-primary-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSÃO / VISÃO / VALORES */}
      <section className="container-page pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className={`h-20 bg-gradient-to-br ${pillar.topClass} flex items-center justify-center`}>
                <pillar.icon className="h-9 w-9 text-primary-700 dark:text-primary-300" />
              </div>
              <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{pillar.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{pillar.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HISTÓRIA COMO LAVOURA */}
      <section className="bg-green-950 py-16 lg:py-20">
        <div className="container-page">
          <h2 className="text-2xl lg:text-3xl font-bold text-white text-center">
            Nossa história, como uma lavoura
          </h2>
          <p className="text-green-300 text-center mt-2 mb-12">Cada fase, uma etapa do plantio</p>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              aria-hidden
              className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-[3px] bg-[repeating-linear-gradient(90deg,#a16207_0_14px,transparent_14px_22px)]"
            />
            {phases.map((phase) => (
              <div key={phase.title} className="text-center relative">
                <div className="h-14 w-14 rounded-full bg-green-900 border-[3px] border-secondary-400 flex items-center justify-center mx-auto mb-4 relative">
                  <phase.icon className="h-6 w-6 text-secondary-300" />
                </div>
                <h3 className="text-secondary-300 font-semibold mb-2">{phase.title}</h3>
                <p className="text-sm text-green-100/85 leading-relaxed">{phase.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden bg-green-950">
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Faça parte dessa colheita
            </h2>
            <p className="text-green-100/85 mb-8">
              Cadastre sua empresa e alcance milhares de compradores do agronegócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/vender"
                className="inline-flex items-center justify-center rounded-xl bg-secondary-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-secondary-600 transition-colors"
              >
                Quero Vender <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Falar conosco
              </Link>
            </div>
          </div>
          <div className="relative min-h-[240px]">
            <Image
              src="/images/banner-trator.jpg"
              alt="Trator arando a lavoura visto de cima"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
