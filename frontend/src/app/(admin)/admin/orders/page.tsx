'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, Search, Download, Eye, X, Package, User, Store, DollarSign, CreditCard, Calendar, Hash, Loader2, Truck, StickyNote, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Supplier {
  id: string;
  companyName: string;
  tradingName: string;
  logoUrl: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  trackingCode: string;
  notes: string;
  createdAt: string;
  items: OrderItem[];
  customer: Customer | null;
  supplier: Supplier | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
  REFUNDED: { label: 'Reembolsado', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
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

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

function formatMoney(value?: number | string | null) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/orders/admin', { params });
      const payload = res.data.data;
      setOrders(payload.data || []);
      setPage(payload.meta?.page || 1);
      setTotalPages(payload.meta?.totalPages || 1);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao carregar pedidos.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !(o.customer?.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const rows = filtered.map((o) => [o.orderNumber, o.customer?.name || '', o.supplier?.companyName || '', o.items.length, o.total, o.status, formatDate(o.createdAt)].join(';'));
    const csv = ['Pedido;Cliente;Fornecedor;Itens;Total;Status;Data', ...rows].join('\n');
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
      const res = await api.put(`/orders/${detailOrder.id}/status`, { status: newStatus });
      const updated = res.data.data;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      setDetailOrder((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success('Status atualizado com sucesso!');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao atualizar o status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`Excluir o pedido ${order.orderNumber}?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/orders/${order.id}`);
      toast.success('Pedido excluído com sucesso!');
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (detailOrder?.id === order.id) setDetailOrder(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao excluir o pedido.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Todos os pedidos da plataforma.</p>
        </div>
        <button onClick={handleExport} className="btn-outline text-sm gap-2 inline-flex items-center">
          <Download className="h-4 w-4" /> Exportar
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por pedido ou cliente..." className="input-field pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-sm w-full sm:w-44">
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
                <th className="p-4 font-medium">Fornecedor</th>
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
                    <td className="p-4 text-gray-500">{order.customer?.name || '—'}</td>
                    <td className="p-4 text-gray-500">{order.supplier?.companyName || order.supplier?.tradingName || '—'}</td>
                    <td className="p-4 text-gray-500">{order.items.length}</td>
                    <td className="p-4 font-semibold text-primary-600">R$ {formatMoney(order.total)}</td>
                    <td className="p-4 text-gray-500">{paymentLabels[order.paymentMethod] || order.paymentMethod || '—'}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span></td>
                    <td className="p-4 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600" onClick={() => openDetail(order)}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button disabled={deleting} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600" onClick={() => handleDelete(order)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">{orders.length} pedido(s) - página {page} de {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost p-1.5 disabled:opacity-40" aria-label="Página anterior">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost p-1.5 disabled:opacity-40" aria-label="Próxima página">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
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
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{detailOrder.customer?.name || '—'}</p>
                    {detailOrder.customer?.email && <p className="text-xs text-gray-500 truncate">{detailOrder.customer.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Store className="h-5 w-5 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Fornecedor</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{detailOrder.supplier?.companyName || detailOrder.supplier?.tradingName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total de Itens</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.items.length} itens</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-semibold text-primary-600">R$ {formatMoney(detailOrder.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Pagamento</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{paymentLabels[detailOrder.paymentMethod] || detailOrder.paymentMethod || '—'}{detailOrder.paymentStatus ? ` (${detailOrder.paymentStatus})` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Data</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(detailOrder.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Código de Rastreio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{detailOrder.trackingCode || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <StickyNote className="h-5 w-5 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Observações</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{detailOrder.notes || '—'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Valores</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">R$ {formatMoney(detailOrder.subtotal)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Desconto</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">- R$ {formatMoney(detailOrder.discount)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Frete</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">R$ {formatMoney(detailOrder.shippingCost)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-semibold text-primary-600">R$ {formatMoney(detailOrder.total)}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Itens do Pedido</p>
                <div className="space-y-1">
                  {detailOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">{item.product?.name || 'Produto'}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="text-xs text-gray-500">{formatMoney(item.unitPrice)} x{item.quantity}</span>
                        <span className="text-sm font-medium text-primary-600 w-24 text-right">R$ {formatMoney(item.totalPrice)}</span>
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
