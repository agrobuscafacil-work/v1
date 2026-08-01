'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const contactInfo = [
  {
    icon: Mail,
    label: 'E-mail',
    value: 'agrobuscafacil@gmail.com',
    href: 'mailto:agrobuscafacil@gmail.com',
  },
  {
    icon: Phone,
    label: 'Telefone',
    value: '(11) 98955-4706',
    href: 'tel:+5511989554706',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '(11) 99999-9999',
    href: 'https://wa.me/5511999999999',
  },
  {
    icon: MapPin,
    label: 'Endereço',
    value: 'São Paulo, SP - Brasil',
    href: null,
  },
  {
    icon: Clock,
    label: 'Atendimento',
    value: 'Seg a Sex, 08h - 18h',
    href: null,
  },
];

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setIsLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Entre em Contato
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Tem alguma dúvida, sugestão ou quer se tornar um fornecedor?
          Estamos prontos para ajudar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Envie sua Mensagem</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label-field">Nome</label>
                <input id="name" type="text" required className="input-field" placeholder="Seu nome" />
              </div>
              <div>
                <label htmlFor="email" className="label-field">E-mail</label>
                <input id="email" type="email" required className="input-field" placeholder="seu@email.com" />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="label-field">Telefone</label>
              <input id="phone" type="tel" className="input-field" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label htmlFor="subject" className="label-field">Assunto</label>
              <select id="subject" className="input-field">
                <option value="">Selecione um assunto</option>
                <option value="suporte">Suporte</option>
                <option value="vendas">Quero Vender</option>
                <option value="compras">Quero Comprar</option>
                <option value="parceria">Parceria</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="label-field">Mensagem</label>
              <textarea
                id="message"
                required
                rows={5}
                className="input-field resize-none"
                placeholder="Escreva sua mensagem..."
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informações de Contato</h2>
            <div className="space-y-5">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                    <info.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{info.label}</p>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Localização</h2>
            <div className="rounded-xl bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">São Paulo, SP - Brasil</p>
                <p className="text-xs text-gray-400 mt-1">Mapa interativo em breve</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
