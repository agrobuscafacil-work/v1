'use client';

import Link from 'next/link';
import {
  Wrench, Truck, Search as SearchIcon, ClipboardCheck,
  TrendingUp, HeadphonesIcon, ArrowRight, CheckCircle,
} from 'lucide-react';

const services = [
  {
    icon: SearchIcon,
    title: 'Consultoria Agrícola',
    desc: 'Análise de solo, recomendação de cultivos e planejamento safra com engenheiros agrônomos.',
    features: ['Análise de solo', 'Recomendação de cultivos', 'Planejamento de safra', 'Visita técnica'],
  },
  {
    icon: Truck,
    title: 'Logística e Transporte',
    desc: 'Transporte de insumos e produtos agrícolas com frota especializada e rastreamento em tempo real.',
    features: ['Frota refrigerada', 'Rastreamento via GPS', 'Entrega programada', 'Carga fracionada'],
  },
  {
    icon: Wrench,
    title: 'Manutenção de Máquinas',
    desc: 'Manutenção preventiva e corretiva de tratores, colheitadeiras e implementos agrícolas.',
    features: ['Manutenção preventiva', 'Diagnóstico eletrônico', 'Peças originais', 'Garantia de 6 meses'],
  },
  {
    icon: ClipboardCheck,
    title: 'Certificação e Qualidade',
    desc: 'Certificação de produtos orgânicos, rastreabilidade e adequação às normas sanitárias.',
    features: ['Certificação orgânica', 'Rastreabilidade', 'Análise laboratorial', 'Adequação sanitária'],
  },
  {
    icon: TrendingUp,
    title: 'Gestão Rural',
    desc: 'Softwares e consultoria para gestão financeira, estoque e produção da sua fazenda.',
    features: ['Gestão financeira', 'Controle de estoque', 'Gestão de produção', 'Relatórios inteligentes'],
  },
  {
    icon: HeadphonesIcon,
    title: 'Suporte Técnico',
    desc: 'Suporte remoto e presencial para uso de defensivos, fertilizantes e equipamentos.',
    features: ['Suporte remoto', 'Visita técnica', 'Treinamento de equipe', 'Plantão 24h'],
  },
];

export default function ServicesPage() {
  return (
    <div className="container-page py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <Wrench className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Serviços para o Agro
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Soluções completas para impulsionar sua produção agrícola, desde consultoria até logística.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <div key={service.title} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-shadow group">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                <service.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{service.desc}</p>
              <ul className="space-y-1.5 mb-4">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                Solicitar Orçamento <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-primary-50 to-white dark:from-primary-950 dark:to-gray-900 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Precisa de um serviço personalizado?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Entre em contato conosco e montaremos uma solução sob medida para sua propriedade rural.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            <HeadphonesIcon className="h-4 w-4" /> Fale Conosco
          </Link>
        </div>
      </div>
    </div>
  );
}
