import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 mb-4">
            <FileText className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Termos de Uso</h1>
          <p className="text-gray-500">Última atualização: Julho de 2026</p>
        </div>

        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Aceitação dos Termos</h2>
            <p>Ao acessar ou usar a plataforma AgroBuscaFácil, você concorda com os termos e condições descritos neste documento. Se não concordar, não utilize nossos serviços.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Definições</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Plataforma:</strong> site e aplicativo AgroBuscaFácil</li>
              <li><strong>Usuário:</strong> pessoa física ou jurídica que utiliza a plataforma</li>
              <li><strong>Comprador:</strong> usuário que adquire produtos na plataforma</li>
              <li><strong>Fornecedor:</strong> usuário cadastrado para vender produtos na plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Cadastro e Conta</h2>
            <p>O usuário é responsável pela veracidade dos dados fornecidos no cadastro e pela segurança de sua senha. O AgroBuscaFácil pode suspender contas em caso de suspeita de fraude ou violação dos termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Compras e Pagamentos</h2>
            <p>Os preços dos produtos são definidos pelos fornecedores. O AgroBuscaFácil atua como intermediário na transação. O pagamento é processado por parceiros de pagamento certificados.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Responsabilidades do Fornecedor</h2>
            <p>O fornecedor é responsável pela qualidade dos produtos, cumprimento dos prazos de entrega e veracidade das informações do anúncio. Descumprimento pode resultar em suspensão da conta.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Propriedade Intelectual</h2>
            <p>Todos os direitos de propriedade intelectual da plataforma (marcas, logotipos, design, código) pertencem ao AgroBuscaFácil. É proibida a reprodução não autorizada.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Limitação de Responsabilidade</h2>
            <p>O AgroBuscaFácil não se responsabiliza por danos indiretos decorrentes do uso da plataforma, incluindo perda de lucros ou interrupção de negócios, dentro dos limites permitidos por lei.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Disposições Gerais</h2>
            <p>Estes termos são regidos pela legislação brasileira. Qualquer disputa será resolvida no foro da cidade de São Paulo - SP. O AgroBuscaFácil pode alterar estes termos a qualquer momento, notificando os usuários com 30 dias de antecedência.</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Fale Conosco</Link>
        </div>
      </div>
    </div>
  );
}
