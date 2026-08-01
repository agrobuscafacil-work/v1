'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Package, Save, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual inválida'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a nova senha'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const MOCK_ORDERS = [
  { id: '1', orderNumber: 'ABF-2024-0001', status: 'DELIVERED', total: 12589.90, items: 3, createdAt: '2024-03-15T10:30:00' },
  { id: '2', orderNumber: 'ABF-2024-0002', status: 'SHIPPED', total: 3499.90, items: 1, createdAt: '2024-03-20T14:00:00' },
  { id: '3', orderNumber: 'ABF-2024-0003', status: 'PROCESSING', total: 899.90, items: 2, createdAt: '2024-03-25T09:15:00' },
];

const MOCK_ADDRESSES = [
  { id: '1', label: 'Fazenda', street: 'Estrada Rural, km 45', city: 'Ribeirão Preto', state: 'SP', zipCode: '14000-000', isMain: true },
  { id: '2', label: 'Escritório', street: 'Av. Principal, 1000', city: 'São Paulo', state: 'SP', zipCode: '01000-000', isMain: false },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'badge-blue' },
  PROCESSING: { label: 'Processando', color: 'badge-blue' },
  SHIPPED: { label: 'Enviado', color: 'badge-green' },
  DELIVERED: { label: 'Entregue', color: 'badge-green' },
  CANCELLED: { label: 'Cancelado', color: 'badge-red' },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'password'>('profile');
  const [saving, setSaving] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Perfil atualizado com sucesso!');
    setSaving(false);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Senha alterada com sucesso!');
    passwordForm.reset();
    setSaving(false);
  };

  const tabs = [
    { key: 'profile' as const, label: 'Meus Dados', icon: User },
    { key: 'orders' as const, label: 'Pedidos', icon: Package },
    { key: 'addresses' as const, label: 'Endereços', icon: MapPin },
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
                onClick={() => setActiveTab(tab.key)}
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
                  <input type="email" className="input-field" {...profileForm.register('email')} />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
                  )}
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
              {MOCK_ORDERS.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Nenhum pedido encontrado.</p>
                  <Link href="/products" className="btn-primary mt-4 inline-flex">Comprar Agora</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {MOCK_ORDERS.map((order) => {
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
                          <Link href={`/orders/${order.id}`} className="btn-ghost text-sm">Detalhes</Link>
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
                <button className="btn-primary text-sm gap-1"><Plus className="h-4 w-4" /> Novo Endereço</button>
              </div>
              <div className="space-y-4">
                {MOCK_ADDRESSES.map((addr) => (
                  <div key={addr.id} className="flex items-start justify-between rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">{addr.label}</p>
                        {addr.isMain && <span className="badge-blue">Principal</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{addr.street}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-ghost p-1.5"><Pencil className="h-4 w-4" /></button>
                      <button className="btn-ghost p-1.5 text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Alterar Senha</h2>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
                <div>
                  <label className="label-field">Senha atual</label>
                  <input type="password" className="input-field" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">Nova senha</label>
                  <input type="password" className="input-field" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-field">Confirmar nova senha</label>
                  <input type="password" className="input-field" {...passwordForm.register('confirmPassword')} />
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
    </div>
  );
}
