'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
import { User, Mail, Phone, MapPin, Lock, Package, Save, Loader2, Plus, Pencil, Trash2, X, CreditCard, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import PasswordInput from '@/components/ui/password-input';
import { api } from '@/lib/api';
import { getCardToken } from '@/lib/card-token';
import Link from 'next/link';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        'Deve conter letra maiúscula, minúscula, número e caractere especial',
      ),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword && data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A nova senha não pode ser igual à senha atual',
        path: ['newPassword'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A nova senha não pode ser igual à senha atual',
        path: ['confirmPassword'],
      });
    }
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface OrderInfo {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

interface AddressInfo {
  id: string;
  label: string;
  street: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  isMain: boolean;
}

interface CardInfo {
  id: string;
  provider: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  expired?: boolean;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'badge-blue' },
  PROCESSING: { label: 'Processando', color: 'badge-blue' },
  SHIPPED: { label: 'Enviado', color: 'badge-green' },
  DELIVERED: { label: 'Entregue', color: 'badge-green' },
  CANCELLED: { label: 'Cancelado', color: 'badge-red' },
};

const emptyAddress = {
  label: '',
  zipCode: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  complement: '',
  isMain: false,
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'password' | 'cards'>('profile');
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressInfo[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    holderName: '',
    expMonth: '',
    expYear: '',
    securityCode: '',
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      profileForm.setValue('name', user.name || '');
      profileForm.setValue('phone', user.phone || '');
    }
  }, [user, profileForm]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders', { params: { limit: 50 } });
      const payload = res.data.data?.data ?? [];
      setOrders(
        payload.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber || o.id.slice(0, 8),
          status: o.status,
          total: Number(o.total) || 0,
          items: Array.isArray(o.items) ? o.items.length : 0,
          createdAt: o.createdAt,
        })),
      );
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await api.get('/shipping/addresses');
      const payload = res.data.data ?? [];
      setAddresses(payload);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const loadCards = async () => {
    setCardsLoading(true);
    try {
      const res = await api.get('/payments/cards');
      const payload = res.data.data ?? [];
      setCards(payload);
    } catch {
      setCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  const onTabChange = (tab: 'profile' | 'orders' | 'addresses' | 'password' | 'cards') => {
    setActiveTab(tab);
    if (tab === 'orders' && orders.length === 0) loadOrders();
    if (tab === 'addresses' && addresses.length === 0) loadAddresses();
    if (tab === 'cards' && cards.length === 0) loadCards();
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', { name: data.name, phone: data.phone });
      setUser(res.data.data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Não foi possível atualizar o perfil';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setSaving(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Senha alterada com sucesso!');
      passwordForm.reset();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Não foi possível alterar a senha';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const submitAddress = async () => {
    if (!newAddress.label || !newAddress.zipCode || !newAddress.street || !newAddress.city || !newAddress.state) {
      toast.error('Preencha os campos obrigatórios do endereço');
      return;
    }
    try {
      await api.post('/shipping/addresses', newAddress);
      toast.success('Endereço adicionado!');
      setAddressModalOpen(false);
      setNewAddress(emptyAddress);
      loadAddresses();
    } catch {
      toast.error('Não foi possível adicionar o endereço');
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await api.delete(`/shipping/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Endereço removido');
    } catch {
      toast.error('Não foi possível remover o endereço');
    }
  };

  const submitCard = async () => {
    const { number, holderName, expMonth, expYear, securityCode } = newCard;
    if (!number.replace(/\D/g, '').match(/^\d{13,19}$/)) {
      toast.error('Número do cartão inválido');
      return;
    }
    if (!holderName.trim()) {
      toast.error('Informe o nome impresso no cartão');
      return;
    }
    if (!/^\d{2}$/.test(expMonth) || !/^\d{4}$/.test(expYear) || !/^\d{3,4}$/.test(securityCode)) {
      toast.error('Preencha validade e código de segurança');
      return;
    }
    setSavingCard(true);
    try {
      const token = await getCardToken({
        number,
        holderName: holderName.trim(),
        expMonth,
        expYear,
        securityCode,
        identification: user?.document || undefined,
      });
      await api.post('/payments/cards', { token });
      toast.success('Cartão adicionado com sucesso!');
      setCardModalOpen(false);
      setNewCard({ number: '', holderName: '', expMonth: '', expYear: '', securityCode: '' });
      loadCards();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Não foi possível adicionar o cartão';
      toast.error(msg);
    } finally {
      setSavingCard(false);
    }
  };

  const removeCard = async (id: string) => {
    try {
      await api.delete(`/payments/cards/${id}`);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success('Cartão removido');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Não foi possível remover o cartão';
      toast.error(msg);
    }
  };

  const setDefaultCard = async (id: string) => {
    try {
      await api.patch(`/payments/cards/${id}/default`);
      setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
      toast.success('Cartão definido como principal');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Não foi possível definir o cartão principal';
      toast.error(msg);
    }
  };

  const tabs = [
    { key: 'profile' as const, label: 'Meus Dados', icon: User },
    { key: 'orders' as const, label: 'Pedidos', icon: Package },
    { key: 'addresses' as const, label: 'Endereços', icon: MapPin },
    { key: 'cards' as const, label: 'Meus Cartões', icon: CreditCard },
    { key: 'password' as const, label: 'Senha', icon: Lock },
  ];

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-4">
            <div className="text-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Usuário'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dados Pessoais</h2>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                <div>
                  <label className="label-field">Nome completo</label>
                  <input type="text" className="input-field" {...profileForm.register('name')} />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">E-mail</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <input type="email" className="input-field bg-gray-50 dark:bg-gray-800" value={user?.email || ''} disabled />
                  </div>
                </div>
                <div>
                  <label className="label-field">Telefone</label>
                  <input type="tel" className="input-field" {...profileForm.register('phone')} />
                  {profileForm.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">Documento</label>
                  <input type="text" className="input-field bg-gray-50 dark:bg-gray-800" value={user?.document || ''} disabled />
                </div>
                <button type="submit" disabled={saving} className="btn-primary gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Alterações
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Histórico de Pedidos</h2>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Nenhum pedido encontrado.</p>
                  <Link href="/products" className="btn-primary mt-4 inline-flex">Comprar Agora</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = statusLabels[order.status] || statusLabels.PENDING;
                    return (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')} - {order.items} item(ns)</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold text-primary-600">
                            R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={statusInfo.color}>{statusInfo.label}</span>
                          <Link href="/orders" className="btn-ghost text-sm">Detalhes</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Endereços</h2>
                <button onClick={() => setAddressModalOpen(true)} className="btn-primary text-sm gap-1"><Plus className="h-4 w-4" /> Novo Endereço</button>
              </div>
              {addressesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Nenhum endereço cadastrado.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="flex items-start justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">{addr.label || 'Endereço'}</p>
                          {addr.isMain && <span className="badge-blue">Principal</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {addr.street}{addr.number ? `, ${addr.number}` : ''}{addr.neighborhood ? ` - ${addr.neighborhood}` : ''}
                        </p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => removeAddress(addr.id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Cartões</h2>
                <button onClick={() => setCardModalOpen(true)} className="btn-primary text-sm gap-1">
                  <Plus className="h-4 w-4" /> Novo Cartão
                </button>
              </div>
              {cardsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : cards.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Nenhum cartão cadastrado.</p>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-start justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {card.brand} •••• {card.last4}
                            </p>
                            {card.isDefault && (
                              <span className="badge-blue flex items-center gap-1">
                                <Star className="h-3 w-3" /> Principal
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Válido até {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                            {card.expired ? ' (vencido)' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!card.isDefault && (
                          <button onClick={() => setDefaultCard(card.id)} className="btn-ghost p-1.5 text-primary-600" title="Definir como principal">
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => removeCard(card.id)} className="btn-ghost p-1.5 text-red-500" title="Remover cartão">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Alterar Senha</h2>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
                <div>
                  <label className="label-field">Senha atual</label>
                  <PasswordInput autoComplete="current-password" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">Nova senha</label>
                  <PasswordInput autoComplete="new-password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">Confirmar nova senha</label>
                  <PasswordInput autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <button type="submit" disabled={saving} className="btn-primary gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Alterar Senha
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCardModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Cartão</h2>
              <button onClick={() => setCardModalOpen(false)} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field">Número do cartão *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="0000 0000 0000 0000"
                  value={newCard.number}
                  onChange={(e) =>
                    setNewCard({ ...newCard, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })
                  }
                />
              </div>
              <div>
                <label className="label-field">Nome impresso no cartão *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Como aparece no cartão"
                  value={newCard.holderName}
                  onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Validade (MM) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-field"
                    placeholder="12"
                    maxLength={2}
                    value={newCard.expMonth}
                    onChange={(e) => setNewCard({ ...newCard, expMonth: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <div>
                  <label className="label-field">Validade (AAAA) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-field"
                    placeholder="2030"
                    maxLength={4}
                    value={newCard.expYear}
                    onChange={(e) => setNewCard({ ...newCard, expYear: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>
              <div>
                <label className="label-field">Código de segurança (CVV) *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="123"
                  maxLength={4}
                  value={newCard.securityCode}
                  onChange={(e) => setNewCard({ ...newCard, securityCode: e.target.value.replace(/\D/g, '') })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Seus dados de cartão são tokenizados com segurança e nunca são armazenados pelo AgroBuscaFácil.
                </p>
              </div>
              <button onClick={submitCard} disabled={savingCard} className="btn-primary w-full gap-2">
                {savingCard ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {savingCard ? 'Salvando...' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddressModalOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Endereço</h2>
              <button onClick={() => setAddressModalOpen(false)} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Identificação *</label>
                  <input type="text" className="input-field" placeholder="Ex.: Fazenda" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                </div>
                <div>
                  <label className="label-field">CEP *</label>
                  <input type="text" className="input-field" placeholder="00000-000" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-field">Rua *</label>
                <input type="text" className="input-field" placeholder="Nome da rua" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Número</label>
                  <input type="text" className="input-field" placeholder="123" value={newAddress.number} onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })} />
                </div>
                <div>
                  <label className="label-field">Complemento</label>
                  <input type="text" className="input-field" placeholder="Apto, bloco..." value={newAddress.complement} onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-field">Bairro</label>
                <input type="text" className="input-field" placeholder="Bairro" value={newAddress.neighborhood} onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Cidade *</label>
                  <input type="text" className="input-field" placeholder="Cidade" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                </div>
                <div>
                  <label className="label-field">Estado *</label>
                  <input type="text" className="input-field" placeholder="UF" maxLength={2} value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={newAddress.isMain} onChange={(e) => setNewAddress({ ...newAddress, isMain: e.target.checked })} className="rounded" />
                Definir como endereço principal
              </label>
              <button onClick={submitAddress} className="btn-primary w-full gap-2">
                <Save className="h-4 w-4" /> Salvar Endereço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
