'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, CreditCard, Shield, BarChart3, Infinity, Loader2, CheckCircle2, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { SUPPLIER_TIER_CONFIG, SUPPLIER_TIER_LABELS, type SupplierTier } from '@/types';

const plans = [
  {
    tier: 'BASIC' as SupplierTier,
    name: 'Básico',
    price: 0,
    period: '/mês',
    description: 'Ideal para começar a vender na plataforma',
    features: [
      { text: '1 produto ativo', included: true },
      { text: 'Cadastro de produtos básicos', included: true },
      { text: 'Acesso ao painel do fornecedor', included: true },
      { text: 'Suporte por e-mail', included: true },
      { text: 'Pagamentos online', included: false },
      { text: 'Relatórios de vendas', included: false },
    ],
    cta: 'Começar Grátis',
    popular: false,
  },
  {
    tier: 'STANDARD' as SupplierTier,
    name: 'Padrão',
    price: 99,
    period: '/mês',
    description: 'Para fornecedores que querem crescer',
    features: [
      { text: 'Até 5 produtos ativos', included: true },
      { text: 'Pagamentos online (PIX, Cartão, Boleto)', included: true },
      { text: 'Gestão de pedidos completa', included: true },
      { text: 'Chat com clientes', included: true },
      { text: 'Relatórios básicos de vendas', included: false },
      { text: 'API de integração', included: false },
    ],
    cta: 'Assinar Agora',
    popular: true,
  },
  {
    tier: 'PREMIUM' as SupplierTier,
    name: 'Premium',
    price: 299,
    period: '/mês',
    description: 'Para grandes fornecedores e distribuidores',
    features: [
      { text: 'Produtos ilimitados', included: true },
      { text: 'Pagamentos online completos', included: true },
      { text: 'Relatórios avançados e exportação', included: true },
      { text: 'API de integração completa', included: true },
      { text: 'Gerente de conta dedicado', included: true },
      { text: 'Suporte prioritário 24/7', included: true },
    ],
    cta: 'Assinar Agora',
    popular: false,
  },
];

export const dynamic = 'force-dynamic';

function VenderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedTier, setSelectedTier] = useState<SupplierTier | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  // Get tier from URL params
  useEffect(() => {
    const tier = searchParams.get('tier') as SupplierTier | null;
    if (tier && ['BASIC', 'STANDARD', 'PREMIUM'].includes(tier)) {
      setSelectedTier(tier);
      setShowPlans(true);
    }
  }, [searchParams]);

  const handleSelectPlan = (tier: SupplierTier) => {
    setSelectedTier(tier);
    setShowPlans(true);
    router.replace(`/vender?tier=${tier}`);
  };

  const handleSubscribe = async (tierParam?: SupplierTier) => {
    const tier = tierParam || selectedTier;
    if (!tier) {
      toast.error('Selecione um plano para continuar');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Voce precisa estar logado para assinar um plano');
      router.push(`/auth/login?redirect=/vender&tier=${tier}`);
      return;
    }

    if (user.role !== 'SUPPLIER') {
      toast.error('Complete seu cadastro de fornecedor para continuar');
      router.push(`/auth/register?role=supplier&tier=${tier}`);
      return;
    }

    const plan = plans.find(p => p.tier === tier);
    if (!plan) {
      toast.error('Plano não encontrado');
      return;
    }

    if (plan.price === 0) {
      setPaymentLoading(tier);
      try {
        await api.put('/suppliers/me/tier', { tier });
        toast.success('Plano Basico ativado com sucesso!');
        router.push('/supplier/dashboard');
      } catch (error: any) {
        const msg = error?.response?.data?.message;
        toast.error(typeof msg === 'string' ? msg : 'Erro ao ativar plano');
      } finally {
        setPaymentLoading(null);
      }
      return;
    }

    setPaymentLoading(tier);
    try {
      const res = await api.post('/stripe/create-plan-checkout-session', {
        tier,
        successUrl: `${window.location.origin}/vender?success=true&tier=${tier}`,
        cancelUrl: `${window.location.origin}/vender?canceled=true&tier=${tier}`,
      });
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Nao foi possivel iniciar o pagamento. Tente novamente.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao criar sessão de pagamento');
    } finally {
      setPaymentLoading(null);
    }
  };

  // Check for success/cancel params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Pagamento realizado com sucesso! Seu plano foi ativado.');
      router.replace('/vender');
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('Pagamento cancelado. Você pode tentar novamente quando quiser.');
      router.replace('/vender');
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="container-page py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Novo: Planos para Fornecedores
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Comece a vender no <span className="text-primary-600">AgroBuscaFácil</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Alcance milhares de produtores rurais em todo o Brasil. Escolha o plano ideal para o seu negócio e comece a vender hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?tier=STANDARD" className="btn-primary px-8 py-3 text-lg">
                Quero me cadastrar
              </Link>
              <Link href="#planos" className="btn-outline px-8 py-3 text-lg">
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="container-page py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Escolha o plano ideal
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Todos os planos incluem acesso ao painel do fornecedor, gestão de produtos e suporte.
              Sem taxa de adesão, cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => {
              const config = SUPPLIER_TIER_CONFIG[plan.tier];
              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl border p-8 bg-white dark:bg-gray-900 transition-all duration-200 ${
                    plan.popular
                      ? 'border-primary-300 dark:border-primary-700 shadow-xl shadow-primary-100 dark:shadow-primary-900/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500"></span>
                        </span>
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toLocaleString('pt-BR')}`}
                      </span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 line-through'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={loading || paymentLoading === plan.tier}
                    className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {paymentLoading === plan.tier ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                        Redirecionando...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>

                  {plan.price > 0 && (
                    <p className="text-center text-xs text-gray-500 mt-4">
                      Sem taxa de adesão • Cancele quando quiser • Pagamento seguro via Stripe
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {selectedTier && (
            <div className="mt-8 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500">Plano selecionado</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {plans.find((p) => p.tier === selectedTier)?.name}
                </p>
              </div>
              <button
                onClick={() => handleSubscribe(selectedTier)}
                disabled={!!paymentLoading}
                className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Redirecionando...
                  </>
                ) : (
                  'Continuar para pagamento'
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16 lg:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Processo simples e rápido para começar a vender
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Cadastro', desc: 'Preencha seus dados e envie a documentação da empresa (CNPJ, contrato social, etc.)' },
              { step: 2, title: 'Análise', desc: 'Nossa equipe analisa a documentação em até 2 dias úteis' },
              { step: 3, title: 'Aprovação', desc: 'Após aprovado, escolha seu plano e configure seu perfil' },
              { step: 4, title: 'Comece a vender', desc: 'Cadastre produtos, receba pedidos e gerencie tudo pelo painel' },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900 mb-4">
                  <span className="text-2xl font-bold text-primary-600">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-page py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Por que vender no AgroBuscaFácil?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Milhões de compradores', desc: 'Acesso a produtores rurais de todo o Brasil buscando seus produtos' },
              { icon: Shield, title: 'Pagamento garantido', desc: 'Receba com segurança via PIX, Cartão ou Boleto. Proteção contra chargeback' },
              { icon: BarChart3, title: 'Relatórios completos', desc: 'Acompanhe vendas, estoque e performance em tempo real' },
              { icon: Infinity, title: 'Sem limites', desc: 'No plano Premium, cadastre produtos ilimitados e escale seu negócio' },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950 mb-4">
                  <item.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 lg:py-24">
        <div className="container-page text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de fornecedores que já vendem no AgroBuscaFácil. Cadastre-se grátis e comece em minutos.
          </p>
          <Link href="/auth/register?tier=STANDARD" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors">
            Começar agora
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container-page text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Dúvidas? <Link href="/contato" className="text-primary-600 hover:underline">Fale conosco</Link> ou acesse nossa <Link href="/ajuda" className="text-primary-600 hover:underline">Central de Ajuda</Link></p>
        </div>
      </footer>
    </div>
  );
}

export default function VenderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}>
      <VenderContent />
    </Suspense>
  );
}