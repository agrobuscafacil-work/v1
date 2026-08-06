'use client';

import { useCallback, useEffect, useState } from 'react';
import { Percent, Plus, Trash2, Clock, Loader2, X, Save, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  product: { id: string; name: string; images?: string[] } | null;
  createdAt: string;
}

interface PromoForm {
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const emptyForm: PromoForm = {
  title: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  startDate: '',
  endDate: '',
  active: true,
};

function formatDiscount(p: Promotion) {
  if (p.discountType === 'FIXED') {
    return `R$ ${Number(p.discountValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
  return `${p.discountValue}%`;
}

function promoStatus(p: Promotion): 'active' | 'scheduled' | 'ended' {
  const now = Date.now();
  if (now < new Date(p.startDate).getTime()) return 'scheduled';
  if (now > new Date(p.endDate).getTime()) return 'ended';
  return 'active';
}

export default function SupplierPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions/mine');
      setPromotions(res.data.data ?? []);
    } catch {
      toast.error('Erro ao carregar promoções.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submitForm() {
    if (!form.title.trim()) return toast.error('Informe o título.');
    if (form.discountValue === '') return toast.error('Informe o valor do desconto.');
    if (!form.startDate || !form.endDate) return toast.error('Informe as datas.');
    setSaving(true);
    try {
      await api.post('/promotions', {
        title: form.title.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        active: form.active,
      });
      toast.success('Promoção criada!');
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao criar promoção.');
    } finally {
      setSaving(false);
    }
  }

  async function removePromotion(p: Promotion) {
    if (!window.confirm(`Excluir a promoção "${p.title}"?`)) return;
    setDeleting(p.id);
    try {
      await api.delete(`/promotions/${p.id}`);
      toast.success('Promoção removida');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao remover promoção.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promoções</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie suas ofertas e descontos.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm gap-2 inline-flex items-center">
          <Plus className="h-4 w-4" /> Nova Promoção
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((p) => {
            const status = promoStatus(p);
            return (
              <div key={p.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <div className="flex items-center justify-between mb-3">
                  <Percent className="h-6 w-6 text-primary-600" />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removePromotion(p)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600"
                    >
                      {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                      status === 'scheduled' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>{status === 'active' ? 'Ativa' : status === 'scheduled' ? 'Agendada' : 'Encerrada'}</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{p.title}</p>
                <p className="text-2xl font-bold text-primary-600 mb-3">{formatDiscount(p)}</p>
                <p className="text-sm text-gray-500 mb-2">{p.product?.name || '—'} produtos</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" /> {new Date(p.startDate).toLocaleDateString('pt-BR')} - {new Date(p.endDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            );
          })}
          {promotions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma promoção criada.</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nova Promoção</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo de desconto</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })} className="input-field">
                    <option value="PERCENTAGE">Percentual</option>
                    <option value="FIXED">Valor fixo</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">{form.discountType === 'FIXED' ? 'Valor (R$)' : 'Percentual (%)'}</label>
                  <input type="number" step="0.01" min="0" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Início</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Fim</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                Ativa imediatamente
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setShowForm(false)} disabled={saving} className="btn-outline text-sm">Cancelar</button>
              <button onClick={submitForm} disabled={saving} className="btn-primary text-sm gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
