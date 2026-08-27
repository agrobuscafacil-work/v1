'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Save, Loader2, Upload, MessageCircle, Wifi, WifiOff, ToggleLeft, ToggleRight, MapPin, LocateFixed, Clock } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ChatSettings, defaultChatSettings } from '@/lib/chat-settings';
import { api } from '@/lib/api';
import { PRODUCT_FILE_URL } from '@/lib/products';

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

interface StoreAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

const emptyAddress: StoreAddress = {
  zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: 'Brasil', latitude: null, longitude: null,
};

interface WorkingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

const WEEK_DAYS = [
  { dayOfWeek: 1, label: 'Segunda-feira' },
  { dayOfWeek: 2, label: 'Terça-feira' },
  { dayOfWeek: 3, label: 'Quarta-feira' },
  { dayOfWeek: 4, label: 'Quinta-feira' },
  { dayOfWeek: 5, label: 'Sexta-feira' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 0, label: 'Domingo' },
];

const defaultWorkingHours: WorkingHour[] = WEEK_DAYS.map(({ dayOfWeek }) => ({ dayOfWeek, openTime: '08:00', closeTime: '18:00', isOpen: dayOfWeek > 0 && dayOfWeek < 6 }));

export default function SupplierSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<{ id: string; companyName: string; description: string; phone: string; whatsapp: string; logoUrl: string } | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(defaultChatSettings);
  const [address, setAddress] = useState<StoreAddress>(emptyAddress);
  const [locating, setLocating] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(defaultWorkingHours);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [meRes, chatRes, hoursRes] = await Promise.all([
          api.get('/suppliers/me'),
          api.get('/chat/settings'),
          api.get('/suppliers/me/working-hours'),
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
          logoUrl: me.logoUrl ?? '',
        });
        const savedAddress = me.addresses?.[0];
        if (savedAddress) {
          setAddress({
            zipCode: savedAddress.zipCode ?? '',
            street: savedAddress.street ?? '',
            number: savedAddress.number ?? '',
            complement: savedAddress.complement ?? '',
            neighborhood: savedAddress.neighborhood ?? '',
            city: savedAddress.city ?? '',
            state: savedAddress.state ?? '',
            country: savedAddress.country ?? 'Brasil',
            latitude: savedAddress.latitude == null ? null : Number(savedAddress.latitude),
            longitude: savedAddress.longitude == null ? null : Number(savedAddress.longitude),
          });
        }
        const savedHours = hoursRes.data.data;
        if (Array.isArray(savedHours) && savedHours.length > 0) {
          setWorkingHours(defaultWorkingHours.map((defaultHour) => {
            const saved = savedHours.find((hour: WorkingHour) => hour.dayOfWeek === defaultHour.dayOfWeek);
            return saved ? { dayOfWeek: saved.dayOfWeek, openTime: saved.openTime || '08:00', closeTime: saved.closeTime || '18:00', isOpen: !!saved.isOpen } : defaultHour;
          }));
        }
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
      const hasAddress = [address.zipCode, address.street, address.number, address.complement, address.neighborhood, address.city, address.state].some((value) => value !== '');
      if (hasAddress && (!address.zipCode || !address.street || !address.number || !address.neighborhood || !address.city || address.state.length !== 2)) {
        toast.error('Preencha o endereço completo antes de salvar.');
        return;
      }
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
        ...(hasAddress ? [api.put('/suppliers/me/store-address', address)] : []),
        api.put('/suppliers/me/working-hours', { hours: workingHours }),
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

  function updateWorkingHour(dayOfWeek: number, changes: Partial<WorkingHour>) {
    setWorkingHours((current) => current.map((hour) => hour.dayOfWeek === dayOfWeek ? { ...hour, ...changes } : hour));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error('Seu navegador não oferece localização.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setAddress((current) => ({ ...current, latitude: Number(coords.latitude.toFixed(7)), longitude: Number(coords.longitude.toFixed(7)) }));
        setLocating(false);
        toast.success('Localização atual capturada. Salve para publicar na loja.');
      },
      () => {
        setLocating(false);
        toast.error('Não foi possível obter sua localização. Permita o acesso e tente novamente.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  async function handleLogoChange(file?: File) {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      toast.error('A logo deve estar no formato PNG, JPG, WebP ou GIF.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error('A logo deve ter no máximo 5 MB.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/suppliers/me/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSupplier((current) => current ? { ...current, logoUrl: response.data.data.logoUrl } : current);
      toast.success('Logo atualizada com sucesso.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Não foi possível enviar a logo.');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
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
          <label className="label-field">Sobre a Loja</label>
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
          <input ref={logoInputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => handleLogoChange(e.target.files?.[0])} />
          <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary-400 transition-colors disabled:opacity-60">
            {supplier?.logoUrl ? <Image src={PRODUCT_FILE_URL(supplier.logoUrl)} alt="Logo da loja" width={96} height={96} className="h-24 w-24 object-contain mx-auto mb-2 rounded-lg" /> : <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />}
            <span className="text-sm text-gray-500">{uploadingLogo ? 'Enviando...' : supplier?.logoUrl ? 'Clique para substituir a logo' : 'Clique para enviar uma imagem'}</span>
          </button>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" /> Endereço e localização da loja
      </h2>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1"><label className="label-field">CEP</label><input className="input-field" value={address.zipCode} maxLength={9} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label-field">Rua</label><input className="input-field" value={address.street} maxLength={200} onChange={(e) => setAddress({ ...address, street: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="label-field">Número</label><input className="input-field" value={address.number} maxLength={30} onChange={(e) => setAddress({ ...address, number: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label-field">Complemento</label><input className="input-field" value={address.complement} maxLength={100} onChange={(e) => setAddress({ ...address, complement: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="label-field">Bairro</label><input className="input-field" value={address.neighborhood} maxLength={100} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} /></div>
          <div><label className="label-field">Cidade</label><input className="input-field" value={address.city} maxLength={100} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
          <div><label className="label-field">Estado (UF)</label><input className="input-field" value={address.state} maxLength={2} onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="button" onClick={useCurrentLocation} disabled={locating} className="btn-outline gap-2">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            {locating ? 'Obtendo localização...' : 'Usar localização atual'}
          </button>
          {address.latitude != null && address.longitude != null && <span className="text-xs text-green-600">Localização capturada: {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}</span>}
        </div>
        <p className="text-xs text-gray-500">A localização é compartilhada com os clientes somente após você salvar. O navegador solicitará sua permissão.</p>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" /> Horário de Funcionamento
      </h2>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
        {WEEK_DAYS.map(({ dayOfWeek, label }) => {
          const hour = workingHours.find((item) => item.dayOfWeek === dayOfWeek) ?? defaultWorkingHours[0];
          return (
            <div key={dayOfWeek} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2 border-b last:border-0 border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={hour.isOpen} onChange={(e) => updateWorkingHour(dayOfWeek, { isOpen: e.target.checked })} />
                Aberto
              </label>
              <input aria-label={`Abertura ${label}`} type="time" value={hour.openTime} disabled={!hour.isOpen} onChange={(e) => updateWorkingHour(dayOfWeek, { openTime: e.target.value })} className="input-field sm:w-32 disabled:opacity-50" />
              <input aria-label={`Fechamento ${label}`} type="time" value={hour.closeTime} disabled={!hour.isOpen} onChange={(e) => updateWorkingHour(dayOfWeek, { closeTime: e.target.value })} className="input-field sm:w-32 disabled:opacity-50" />
            </div>
          );
        })}
        <p className="text-xs text-gray-500 pt-2">Desmarque “Aberto” nos dias em que a loja não funciona. As alterações são salvas junto com as demais configurações.</p>
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
