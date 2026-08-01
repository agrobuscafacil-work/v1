'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, MapPin, CreditCard, Truck, Shield, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const cartItems = [
  { id: '1', name: 'Semente de Soja Transgênica', price: 189.90, quantity: 2, image: 'SS' },
  { id: '2', name: 'Fertilizante NPK 20-10-10', price: 89.90, quantity: 1, image: 'NP' },
  { id: '3', name: ' defensivo Agrícola Glifosato', price: 45.90, quantity: 3, image: 'GL' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 25.90;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    toast.success('Pedido realizado com sucesso!');
    setIsLoading(false);
    router.push('/orders');
  };

  return (
    <div className="container-page py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary-600" />
          Finalizar Pedido
        </h1>

        <div className="flex items-center gap-2 mb-8 text-sm">
          {['address', 'payment', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-primary-600 text-white' :
                ['address', 'payment', 'confirm'].indexOf(step) >= i ? 'bg-primary-100 dark:bg-primary-900 text-primary-700' :
                'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>{i + 1}</div>
              <span className={`text-xs font-medium hidden sm:inline ${
                step === s ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {s === 'address' ? 'Endereço' : s === 'payment' ? 'Pagamento' : 'Confirmação'}
              </span>
              {i < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'address' && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" /> Endereço de Entrega
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label-field">Endereço</label>
                      <input type="text" className="input-field" placeholder="Rua, número" defaultValue="Rua das Flores, 123" />
                    </div>
                    <div>
                      <label className="label-field">Bairro</label>
                      <input type="text" className="input-field" placeholder="Bairro" defaultValue="Centro" />
                    </div>
                    <div>
                      <label className="label-field">Cidade</label>
                      <input type="text" className="input-field" placeholder="Cidade" defaultValue="Ribeirão Preto" />
                    </div>
                    <div>
                      <label className="label-field">Estado</label>
                      <input type="text" className="input-field" placeholder="SP" defaultValue="SP" />
                    </div>
                    <div>
                      <label className="label-field">CEP</label>
                      <input type="text" className="input-field" placeholder="CEP" defaultValue="14000-000" />
                    </div>
                  </div>
                  <button onClick={() => setStep('payment')} className="btn-primary">Continuar para Pagamento</button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" /> Forma de Pagamento
                </h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'credit', label: 'Cartão de Crédito', desc: 'Parcele em até 12x' },
                    { id: 'pix', label: 'Pix', desc: 'Desconto de 5% à vista' },
                    { id: 'boleto', label: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis' },
                  ].map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-300 transition-colors">
                      <input type="radio" name="payment" defaultChecked={p.id === 'credit'} className="accent-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</p>
                        <p className="text-xs text-gray-500">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button onClick={() => setStep('confirm')} className="btn-primary">Revisar Pedido</button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-600" /> Revisão do Pedido
                </h2>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Entrega</p>
                    <p className="text-sm text-gray-500">Rua das Flores, 123 - Centro, Ribeirão Preto - SP</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Pagamento</p>
                    <p className="text-sm text-gray-500">Cartão de Crédito - Parcelado em 6x</p>
                  </div>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-xs font-bold text-primary-600">{item.image}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <button onClick={handlePlaceOrder} disabled={isLoading} className="btn-primary w-full gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    {isLoading ? 'Processando...' : 'Confirmar e Pagar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumo</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({cartItems.length} itens)</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Frete</span>
                <span>R$ {shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
