'use client';

import { useState, useEffect } from 'react';
import { Store, Save, Loader2, Upload, MessageCircle, Wifi, WifiOff, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChatSettings, defaultChatSettings } from '@/lib/chat-settings';
import { api } from '@/lib/api';

export default function SupplierSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<{ id: string; companyName: string; description: string; phone: string; whatsapp: string } | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(defaultChatSettings);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [meRes, chatRes] = await Promise.all([
          api.get('/suppliers/me'),
          api.get('/chat/settings'),
        ]);
        if (cancelled) return;
        const me = meRes.data.data;
        if (!me?.id) {
          toast.error('Loja não encontrada.');
          return;
        }
        setSupplier({
          id: me.id,
          companyName: me.companyName ?? '',
          description: me.description ?? '',
          phone: me.phone ?? '',
          whatsapp: me.whatsapp ?? '',
        });
        const chatData = chatRes.data.data;
        setSettings(
          chatData
            ? {
                online: chatData.online ?? defaultChatSettings.online,
                autoReplyEnabled: chatData.autoReply ?? defaultChatSettings.autoReplyEnabled,
                autoReplyMessage: chatData.autoReplyMessage ?? defaultChatSettings.autoReplyMessage,
                welcomeMessage: chatData.welcomeMessage ?? defaultChatSettings.welcomeMessage,
              }
            : defaultChatSettings,
        );
      } catch (err: any) {
        if (cancelled) return;
        toast.error(err?.response?.data?.message || 'Erro ao carregar configurações.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!supplier?.id) return;
    setIsSaving(true);
    try {
      await Promise.all([
        api.put(`/suppliers/${supplier.id}`, {
          companyName: supplier.companyName,
          description: supplier.description,
          phone: supplier.phone,
          whatsapp: supplier.whatsapp,
        }),
        api.put('/chat/settings', {
          online: settings.online,
          autoReply: settings.autoReplyEnabled,
          autoReplyMessage: settings.autoReplyMessage,
          welcomeMessage: settings.welcomeMessage,
        }),
      ]);
      toast.success('Configurações salvas!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  function updateChat(changes: Partial<ChatSettings>) {
    setSettings((prev) => ({ ...prev, ...changes }));
  }

  return loading ? (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  ) : (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações da Loja</h1>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <div>
          <label className="label-field">Nome da Loja</label>
          <input type="text" className="input-field" value={supplier?.companyName ?? ''} onChange={(e) => setSupplier((p) => (p ? { ...p, companyName: e.target.value } : p))} />
        </div>
        <div>
          <label className="label-field">Descrição</label>
          <textarea rows={3} className="input-field resize-none" value={supplier?.description ?? ''} onChange={(e) => setSupplier((p) => (p ? { ...p, description: e.target.value } : p))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Telefone</label>
            <input type="text" className="input-field" value={supplier?.phone ?? ''} onChange={(e) => setSupplier((p) => (p ? { ...p, phone: e.target.value } : p))} />
          </div>
          <div>
            <label className="label-field">WhatsApp</label>
            <input type="text" className="input-field" value={supplier?.whatsapp ?? ''} onChange={(e) => setSupplier((p) => (p ? { ...p, whatsapp: e.target.value } : p))} />
          </div>
        </div>
        <div>
          <label className="label-field">Logo da Loja</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Clique para enviar uma imagem</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> Configurações do Chat
      </h2>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.online ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Status Online</p>
              <p className="text-xs text-gray-500">Clientes veem se você está disponível para chat</p>
            </div>
          </div>
          <button onClick={() => updateChat({ online: !settings.online })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            {settings.online ? <ToggleRight className="h-7 w-7 text-primary-600" /> : <ToggleLeft className="h-7 w-7" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Resposta Automática</p>
            <p className="text-xs text-gray-500">Enviar resposta automática ao receber mensagem</p>
          </div>
          <button onClick={() => updateChat({ autoReplyEnabled: !settings.autoReplyEnabled })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            {settings.autoReplyEnabled ? <ToggleRight className="h-7 w-7 text-primary-600" /> : <ToggleLeft className="h-7 w-7" />}
          </button>
        </div>

        <div>
          <label className="label-field">Mensagem de Resposta Automática</label>
          <textarea
            rows={2}
            className="input-field resize-none"
            value={settings.autoReplyMessage}
            onChange={(e) => updateChat({ autoReplyMessage: e.target.value })}
          />
        </div>

        <div>
          <label className="label-field">Mensagem de Boas-Vindas</label>
          <input
            type="text"
            className="input-field"
            value={settings.welcomeMessage}
            onChange={(e) => updateChat({ welcomeMessage: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleSave} disabled={isSaving} className="btn-primary gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
