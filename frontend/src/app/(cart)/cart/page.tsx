'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart as CartIcon, Leaf, ArrowLeft, ArrowRight, Shield, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/use-cart';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const shipping = subtotal() > 500 ? 0 : 29.90;
  const discount = 0;
  const total = subtotal() + shipping - discount;

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
            <CartIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seu carrinho está vazio</h1>
          <p className="text-gray-500 mb-8">Adicione produtos para começar suas compras.</p>
          <Link href="/products" className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" /> Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carrinho de Compras</h1>
        <span className="text-sm text-gray-500">{items.length} itens</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4"
            >
              <Link href={'/products/' + item.product.slug} className="h-24 w-24 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Leaf className="h-10 w-10 text-gray-400" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.product.supplierName}</p>
                <Link href={'/products/' + item.product.slug} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="btn-outline p-1.5">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="btn-outline p-1.5">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-gray-500 ml-2">R$ {item.product.price.toFixed(2)}/{item.product.unit}</span>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Link href="/products" className="btn-ghost text-sm gap-2">
              <ArrowLeft className="h-4 w-4" /> Continuar Comprando
            </Link>
            <button onClick={clearCart} className="btn-ghost text-sm text-red-500 hover:bg-red-50">
              Limpar Carrinho
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Resumo do Pedido</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  R$ {subtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frete</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900 dark:text-white'}>
                  {shipping === 0 ? 'Grátis' : 'R$ ' + shipping.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-primary-600">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cupom de desconto"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input-field flex-1 text-sm"
                />
                <button className="btn-outline text-sm">Aplicar</button>
              </div>
              <Link href="/checkout" className="btn-primary w-full gap-2">
                Seguir para Pagamento <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-green-500" /> Compra segura e garantida</p>
              <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-green-500" /> Frete grátis para pedidos acima de R$ 500,00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
