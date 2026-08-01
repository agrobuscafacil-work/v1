'use client';

import { useState } from 'react';
import { Settings, Save, Loader2, Bell, Shield, Globe, Palette, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Configurações salvas!');
    setIsSaving(false);
  };

  const tabs = [
    { id: 'general', label: 'Gerais', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie as configurações da plataforma.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações Gerais</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-field">Nome da Plataforma</label>
                <input type="text" className="input-field" defaultValue="AgroBuscaFácil" />
              </div>
              <div className="col-span-2">
                <label className="label-field">Descrição</label>
                <textarea rows={3} className="input-field resize-none" defaultValue="Marketplace do agronegócio brasileiro." />
              </div>
              <div>
                <label className="label-field">URL Base</label>
                <input type="text" className="input-field" defaultValue="https://agrobuscafacil.com.br" />
              </div>
              <div>
                <label className="label-field">Comissão Padrão (%)</label>
                <input type="number" className="input-field" defaultValue={5} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de Notificações</h2>
            <div className="space-y-3">
              {[
                { label: 'Notificações por e-mail', desc: 'Enviar e-mails automáticos para usuários' },
                { label: 'Novos pedidos', desc: 'Notificar fornecedores sobre novos pedidos' },
                { label: 'Aprovação de cadastro', desc: 'Notificar quando um fornecedor for aprovado' },
                { label: 'Relatórios semanais', desc: 'Enviar relatórios de desempenho toda semana' },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary-600 h-4 w-4" />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de Segurança</h2>
            <div className="space-y-3">
              {[
                { label: 'Autenticação de dois fatores', desc: 'Exigir 2FA para administradores' },
                { label: 'Bloqueio automático', desc: 'Bloquear conta após 5 tentativas de login' },
                { label: 'Logs de auditoria', desc: 'Registrar todas as ações de administradores' },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary-600 h-4 w-4" />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aparência</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Tema Padrão</label>
                <select className="input-field">
                  <option value="system">Sistema</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
              <div>
                <label className="label-field">Cor Primária</label>
                <input type="color" className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" defaultValue="#059669" />
              </div>
              <div>
                <label className="label-field">Logo</label>
                <button className="btn-outline text-sm w-full">Alterar Logo</button>
              </div>
              <div>
                <label className="label-field">Favicon</label>
                <button className="btn-outline text-sm w-full">Alterar Favicon</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de Pagamento</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-field">Gateway de Pagamento</label>
                <select className="input-field">
                  <option value="stripe">Stripe</option>
                  <option value="pagseguro">PagSeguro</option>
                  <option value="mercado-pago">Mercado Pago</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Chave de API</label>
                <input type="password" className="input-field" defaultValue="sk_live_xxxxxxxxxxxxx" />
              </div>
              <div>
                <label className="label-field">Parcelamento máximo</label>
                <input type="number" className="input-field" defaultValue={12} />
              </div>
              <div>
                <label className="label-field">Valor mínimo para parcelar</label>
                <input type="number" className="input-field" defaultValue={100} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleSave} disabled={isSaving} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}
