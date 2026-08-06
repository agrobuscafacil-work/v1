'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search, Loader2, Eye, X, Store, DollarSign, CreditCard, Calendar, Hash, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: number;
  supplier: string;
  createdAt: string;
  payment: string;
  orderItems: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'badge-blue' },
  PROCESSING: { label: 'Processando', color: 'badge-blue' },
  SHIPPED: { label: 'Enviado', color: 'badge-green' },
  DELIVERED: { label: 'Entregue', color: 'badge-green' },
  CANCELLED: { label: 'Cancelado', color: 'badge-red' },
};

const paymentLabels: Record<string, string> = {
  CREDIT_CARD: 'Cartão',
  DEBIT_CARD: 'Cartão',
  PIX: 'Pix',
  BOLETO: 'Boleto',
  BANK_TRANSFER: 'Transferência',
  DEPOSIT: 'Depósito',
  CASH: 'Dinheiro',
};

const statusFilters = [
  { label: 'Todos', value: '' },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Processando', value: 'PROCESSING' },
  { label: 'Enviado', value: 'SHIPPED' },
  { label: 'Entregue', value: 'DELIVERED' },
  { label: 'Cancelado', value: 'CANCELLED' },
];

function formatDate(value: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/orders');
        const data = res.data.data?.data ?? [];
        setOrders(
          data.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            total: Number(o.total),
            items: o.items?.length ?? 0,
            supplier: o.supplier?.tradingName || o.supplier?.companyName || 'Fornecedor',
            createdAt: formatDate(o.createdAt),
            payment: paymentLabels[o.paymentMethod] || o.paymentMethod || '—',
            orderItems: (o.items || []).map((i: any) => ({
              name: i.product?.name || 'Produto',
              quantity: i.quantity,
              price: Number(i.unitPrice),
            })),
          })),
        );
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = orders.filter((order) => {
    if (filter && order.status !== filter) return false;
    if (search && !order.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container-page py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe todos os seus pedidos</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número do pedido..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nenhum pedido encontrado</h2>
          <p className="text-sm text-gray-500 mb-4">{search ? 'Tente outro termo de busca.' : 'Você ainda não fez nenhum pedido.'}</p>
          <Link href="/products" className="btn-primary inline-flex">Ver Produtos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = statusConfig[order.status] || { label: order.status, color: 'badge-gray' };
            return (
              <button
                key={order.id}
                onClick={() => setDetailOrder(order)}
                className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className={status.color}>{status.label}</span>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    {order.supplier} &middot; {order.items} item(ns) &middot; {order.createdAt}
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes do Pedido</h2>
              <button onClick={() => setDetailOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Hash className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Pedido</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{detailOrder.orderNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Store className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fornecedor</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.supplier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total de Itens</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.items} itens</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-semibold text-primary-600">R$ {detailOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Pagamento</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.payment}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Data</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Itens do Pedido</p>
                <div className="space-y-1">
                  {detailOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                        <span className="text-sm font-medium text-primary-600 w-20 text-right">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Status</p>
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (statusConfig[detailOrder.status]?.color || 'badge-gray')}>
                  {statusConfig[detailOrder.status]?.label || detailOrder.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setDetailOrder(null)} className="btn-outline text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
