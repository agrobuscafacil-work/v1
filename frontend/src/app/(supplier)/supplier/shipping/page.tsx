'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, MapPin, Loader2, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ShippingMethod {
  name: string;
  baseCost: number;
  freeShippingMin?: number;
  costPerKg?: number;
  estimatedDays: number;
  active?: boolean;
}

type DeliveryInfo = { methods: ShippingMethod[]; [key: string]: any };

export default function SupplierShippingPage() {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({ methods: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newDays, setNewDays] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await api.get('/suppliers/me');
        const id = me.data.data.id;
        if (!id) throw new Error('no supplier');
        setSupplierId(id);
        const res = await api.get(`/shipping/config/${id}`);
        if (cancelled) return;
        setDeliveryInfo(res.data.data || { methods: [] });
      } catch (err: any) {
        if (cancelled) return;
        toast.error(err?.response?.data?.error?.message || 'Erro ao carregar fretes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveConfig(next: DeliveryInfo) {
    if (!supplierId) return false;
    setSaving(true);
    try {
      const res = await api.put(`/shipping/config/${supplierId}`, next);
      setDeliveryInfo(res.data.data || next);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Erro ao salvar fretes.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addMethod() {
    if (!newName.trim()) return toast.error('Informe o nome do frete.');
    const cost = parseFloat(newCost);
    if (isNaN(cost) || cost < 0) return toast.error('Informe um custo base válido.');
    const days = parseInt(newDays) || 0;
    const method: ShippingMethod = {
      name: newName.trim(),
      baseCost: cost,
      estimatedDays: days,
      active: true,
    };
    const ok = await saveConfig({ ...deliveryInfo, methods: [...(deliveryInfo.methods || []), method] });
    if (ok) {
      toast.success('Frete adicionado!');
      setNewName('');
      setNewCost('');
      setNewDays('');
      setShowForm(false);
    }
  }

  async function toggleMethod(index: number) {
    const methods = (deliveryInfo.methods || []).map((m, i) =>
      i === index ? { ...m, active: !m.active } : m,
    );
    const ok = await saveConfig({ ...deliveryInfo, methods });
    if (ok) toast.success('Status atualizado');
  }

  async function deleteMethod(index: number) {
    const methods = (deliveryInfo.methods || []).filter((_, i) => i !== index);
    const ok = await saveConfig({ ...deliveryInfo, methods });
    if (ok) toast.success('Frete removido');
  }

  function formatMoney(value: number) {
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  const methods = deliveryInfo.methods || [];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fretes</h1>
          <p className="text-sm text-gray-500 mt-1">Configure opções de frete para sua loja.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          disabled={saving}
          className="btn-primary text-sm gap-2 inline-flex items-center"
        >
          <Plus className="h-4 w-4" /> Novo Frete
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex.: Transportadora ABC"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Custo base (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="25.90"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Prazo (dias)</label>
              <input
                type="number"
                min="0"
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
                placeholder="3"
                className="input-field"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={addMethod} disabled={saving} className="btn-primary text-sm gap-2 inline-flex items-center">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Salvando...' : 'Salvar Frete'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : methods.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
          <Truck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum método de frete configurado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((m, index) => (
            <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className={`h-6 w-6 ${m.active === false ? 'text-gray-300' : 'text-primary-600'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {m.freeShippingMin
                          ? `Frete grátis a partir de R$ ${formatMoney(m.freeShippingMin)}`
                          : `${m.estimatedDays} dias`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">R$ {Number(m.baseCost).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {m.costPerKg ? `+ R$ ${Number(m.costPerKg).toFixed(2)}/kg` : `${m.estimatedDays} dias`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => toggleMethod(index)}
                  disabled={saving}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    m.active === false
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                  }`}
                >
                  {m.active === false ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4 text-primary-600" />}
                  {m.active === false ? 'Inativo' : 'Ativo'}
                </button>
                <button
                  onClick={() => deleteMethod(index)}
                  disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
