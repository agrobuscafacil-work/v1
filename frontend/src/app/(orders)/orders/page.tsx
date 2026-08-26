'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search, Loader2, Eye, X, Store, DollarSign, CreditCard, Calendar, Hash, ShoppingBag, CheckCircle2, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/use-auth';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  productId: string;
  slug?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemsCount: number;
  supplier: string;
  supplierId: string;
  createdAt: string;
  payment: string;
  confirmedDeliveryAt?: string;
  items: OrderItem[];
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
  const [evaluateTab, setEvaluateTab] = useState<'product' | 'supplier' | null>(null);
  const [selectedEvaluateItemId, setSelectedEvaluateItemId] = useState<string>('');
  const [productRating, setProductRating] = useState(0);
  const [productRatingHover, setProductRatingHover] = useState(0);
  const [productComment, setProductComment] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [submittingProductReview, setSubmittingProductReview] = useState(false);
  const [supplierRating, setSupplierRating] = useState(0);
  const [supplierRatingHover, setSupplierRatingHover] = useState(0);
  const [supplierComment, setSupplierComment] = useState('');
  const [supplierTitle, setSupplierTitle] = useState('');
  const [submittingSupplierReview, setSubmittingSupplierReview] = useState(false);
  const [evaluatedProductIds, setEvaluatedProductIds] = useState<Set<string>>(new Set());
  const [evaluatedSupplierIds, setEvaluatedSupplierOrderIds] = useState<Set<string>>(new Set());
  const [existingSupplierReview, setExistingSupplierReview] = useState<any | null>(null);
  const { user } = useAuth();
  const [ownSupplierId, setOwnSupplierId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'SUPPLIER' || (user as any)?.role === 'supplier') {
      api.get('/suppliers/me').then((res) => {
        const sid = res.data?.data?.id || res.data?.id || null;
        if (sid) setOwnSupplierId(sid);
      }).catch(() => {});
    } else {
      setOwnSupplierId(null);
    }
  }, [user]);

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
            itemsCount: o.items?.length ?? 0,
            supplier: o.supplier?.tradingName || o.supplier?.companyName || 'Fornecedor',
            supplierId: o.supplier?.id || o.supplierId || '',
            createdAt: formatDate(o.createdAt),
            payment: paymentLabels[o.paymentMethod] || o.paymentMethod || '—',
            confirmedDeliveryAt: o.confirmedDeliveryAt,
            items: (o.items || []).map((i: any) => ({
              id: i.id,
              name: i.product?.name || 'Produto',
              quantity: i.quantity,
              price: Number(i.unitPrice),
              productId: i.product?.id || i.productId || '',
              slug: i.product?.slug || '',
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

  useEffect(() => {
    if (evaluateTab === 'product' && selectedEvaluateItemId && detailOrder && user?.id) {
      const productId = detailOrder.items.find((i) => i.id === selectedEvaluateItemId)?.productId;
      if (!productId) return;
      api.get('/reviews', { params: { productId, limit: 50 } }).then((res) => {
        const has = (res.data.data?.data ?? []).some((r: any) => r.userId === user.id);
        if (has) setEvaluatedProductIds((prev) => new Set(prev).add(productId));
      }).catch(() => {});
    }
  }, [evaluateTab, selectedEvaluateItemId, detailOrder, user]);

  useEffect(() => {
    if (evaluateTab === 'supplier' && detailOrder && user?.id) {
      api.get('/reviews/seller', { params: { supplierId: detailOrder.supplierId, limit: 50 } }).then((res) => {
        const found = (res.data.data?.data ?? []).find((r: any) => r.userId === user.id);
        if (found) {
          setEvaluatedSupplierOrderIds((prev) => new Set(prev).add(detailOrder.supplierId));
          setExistingSupplierReview(found);
        } else {
          setExistingSupplierReview(null);
        }
      }).catch(() => {});
    } else if (evaluateTab !== 'supplier') {
      setExistingSupplierReview(null);
    }
  }, [evaluateTab, detailOrder, user]);

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
                    {typeof order.supplier === 'string' ? order.supplier : (order as any).supplier?.companyName || 'Fornecedor'} &middot; {order.itemsCount} item(ns) &middot; {order.createdAt}
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
              <button onClick={() => { setDetailOrder(null); setEvaluateTab(null); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{typeof detailOrder.supplier === 'string' ? detailOrder.supplier : (detailOrder.supplier as any)?.companyName || (detailOrder.supplier as any)?.tradingName || 'Fornecedor'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total de Itens</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detailOrder.items?.length ?? detailOrder.itemsCount ?? 0} itens</p>
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
                  {detailOrder.items?.map((item, idx) => (
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
              {detailOrder.status === 'DELIVERED' && detailOrder.confirmedDeliveryAt && (
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 space-y-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Recebimento confirmado — avalie sua experiência
                  </p>
                  {ownSupplierId && detailOrder.supplierId === ownSupplierId ? (
                    <p className="text-sm text-amber-800 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">Você não pode avaliar seus próprios produtos ou seu próprio perfil de fornecedor.</p>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEvaluateTab('product');
                          if (detailOrder.items?.length === 1) setSelectedEvaluateItemId(detailOrder.items[0].id);
                        }}
                        className={`flex-1 gap-2 text-sm ${evaluateTab === 'product' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Star className="h-4 w-4" /> Avaliar produto
                      </button>
                      <button
                        onClick={() => setEvaluateTab('supplier')}
                        className={`flex-1 gap-2 text-sm ${evaluateTab === 'supplier' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <Store className="h-4 w-4" /> Avaliar fornecedor
                      </button>
                    </div>
                  )}

                  {!(ownSupplierId && detailOrder.supplierId === ownSupplierId) && evaluateTab === 'product' && (() => {
                    const pid = detailOrder.items?.length === 1 ? detailOrder.items[0].productId : detailOrder.items.find((i) => i.id === selectedEvaluateItemId)?.productId;
                    const already = pid ? evaluatedProductIds.has(pid) : false;
                    if (already) {
                      return <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 text-sm text-green-700 dark:text-green-200">Você já avaliou este produto. Obrigado pelo seu feedback!</div>;
                    }
                    return (
                    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                      {detailOrder.items?.length > 1 && (
                        <select
                          value={selectedEvaluateItemId}
                          onChange={(e) => setSelectedEvaluateItemId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                        >
                          <option value="">Selecione o produto</option>
                          {detailOrder.items.map((it) => (
                            <option key={it.id} value={it.id}>{it.name}</option>
                          ))}
                        </select>
                      )}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const star = i + 1;
                          const filled = star <= (productRatingHover || productRating);
                          return (
                            <button key={star} type="button" onClick={() => setProductRating(star)} onMouseEnter={() => setProductRatingHover(star)} onMouseLeave={() => setProductRatingHover(0)} className="p-0.5">
                              <Star className={`h-6 w-6 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                          );
                        })}
                        <span className="ml-2 text-sm font-medium">{productRating > 0 ? productRating.toFixed(1) : '0.0'}</span>
                      </div>
                      <input value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="Título (opcional)" maxLength={200} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
                      <textarea value={productComment} onChange={(e) => setProductComment(e.target.value)} placeholder="Conte sua experiência com o produto..." maxLength={1000} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
                      <button
                        disabled={submittingProductReview || productRating < 1 || !productComment.trim() || (detailOrder.items?.length > 1 && !selectedEvaluateItemId)}
                        onClick={async () => {
                          const orderItemId = detailOrder.items?.length === 1 ? detailOrder.items[0].id : selectedEvaluateItemId;
                          if (!orderItemId) { toast.error('Selecione o produto'); return; }
                          setSubmittingProductReview(true);
                          try {
                            await api.post('/reviews', { orderItemId, rating: productRating, title: productTitle, comment: productComment.trim() });
                            toast.success('Avaliação do produto enviada!');
                            const pid2 = detailOrder.items.find((i) => i.id === orderItemId)?.productId;
                            if (pid2) setEvaluatedProductIds((prev) => new Set(prev).add(pid2));
                            setProductRating(0); setProductComment(''); setProductTitle(''); setEvaluateTab(null);
                          } catch (err: any) {
                            const msg = err?.response?.data?.message || 'Erro ao enviar avaliação';
                            const text = Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
                            if (err?.response?.status === 409) {
                              const pid3 = detailOrder.items.find((i) => i.id === orderItemId)?.productId;
                              if (pid3) setEvaluatedProductIds((prev) => new Set(prev).add(pid3));
                            }
                            toast.error(text);
                          } finally { setSubmittingProductReview(false); }
                        }}
                        className="btn-primary w-full gap-2"
                      >
                        {submittingProductReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />} Enviar avaliação do produto
                      </button>
                    </div>
                    );
                  })()}

                  {!(ownSupplierId && detailOrder.supplierId === ownSupplierId) && evaluateTab === 'supplier' && (() => {
                    const already = evaluatedSupplierIds.has(detailOrder.supplierId) || !!existingSupplierReview;
                    if (already) return <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 text-sm text-green-700 dark:text-green-200">Você já avaliou este fornecedor.</div>;
                    return (
                    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avalie o atendimento e o serviço do fornecedor <strong>{typeof detailOrder.supplier === 'string' ? detailOrder.supplier : (detailOrder.supplier as any)?.companyName || 'Fornecedor'}</strong></p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const star = i + 1;
                          const filled = star <= (supplierRatingHover || supplierRating);
                          return (
                            <button key={star} type="button" onClick={() => setSupplierRating(star)} onMouseEnter={() => setSupplierRatingHover(star)} onMouseLeave={() => setSupplierRatingHover(0)} className="p-0.5">
                              <Star className={`h-6 w-6 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                          );
                        })}
                        <span className="ml-2 text-sm font-medium">{supplierRating > 0 ? supplierRating.toFixed(1) : '0.0'}</span>
                      </div>
                      <input value={supplierTitle} onChange={(e) => setSupplierTitle(e.target.value)} placeholder="Título (opcional)" maxLength={200} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
                      <textarea value={supplierComment} onChange={(e) => setSupplierComment(e.target.value)} placeholder="Conte sua experiência com o fornecedor..." maxLength={1000} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
                      <button
                        disabled={submittingSupplierReview || supplierRating < 1 || !supplierComment.trim()}
                        onClick={async () => {
                          setSubmittingSupplierReview(true);
                          try {
                            const res = await api.post('/reviews/seller', { orderId: detailOrder.id, rating: supplierRating, title: supplierTitle, comment: supplierComment.trim() });
                            toast.success('Avaliação do fornecedor enviada!');
                            setEvaluatedSupplierOrderIds((prev) => new Set(prev).add(detailOrder.supplierId));
                            // removed
                            setSupplierRating(0); setSupplierComment(''); setSupplierTitle('');
                          } catch (err: any) {
                            const msg = err?.response?.data?.message || 'Erro ao enviar avaliação';
                            const text = Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
                            if (err?.response?.status === 409) setEvaluatedSupplierOrderIds((prev) => new Set(prev).add(detailOrder.supplierId));
                            toast.error(text);
                          } finally { setSubmittingSupplierReview(false); }
                        }}
                        className="btn-primary w-full gap-2"
                      >
                        {submittingSupplierReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />} Enviar avaliação do fornecedor
                      </button>
                    </div>
                    );
                  })()}
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Status</p>
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (statusConfig[detailOrder.status]?.color || 'badge-gray')}>
                  {statusConfig[detailOrder.status]?.label || detailOrder.status}
                </span>
              </div>
              {detailOrder.status === 'DELIVERED' && !detailOrder.confirmedDeliveryAt && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    O produto foi entregue? Confirme o recebimento para poder avaliar o produto e o fornecedor.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await api.post(`/orders/${detailOrder.id}/confirm-delivery`);
                        toast.success('Recebimento confirmado! Agora você pode avaliar o produto e o fornecedor.');
                        const confirmedAt = new Date().toISOString();
                        setDetailOrder((prev) => (prev ? { ...prev, confirmedDeliveryAt: confirmedAt } : null));
                        setOrders((prev) => prev.map((o) => (o.id === detailOrder.id ? { ...o, confirmedDeliveryAt: confirmedAt } : o)));
                      } catch (err: any) {
                        const msg = err?.response?.data?.message || 'Erro ao confirmar recebimento';
                        const text = Array.isArray(msg) ? msg[0] : typeof msg === 'object' && msg !== null ? JSON.stringify(msg) : String(msg);
                        toast.error(text);
                      }
                    }}
                    className="btn-primary w-full gap-2"
                  >
                    <Package className="h-4 w-4" /> Confirmar Recebimento
                  </button>
                </div>
              )}
              <div className="flex justify-end p-5 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => { setDetailOrder(null); setEvaluateTab(null); }} className="btn-outline text-sm">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

