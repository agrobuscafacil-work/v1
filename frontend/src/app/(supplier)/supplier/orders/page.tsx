'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Search, Download, Eye, X, Package, User, DollarSign, CreditCard, Calendar, Hash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  items: number;
  status: string;
  payment: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
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

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

function formatDate(value: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/orders');
      const data = res.data.data?.data ?? [];
      setOrders(
        data.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer?.name || 'Cliente',
          total: Number(o.total),
          items: o.items?.length ?? 0,
          status: o.status,
          payment: paymentLabels[o.paymentMethod] || o.paymentMethod || '—',
          createdAt: formatDate(o.createdAt),
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
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const rows = filtered.map((o) => [o.orderNumber, o.customer, o.items, o.total, o.status, o.createdAt].join(';'));
    const csv = ['Pedido;Cliente;Itens;Total;Status;Data', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso!');
  };

  const openDetail = (order: Order) => {
    setDetailOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusChange = async () => {
    if (!detailOrder || !newStatus || newStatus === detailOrder.status) return;
    setSavingStatus(true);
    try {
      await api.put(`/orders/${detailOrder.id}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso!');
      setDetailOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao atualizar o status.');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos Recebidos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os pedidos da sua loja.</p>
        </div>
        <button onClick={handleExport} className="btn-outline text-sm gap-2 inline-flex items-center">
          <Download className="h-4 w-4" /> Exportar
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número do pedido..." className="input-field pl-9 text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field text-sm w-full sm:w-44">
          <option value="all">Todos os status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabels[s]?.label || s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-medium">Pedido</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Itens</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Pagamento</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const statusInfo = statusLabels[order.status] || { label: order.status, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
                return (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="p-4 text-gray-500">{order.customer}</td>
                    <td className="p-4 text-gray-500">{order.items}</td>
                    <td className="p-4 font-semibold text-primary-600">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-gray-500">{order.payment}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span></td>
                    <td className="p-4 text-gray-500">{order.createdAt}</td>
                    <td className="p-4">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600" onClick={() => openDetail(order)}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando pedidos...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum pedido encontrado.</p>
          </div>
        )}
      </div>
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
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.customer}</p>
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Data</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.createdAt}</p>
                  </div>
                </div>
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
                <p className="text-xs text-gray-500">Atualizar Status</p>
                <div className="flex items-center gap-2">
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field text-xs py-1.5">
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]?.label || s}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusChange}
                    disabled={savingStatus || newStatus === detailOrder.status}
                    className="btn-primary text-xs px-3 py-1.5 gap-1"
                  >
                    {savingStatus ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Salvar
                  </button>
                </div>
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
