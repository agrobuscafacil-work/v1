'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, MapPin, CreditCard, Truck, Shield, Loader2, ChevronRight, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/use-cart';

interface Address {
  id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isMain: boolean;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const shipping = subtotal() > 500 ? 0 : 29.9;
  const discount = 0;
  const total = subtotal() + shipping - discount;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/shipping/addresses');
        const data = res.data.data ?? res.data;
        const list: Address[] = Array.isArray(data) ? data : [];
        setAddresses(list);
        const main = list.find((a) => a.isMain);
        setSelectedAddressId((main?.id) || list[0]?.id || '');
      } catch {
        setAddresses([]);
      }
    };
    load();
  }, []);

  const handlePlaceOrder = async () => {
    if (!items.length) {
      toast.error('Seu carrinho está vazio.');
      return;
    }
    if (!selectedAddress) {
      toast.error('Selecione um endereço de entrega.');
      return;
    }
    const supplierId = items[0].product.supplierId;
    if (!supplierId) {
      toast.error('Não foi possível identificar o fornecedor dos produtos.');
      return;
    }
    setIsLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitPrice: i.product.price,
        totalPrice: i.product.price * i.quantity,
      }));
      const orderRes = await api.post('/orders', {
        supplierId,
        items: orderItems,
        subtotal: subtotal(),
        shippingCost: shipping,
        total,
        paymentMethod,
      });
      const order = orderRes.data.data;
      const sessionRes = await api.post('/stripe/create-checkout-session', { orderId: order.id });
      const { url } = sessionRes.data.data;
      if (url) {
        clearCart();
        window.location.href = url;
        return;
      }
      toast.error('Não foi possível iniciar o pagamento.');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao iniciar o pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seu carrinho está vazio</h1>
          <p className="text-gray-500 mb-8">Adicione produtos antes de finalizar o pedido.</p>
          <Link href="/products" className="btn-primary">Ver Produtos</Link>
        </div>
      </div>
    );
  }

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
                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">
                    Você ainda não possui endereços cadastrados.
                  </p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="accent-primary-600 mt-1"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {addr.label ? `${addr.label} - ` : ''}{addr.street}, {addr.number}
                          </p>
                          <p className="text-xs text-gray-500">
                            {addr.neighborhood} - {addr.city}/{addr.state} - CEP {addr.zipCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!selectedAddress) {
                      toast.error('Selecione um endereço de entrega.');
                      return;
                    }
                    setStep('payment');
                  }}
                  className="btn-primary"
                >
                  Continuar para Pagamento
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" /> Forma de Pagamento
                </h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'CREDIT_CARD', label: 'Cartão de Crédito', desc: 'Parcele em até 12x' },
                    { id: 'PIX', label: 'Pix', desc: 'Pagamento imediato' },
                    { id: 'BOLETO', label: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis' },
                  ].map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-300 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === p.id}
                        onChange={() => setPaymentMethod(p.id)}
                        className="accent-primary-600"
                      />
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
                    <p className="text-sm text-gray-500">
                      {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.number} - ${selectedAddress.neighborhood}, ${selectedAddress.city}/${selectedAddress.state} - CEP ${selectedAddress.zipCode}` : 'Endereço não selecionado'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Pagamento</p>
                    <p className="text-sm text-gray-500">
                      {paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : paymentMethod === 'PIX' ? 'Pix' : 'Boleto Bancário'}
                    </p>
                  </div>
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-xs font-bold text-primary-600 relative overflow-hidden">
                          {item.product.image ? <Image src={item.product.image} alt="" fill sizes="40px" className="object-cover" /> : <Leaf className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
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
                <span>Subtotal ({items.length} itens)</span>
                <span>R$ {subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Frete</span>
                <span>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
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
