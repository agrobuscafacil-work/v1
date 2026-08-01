import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <Shield className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Política de Privacidade</h1>
          <p className="text-gray-500">Última atualização: Julho de 2026</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Introdução</h2>
            <p>O AgroBuscaFácil valoriza a privacidade dos seus usuários. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Dados Coletados</h2>
            <p>Podemos coletar as seguintes informações:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados de cadastro: nome, CPF/CNPJ, e-mail, telefone, endereço</li>
              <li>Dados de navegação: páginas visitadas, produtos visualizados, tempo de sessão</li>
              <li>Dados de transação: histórico de compras, forma de pagamento, valores</li>
              <li>Dados de dispositivo: endereço IP, tipo de navegador, sistema operacional</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Uso dos Dados</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Processar pedidos e gerenciar sua conta</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Enviar comunicações sobre pedidos e promoções</li>
              <li>Melhorar nossos serviços e desenvolver novos recursos</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Compartilhamento de Dados</h2>
            <p>Não vendemos seus dados pessoais. Podemos compartilhar informações com:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecedores parceiros para processamento de pedidos</li>
              <li>Processadores de pagamento para transações financeiras</li>
              <li>Autoridades legais quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Segurança</h2>
            <p>Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia SSL/TLS, firewalls e controles de acesso rigorosos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Seus Direitos</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acessar, corrigir ou excluir seus dados pessoais</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados</li>
              <li>Ser informado sobre compartilhamento com terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Cookies</h2>
            <p>Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para melhorar sua experiência. Você pode gerenciar as preferências de cookies nas configurações do seu navegador.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Contato</h2>
            <p>Para questões relacionadas à privacidade, entre em contato pelo e-mail: <a href="mailto:privacidade@agrobuscafacil.com.br" className="text-primary-600 hover:text-primary-700">privacidade@agrobuscafacil.com.br</a></p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Fale Conosco</Link>
        </div>
      </div>
    </div>
  );
}
