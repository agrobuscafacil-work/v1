'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, Bell, Shield, Globe, Palette, CreditCard, Mail, Send, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { api } from '@/lib/api';

const DEFAULTS: Record<string, any> = {
  platformName: 'AgroBuscaFácil',
  platformDescription: 'Marketplace do agronegócio brasileiro.',
  baseUrl: 'https://agrobuscafacil.com.br',
  defaultCommission: 5,
  notificationsEmail: true,
  notificationsNewOrders: true,
  notificationsSupplierApproval: true,
  notificationsWeeklyReports: true,
  security2fa: true,
  securityAutoLock: true,
  securityAuditLogs: true,
  theme: 'system',
  primaryColor: '#059669',
  paymentGateway: 'stripe',
  paymentMaxInstallments: 12,
  paymentMinInstallment: 100,
  creditCardEnabled: true,
  pixEnabled: true,
  boletoEnabled: true,
  stripePublishableKey: '',
};

const EMAIL_DEFAULTS = {
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  smtpSecure: 'tls',
};

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Record<string, any>>(DEFAULTS);
  const [emailForm, setEmailForm] = useState<Record<string, any>>(EMAIL_DEFAULTS);
  const [emailMeta, setEmailMeta] = useState<{ passwordConfigured?: boolean; source?: Record<string, string> }>({});
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [providerStatus, setProviderStatus] = useState<{ stripeConfigured?: boolean; mercadopagoEnabled?: boolean }>({});
  const [stripeTesting, setStripeTesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [res, emailRes, payRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/settings/email').catch(() => null),
          api.get('/admin/settings/payments').catch(() => null),
        ]);
        setSettings({ ...DEFAULTS, ...(res.data.data ?? {}) });
        const emailData = emailRes?.data?.data;
        if (emailData) {
          setEmailForm({
            smtpHost: emailData.smtpHost ?? '',
            smtpPort: emailData.smtpPort ?? 587,
            smtpUser: emailData.smtpUser ?? '',
            smtpPass: '',
            smtpFrom: emailData.smtpFrom ?? '',
            smtpSecure: emailData.smtpSecure ?? 'tls',
          });
          setEmailMeta({ passwordConfigured: emailData.passwordConfigured, source: emailData.source });
        }
        const payData = payRes?.data?.data;
        if (payData) {
          setSettings((prev) => ({
            ...prev,
            paymentGateway: payData.gateway ?? prev.paymentGateway,
            creditCardEnabled: payData.creditCardEnabled ?? prev.creditCardEnabled,
            pixEnabled: payData.pixEnabled ?? prev.pixEnabled,
            boletoEnabled: payData.boletoEnabled ?? prev.boletoEnabled,
            paymentMaxInstallments: payData.maxInstallments ?? prev.paymentMaxInstallments,
            paymentMinInstallment: payData.minInstallmentAmount ?? prev.paymentMinInstallment,
            stripePublishableKey: payData.stripePublishableKey ?? prev.stripePublishableKey,
          }));
          setProviderStatus(payData.providers ?? {});
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setField = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        settings: {
          platformName: settings.platformName,
          platformDescription: settings.platformDescription,
          baseUrl: settings.baseUrl,
          defaultCommission: Number(settings.defaultCommission),
          notificationsEmail: settings.notificationsEmail,
          notificationsNewOrders: settings.notificationsNewOrders,
          notificationsSupplierApproval: settings.notificationsSupplierApproval,
          notificationsWeeklyReports: settings.notificationsWeeklyReports,
          security2fa: settings.security2fa,
          securityAutoLock: settings.securityAutoLock,
          securityAuditLogs: settings.securityAuditLogs,
          theme: settings.theme,
          primaryColor: settings.primaryColor,
          paymentGateway: settings.paymentGateway,
          paymentMaxInstallments: Number(settings.paymentMaxInstallments),
          paymentMinInstallment: Number(settings.paymentMinInstallment),
        },
      };
      const res = await api.put('/admin/settings', payload);
      setSettings({ ...DEFAULTS, ...(res.data.data ?? {}) });
      try {
        await api.put('/admin/settings/payments', {
          gateway: settings.paymentGateway,
          creditCardEnabled: !!settings.creditCardEnabled,
          pixEnabled: !!settings.pixEnabled,
          boletoEnabled: !!settings.boletoEnabled,
          maxInstallments: Number(settings.paymentMaxInstallments),
          minInstallmentAmount: Number(settings.paymentMinInstallment),
          stripePublishableKey: settings.stripePublishableKey || undefined,
        });
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erro ao salvar configurações de pagamento');
        return;
      }
      toast.success('Configurações salvas!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const saveEmailSettings = async () => {
    setEmailSaving(true);
    try {
      const payload: Record<string, any> = {
        smtpHost: emailForm.smtpHost,
        smtpPort: Number(emailForm.smtpPort),
        smtpUser: emailForm.smtpUser,
        smtpFrom: emailForm.smtpFrom,
        smtpSecure: emailForm.smtpSecure,
      };
      if (emailForm.smtpPass) payload.smtpPass = emailForm.smtpPass;
      const res = await api.put('/admin/settings/email', payload);
      const data = res.data.data ?? {};
      setEmailForm({
        smtpHost: data.smtpHost ?? '',
        smtpPort: data.smtpPort ?? 587,
        smtpUser: data.smtpUser ?? '',
        smtpPass: '',
        smtpFrom: data.smtpFrom ?? '',
        smtpSecure: data.smtpSecure ?? 'tls',
      });
      setEmailMeta({ passwordConfigured: data.passwordConfigured, source: data.source });
      toast.success('Configurações de e-mail salvas!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao salvar configurações de e-mail');
    } finally {
      setEmailSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testTo.trim()) {
      toast.error('Informe o e-mail de destino para o teste.');
      return;
    }
    setEmailTesting(true);
    try {
      const res = await api.post('/admin/settings/email/test', { to: testTo.trim() });
      toast.success(res.data.data?.message || 'E-mail de teste enviado!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Falha ao enviar e-mail de teste');
    } finally {
      setEmailTesting(false);
    }
  };

  const testStripe = async () => {
    setStripeTesting(true);
    try {
      const res = await api.post('/admin/settings/payments/test-stripe');
      const data = res.data.data ?? {};
      toast.success(`Stripe OK${data.livemode === false ? ' (modo teste)' : ''}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Falha ao conectar no Stripe');
    } finally {
      setStripeTesting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Gerais', icon: Settings },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

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
                <input type="text" className="input-field" value={settings.platformName} onChange={(e) => setField('platformName', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label-field">Descrição</label>
                <textarea rows={3} className="input-field resize-none" value={settings.platformDescription} onChange={(e) => setField('platformDescription', e.target.value)} />
              </div>
              <div>
                <label className="label-field">URL Base</label>
                <input type="text" className="input-field" value={settings.baseUrl} onChange={(e) => setField('baseUrl', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Comissão Padrão (%)</label>
                <input type="number" className="input-field" value={Number(settings.defaultCommission)} onChange={(e) => setField('defaultCommission', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de E-mail (SMTP)</h2>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-xs text-blue-700 dark:text-blue-300">
              Os e-mails de confirmação de cadastro, recuperação de senha e boas-vindas usam estas configurações.
              Campos marcados como <strong>banco de dados</strong> sobrescrevem o `.env` do servidor.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Servidor SMTP</label>
                <input type="text" className="input-field" placeholder="smtp.gmail.com" value={emailForm.smtpHost} onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })} />
                {emailMeta.source?.smtpHost && <p className="text-xs text-gray-500 mt-1">Origem: {emailMeta.source.smtpHost === 'database' ? 'banco de dados' : '.env'}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Porta</label>
                  <input type="number" className="input-field" value={emailForm.smtpPort} onChange={(e) => setEmailForm({ ...emailForm, smtpPort: e.target.value })} />
                </div>
                <div>
                  <label className="label-field">Segurança</label>
                  <select className="input-field" value={emailForm.smtpSecure} onChange={(e) => setEmailForm({ ...emailForm, smtpSecure: e.target.value })}>
                    <option value="tls">TLS (587)</option>
                    <option value="ssl">SSL (465)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">Usuário SMTP</label>
                <input type="text" className="input-field" placeholder="contato@seudominio.com" value={emailForm.smtpUser} onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })} />
              </div>
              <div>
                <label className="label-field">Senha SMTP</label>
                <input type="password" className="input-field" placeholder={emailMeta.passwordConfigured ? '•••••• (configurada — preencha só para trocar)' : 'Senha ou senha de app'} value={emailForm.smtpPass} onChange={(e) => setEmailForm({ ...emailForm, smtpPass: e.target.value })} autoComplete="new-password" />
                {emailMeta.passwordConfigured && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Senha configurada</p>}
              </div>
              <div className="col-span-2">
                <label className="label-field">Remetente (From)</label>
                <input type="text" className="input-field" placeholder="noreply@seudominio.com" value={emailForm.smtpFrom} onChange={(e) => setEmailForm({ ...emailForm, smtpFrom: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={saveEmailSettings} disabled={emailSaving} className="btn-primary gap-2 text-sm">
                {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {emailSaving ? 'Salvando...' : 'Salvar E-mail'}
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Testar envio</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" className="input-field flex-1" placeholder="destino@exemplo.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <button onClick={sendTestEmail} disabled={emailTesting} className="btn-outline gap-2 text-sm">
                  {emailTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {emailTesting ? 'Enviando...' : 'Enviar teste'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de Notificações</h2>
            <div className="space-y-3">
              {[
                { key: 'notificationsEmail', label: 'Notificações por e-mail', desc: 'Enviar e-mails automáticos para usuários' },
                { key: 'notificationsNewOrders', label: 'Novos pedidos', desc: 'Notificar fornecedores sobre novos pedidos' },
                { key: 'notificationsSupplierApproval', label: 'Aprovação de cadastro', desc: 'Notificar quando um fornecedor for aprovado' },
                { key: 'notificationsWeeklyReports', label: 'Relatórios semanais', desc: 'Enviar relatórios de desempenho toda semana' },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={!!settings[item.key]} onChange={(e) => setField(item.key, e.target.checked)} className="accent-primary-600 h-4 w-4" />
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
                { key: 'security2fa', label: 'Autenticação de dois fatores', desc: 'Exigir 2FA para administradores' },
                { key: 'securityAutoLock', label: 'Bloqueio automático', desc: 'Bloquear conta após 5 tentativas de login' },
                { key: 'securityAuditLogs', label: 'Logs de auditoria', desc: 'Registrar todas as ações de administradores' },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={!!settings[item.key]} onChange={(e) => setField(item.key, e.target.checked)} className="accent-primary-600 h-4 w-4" />
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
                <select className="input-field" value={settings.theme} onChange={(e) => setField('theme', e.target.value)}>
                  <option value="system">Sistema</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
              <div>
                <label className="label-field">Cor Primária</label>
                <input type="color" className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" value={settings.primaryColor} onChange={(e) => setField('primaryColor', e.target.value)} />
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
                <select className="input-field" value={settings.paymentGateway} onChange={(e) => setField('paymentGateway', e.target.value)}>
                  <option value="stripe">Stripe</option>
                  <option value="pagseguro">PagSeguro</option>
                  <option value="mercado-pago">Mercado Pago</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Meios de pagamento ativos no checkout</label>
                <div className="space-y-2">
                  {[
                    { key: 'creditCardEnabled', label: 'Cartão de Crédito', desc: 'Via Stripe Checkout' },
                    { key: 'pixEnabled', label: 'Pix', desc: 'Via Stripe Checkout' },
                    { key: 'boletoEnabled', label: 'Boleto Bancário', desc: 'Via Stripe Checkout' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input type="checkbox" checked={!!settings[item.key]} onChange={(e) => setField(item.key, e.target.checked)} className="accent-primary-600 h-4 w-4" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Status dos provedores</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${providerStatus.stripeConfigured ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                    {providerStatus.stripeConfigured ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    Stripe {providerStatus.stripeConfigured ? 'configurado' : 'sem chave'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${providerStatus.mercadopagoEnabled ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    Mercado Pago {providerStatus.mercadopagoEnabled ? 'ativo' : 'inativo'}
                  </span>
                </div>
                <button onClick={testStripe} disabled={stripeTesting} className="btn-outline gap-2 text-sm mt-3">
                  {stripeTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {stripeTesting ? 'Testando...' : 'Testar conexão Stripe'}
                </button>
                <p className="text-xs text-gray-500 mt-2">As chaves secretas (Stripe/Mercado Pago) continuam em variáveis de ambiente no servidor e nunca ficam expostas aqui.</p>
              </div>
              <div className="col-span-2">
                <label className="label-field">Chave pública do Stripe (opcional)</label>
                <input type="text" className="input-field" placeholder="pk_test_..." value={settings.stripePublishableKey || ''} onChange={(e) => setField('stripePublishableKey', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Parcelamento máximo</label>
                <input type="number" className="input-field" value={Number(settings.paymentMaxInstallments)} onChange={(e) => setField('paymentMaxInstallments', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Valor mínimo para parcelar</label>
                <input type="number" className="input-field" value={Number(settings.paymentMinInstallment)} onChange={(e) => setField('paymentMinInstallment', e.target.value)} />
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
