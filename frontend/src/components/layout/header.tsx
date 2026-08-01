'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Package,
  Heart,
  Store,
  Shield,
  ChevronDown,
  Sprout,
  MessageCircle,
  LifeBuoy,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Notification } from '@/types';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const queryClient = useQueryClient();

  const unreadQuery = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return (data.data?.unreadCount ?? 0) as number;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const notifQuery = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page: 1, limit: 6 } });
      return data.data?.data as Notification[];
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = unreadQuery.data || 0;
  const notifications = notifQuery.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const openNotification = async (notification: Notification) => {
    setNotifOpen(false);
    if (!notification.read) {
      await api.put(`/notifications/${notification.id}/read`).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    }
    const ticketId = notification.data?.ticketId;
    if (ticketId) {
      router.push(`/suporte/${ticketId}`);
    } else {
      router.push('/suporte');
    }
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all').catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative">
              <Image
                src="/logo.jpg"
                alt="AgroBuscaFácil"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900 dark:text-white">
              Agro<span className="text-primary-600">BuscaFácil</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar produtos, fornecedores, serviços..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-4"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/favorites"
              className="btn-ghost p-2"
              aria-label="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              className="btn-ghost p-2 relative"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {totalItems()}
              </span>
            </Link>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-ghost p-2"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setUserMenuOpen(false);
                    }}
                    className="btn-ghost p-2 relative"
                    aria-label="Notificações"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setNotifOpen(false)}
                      />
                      <div className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg animate-slide-down">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Notificações
                          </p>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                              Marcar todas como lidas
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-gray-500">
                              Nenhuma notificação.
                            </p>
                          ) : (
                            notifications.map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => openNotification(notification)}
                                className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                  notification.read
                                    ? 'opacity-60'
                                    : ''
                                }`}
                              >
                                <div
                                  className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                                    notification.read ? 'bg-transparent' : 'bg-primary-500'
                                  }`}
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-[10px] text-gray-400">
                                    {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 btn-ghost px-3 py-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-green-100 dark:from-primary-900 dark:to-green-900 text-primary-700 dark:text-primary-300 text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg animate-slide-down">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          Meus Pedidos
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          Favoritos
                        </Link>
                        {user?.role === 'SUPPLIER' && (
                          <Link
                            href="/supplier/dashboard"
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            Painel do Fornecedor
                          </Link>
                        )}
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            Painel Administrativo
                          </Link>
                        )}
                        <Link
                          href="/chat"
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Meu Perfil
                        </Link>
                        <Link
                          href="/suporte"
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LifeBuoy className="h-4 w-4" />
                          Meus Relatos
                        </Link>
                        <Link
                          href="/suporte/novo"
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LifeBuoy className="h-4 w-4" />
                          Relatar Problema
                        </Link>
                      </div>
                      <div className="p-1 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                      </div>
                    </>
                  )}
              </div>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm shadow-sm">
                Entrar
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost p-2"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-down">
          <div className="container-page py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </form>
            <nav className="space-y-1">
              <Link
                href="/categories"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categorias
              </Link>
              <Link
                href="/products"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link
                href="/suppliers"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fornecedores
              </Link>
              <Link
                href="/services"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Serviços
              </Link>
              <Link
                href="/about"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre Nós
              </Link>
              <Link
                href="/contact"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </Link>
              <Link
                href="/suporte/novo"
                className="block rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Suporte
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
