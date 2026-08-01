'use client';

import { useState } from 'react';
import { ShoppingBag, Search, Download, Eye, X, Package, User, DollarSign, CreditCard, Calendar, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

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

const orders: Order[] = [
  { id: '1', orderNumber: 'ABF-2024-0010', status: 'PENDING', total: 45990.00, items: 1, customer: 'Lucas Mendes', createdAt: '29/07/2026', payment: 'Boleto', orderItems: [{ name: 'Drone Agrícola Pulverizador', quantity: 1, price: 45990.00 }] },
  { id: '2', orderNumber: 'ABF-2024-0009', status: 'PENDING', total: 1899.90, items: 2, customer: 'João Silva', createdAt: '29/07/2026', payment: 'Pix', orderItems: [{ name: 'Semente de Soja RR 25kg', quantity: 1, price: 189.90 }, { name: 'Fertilizante NPK 10-10-10 50kg', quantity: 2, price: 1710.00 }] },
  { id: '3', orderNumber: 'ABF-2024-0008', status: 'PROCESSING', total: 7890.00, items: 2, customer: 'Fernanda Almeida', createdAt: '28/07/2026', payment: 'Cartão', orderItems: [{ name: 'Conjunto de Grade Aradora', quantity: 1, price: 7890.00 }] },
  { id: '4', orderNumber: 'ABF-2024-0007', status: 'PROCESSING', total: 3499.90, items: 1, customer: 'Maria Oliveira', createdAt: '28/07/2026', payment: 'Pix', orderItems: [{ name: 'Arado de Disco 4 Discos', quantity: 1, price: 3499.90 }] },
  { id: '5', orderNumber: 'ABF-2024-0006', status: 'SHIPPED', total: 259.90, items: 1, customer: 'Juliana Costa', createdAt: '27/07/2026', payment: 'Pix', orderItems: [{ name: 'Semente de Milho Híbrido 5kg', quantity: 1, price: 259.90 }] },
  { id: '6', orderNumber: 'ABF-2024-0005', status: 'SHIPPED', total: 567.50, items: 1, customer: 'Carlos Pereira', createdAt: '27/07/2026', payment: 'Cartão', orderItems: [{ name: 'Herbicida Glifosato 5L', quantity: 1, price: 567.50 }] },
  { id: '7', orderNumber: 'ABF-2024-0004', status: 'DELIVERED', total: 12589.90, items: 3, customer: 'Ana Souza', createdAt: '25/07/2026', payment: 'Boleto', orderItems: [{ name: 'Fertilizante NPK 10-10-10 50kg', quantity: 3, price: 189.90 }, { name: 'Semente de Soja RR 25kg', quantity: 2, price: 349.90 }, { name: 'Adubo Orgânico 25kg', quantity: 5, price: 49.90 }] },
  { id: '8', orderNumber: 'ABF-2024-0003', status: 'DELIVERED', total: 18990.00, items: 1, customer: 'Roberto Lima', createdAt: '24/07/2026', payment: 'Boleto', orderItems: [{ name: 'Silo Metálico 5000Kg', quantity: 1, price: 18990.00 }] },
  { id: '9', orderNumber: 'ABF-2024-0002', status: 'CANCELLED', total: 2599.80, items: 2, customer: 'Pedro Santos', createdAt: '22/07/2026', payment: 'Cartão', orderItems: [{ name: 'Kit Irrigação por Gotejamento', quantity: 1, price: 1299.90 }, { name: 'Conector para Mangueira', quantity: 5, price: 47.00 }] },
  { id: '10', orderNumber: 'ABF-2024-0001', status: 'CANCELLED', total: 112.30, items: 1, customer: 'João Silva', createdAt: '20/07/2026', payment: 'Pix', orderItems: [{ name: 'Fungicida Tratamento Sementes 1L', quantity: 1, price: 112.30 }] },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
};

export default function SupplierOrdersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    toast.success('Relatório exportado com sucesso!');
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
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="PROCESSING">Processando</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
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
                const statusInfo = statusLabels[order.status] || statusLabels.PENDING;
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
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600" onClick={() => setDetailOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
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
                <p className="text-xs text-gray-500">Status</p>
                <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (statusLabels[detailOrder.status]?.color || '')}>
                  {statusLabels[detailOrder.status]?.label || detailOrder.status}
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
