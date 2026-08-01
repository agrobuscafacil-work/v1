'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Search, MessageCircle } from 'lucide-react';

const faqItems = [
  {
    category: 'Pedidos',
    items: [
      { q: 'Como faço para acompanhar meu pedido?', a: 'Após realizar o login, acesse a seção "Meus Pedidos" no menu do usuário. Lá você encontra o status atualizado de todas as suas compras.' },
      { q: 'Posso cancelar um pedido?', a: 'Sim, pedidos podem ser cancelados enquanto estiverem com status "Pendente" ou "Confirmado". Após o envio, entre em contato com nosso suporte.' },
      { q: 'Qual o prazo de entrega?', a: 'O prazo varia conforme o fornecedor e a localidade. Em média, as entregas são realizadas entre 3 a 15 dias úteis.' },
    ],
  },
  {
    category: 'Pagamentos',
    items: [
      { q: 'Quais formas de pagamento são aceitas?', a: 'Aceitamos cartão de crédito (parcelado em até 12x), Pix (com 5% de desconto) e boleto bancário.' },
      { q: 'Como funciona o parcelamento?', a: 'Compras acima de R$ 100,00 podem ser parceladas em até 12x no cartão de crédito. As parcelas mínimas são de R$ 50,00.' },
      { q: 'Quando o boleto vence?', a: 'Boletos têm vencimento em 3 dias úteis após a emissão. O pedido é confirmado após a compensação, que leva até 2 dias úteis.' },
    ],
  },
  {
    category: 'Fornecedores',
    items: [
      { q: 'Como me cadastro como fornecedor?', a: 'Acesse a página de cadastro e selecione a opção "Fornecedor". Após o registro, sua conta passará por uma análise de aprovação.' },
      { q: 'Quanto custa vender no AgroBuscaFácil?', a: 'O cadastro é gratuito. Cobramos uma comissão variável por venda realizada, que varia conforme a categoria do produto.' },
      { q: 'Como recebo pelos produtos vendidos?', a: 'Os pagamentos aos fornecedores são realizados em até 7 dias úteis após a confirmação da entrega ao cliente.' },
    ],
  },
  {
    category: 'Conta e Segurança',
    items: [
      { q: 'Como alterar meus dados cadastrais?', a: 'Acesse seu perfil no menu do usuário e clique em "Editar Perfil". Lá você pode atualizar nome, e-mail, telefone e endereço.' },
      { q: 'Esqueci minha senha, o que fazer?', a: 'Na página de login, clique em "Esqueceu a senha?" e siga as instruções para redefini-la através do e-mail cadastrado.' },
      { q: 'Meus dados estão seguros?', a: 'Sim, utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança da informação para proteger seus dados.' },
    ],
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<{ category: number; item: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const filtered = faqItems[activeCategory].items.filter(
    (item) => item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <HelpCircle className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perguntas Frequentes</h1>
          <p className="text-gray-500">Encontre respostas para as dúvidas mais comuns.</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar perguntas..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {faqItems.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => { setActiveCategory(i); setSearch(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === i
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((item, i) => {
            const isOpen = openIndex?.category === activeCategory && openIndex?.item === i;
            return (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : { category: activeCategory, item: i })}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white pr-4">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma pergunta encontrada para sua busca.</p>
          )}
        </div>

        <div className="mt-10 text-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <MessageCircle className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Ainda tem dúvidas?</h2>
          <p className="text-sm text-gray-500 mb-4">Entre em contato com nossa equipe de suporte.</p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">Fale Conosco</Link>
        </div>
      </div>
    </div>
  );
}
