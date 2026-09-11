'use client';

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import {
  Package, Heart, User, MapPin, ShoppingCart, TrendingUp, Clock,
  CheckCircle, XCircle, Loader2, ArrowRight, Store, LogOut,
  Trash2, Edit, MoreVertical,
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'badge-blue' },
  PROCESSING: { label: 'Processando', color: 'badge-blue' },
  SHIPPED: { label: 'Enviado', color: 'badge-green' },
  DELIVERED: { label: 'Entregue', color: 'badge-green' },
  CANCELLED: { label: 'Cancelado', color: 'badge-red' },
};

const quickLinks = [
  { href: '/products', label: 'Produtos', icon: ShoppingCart, description: 'Explorar produtos disponíveis' },
  { href: '/suppliers', label: 'Fornecedores', icon: Store, description: 'Ver fornecedores cadastrados' },
  { href: '/favorites', label: 'Favoritos', icon: Heart, description: 'Seus produtos salvos' },
  { href: '/profile', label: 'Perfil', icon: User, description: 'Editar seus dados pessoais' },
  { href: '/orders', label: 'Pedidos', icon: Package, description: 'Histórico completo de pedidos' },
  { href: '/profile', label: 'Endereços', icon: MapPin, description: 'Gerenciar endereços de entrega' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    cancelledOrders: number;
    deliveredOrders: number;
  }>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, processingOrders: 0, cancelledOrders: 0, deliveredOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/dashboard/supplier/stats'),
          api.get('/dashboard/supplier/sales', { params: { limit: 5 } }),
        ]);
        const s = statsRes.data.data;
        const orders = ordersRes.data.data;

        setStats({
          totalOrders: s.totalOrders || 0,
          totalRevenue: s.totalRevenue || 0,
          pendingOrders: s.pendingOrders || 0,
          processingOrders: s.processingOrders || 0,
          cancelledOrders: s.cancelledOrders || 0,
          deliveredOrders: s.deliveredOrders || 0,
        });
        setRecentOrders(orders.data || []);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container-page py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  const quickLinks = [
    { href: '/products', label: 'Produtos', icon: ShoppingCart, description: 'Explorar produtos disponíveis' },
    { href: '/suppliers', label: 'Fornecedores', icon: Store, description: 'Ver fornecedores cadastrados' },
    { href: '/favorites', label: 'Favoritos', icon: Heart, description: 'Seus produtos salvos' },
    { href: '/profile', label: 'Perfil', icon: User, description: 'Editar seus dados pessoais' },
    { href: '/orders', label: 'Pedidos', icon: Package, description: 'Histórico completo de pedidos' },
    { href: '/profile', label: 'Endereços', icon: MapPin, description: 'Gerenciar endereços de entrega' },
  ];

  return (
    <div className="container-page py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Olá, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500">Bem-vindo ao seu painel de controle</p>
        </div>
        <button onClick={handleLogout} disabled={isLoggingOut} className="btn-outline text-sm gap-2">
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sair
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pedidos Totais', value: stats.totalOrders, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Entregues', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Em Andamento', value: stats.processingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
          { label: 'Cancelados', value: stats.cancelledOrders, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pedidos Recentes</h2>
              <Link href="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum pedido ainda</p>
                  <Link href="/products" className="btn-primary mt-3 inline-flex text-sm">Fazer Pedido</Link>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || statusLabels.PENDING;
                  return (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.items} item(ns) - {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-primary-600">
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={statusInfo.color}>{statusInfo.label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acesso Rápido</h2>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <link.icon className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {user.role === 'SUPPLIER' && (
        <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 p-6">
          <div className="flex items-center gap-4">
            <Store className="h-8 w-8 text-primary-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-primary-900 dark:text-primary-100">Painel do Fornecedor</h3>
              <p className="text-sm text-primary-700 dark:text-primary-300">Gerencie seus produtos, pedidos e sua loja.</p>
            </div>
            <Link href="/supplier/dashboard" className="btn-primary text-sm">
              Acessar Painel
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}