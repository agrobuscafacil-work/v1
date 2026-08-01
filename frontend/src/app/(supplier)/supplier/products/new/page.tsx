'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Loader2, Upload, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success('Produto cadastrado com sucesso!');
    setIsLoading(false);
    router.push('/supplier/products');
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Produto</h1>
        <p className="text-sm text-gray-500 mt-1">Cadastre um novo produto no seu catálogo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Básicas</h2>
          <div className="space-y-4">
            <div>
              <label className="label-field">Nome do Produto</label>
              <input type="text" required className="input-field" placeholder="Ex: Semente de Soja Transgênica" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Categoria</label>
                <select className="input-field">
                  <option value="">Selecione</option>
                  <option value="sementes">Sementes</option>
                  <option value="fertilizantes">Fertilizantes</option>
                  <option value="defensivos">Defensivos</option>
                  <option value="implementos">Implementos</option>
                  <option value="irrigacao">Irrigação</option>
                </select>
              </div>
              <div>
                <label className="label-field">Unidade</label>
                <select className="input-field">
                  <option value="un">Unidade</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="sc">Saca (sc)</option>
                  <option value="lt">Litro (L)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-field">Descrição</label>
              <textarea rows={4} className="input-field resize-none" placeholder="Descreva o produto em detalhes..." />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preço e Estoque</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Preço (R$)</label>
              <input type="number" step="0.01" required className="input-field" placeholder="0,00" />
            </div>
            <div>
              <label className="label-field">Estoque</label>
              <input type="number" required className="input-field" placeholder="0" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Imagem do Produto</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Arraste uma imagem ou clique para selecionar</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isLoading} className="btn-primary gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isLoading ? 'Salvando...' : 'Salvar Produto'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
