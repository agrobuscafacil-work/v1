'use client';

import { useState } from 'react';
import { Store, Search, CheckCircle, XCircle, Edit2, X, Save, Loader2, MessageCircle, Send, Phone, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getChatSettings } from '@/lib/chat-settings';

interface SupplierItem {
  id: string;
  name: string;
  email: string;
  category: string;
  products: number;
  rating: number;
  status: string;
  date: string;
}

interface ChatMessage {
  id: string;
  sender: 'admin' | 'supplier';
  text: string;
  time: string;
}

const data: SupplierItem[] = [
  { id: '1', name: 'AgroQuímica Brasil', email: 'contato@agroquimica.com.br', category: 'Insumos', products: 78, rating: 4.8, status: 'Aprovado', date: 'Jan/2023' },
  { id: '2', name: 'Sementes Silva', email: 'vendas@sementessilva.com', category: 'Sementes', products: 48, rating: 4.8, status: 'Aprovado', date: 'Jan/2024' },
  { id: '3', name: 'Agro Tech Ltda', email: 'admin@agrotech.com', category: 'Implementos', products: 24, rating: 4.6, status: 'Aprovado', date: 'Mar/2024' },
  { id: '4', name: 'Fertilizantes ABC', email: 'contato@fertabc.com', category: 'Fertilizantes', products: 15, rating: 0, status: 'Pendente', date: 'Jul/2026' },
  { id: '5', name: 'Fazenda Boa Vista', email: 'contato@boavista.com', category: 'Diversos', products: 0, rating: 0, status: 'Pendente', date: 'Jul/2026' },
  { id: '6', name: 'IrrigaFácil', email: 'vendas@irrigafacil.com', category: 'Irrigação', products: 32, rating: 4.9, status: 'Aprovado', date: 'Fev/2024' },
  { id: '7', name: 'Máquinas Agrícolas LTDA', email: 'contato@maquinasagri.com', category: 'Máquinas', products: 18, rating: 4.5, status: 'Aprovado', date: 'Abr/2024' },
  { id: '8', name: 'Defensivos Nacional', email: 'pedidos@defensivosnac.com', category: 'Defensivos', products: 56, rating: 4.7, status: 'Aprovado', date: 'Jun/2023' },
  { id: '9', name: 'Sementes Genetix', email: 'comercial@sementesgenetix.com', category: 'Sementes', products: 34, rating: 4.9, status: 'Aprovado', date: 'Set/2023' },
  { id: '10', name: 'AgroTec Sistemas', email: 'vendas@agrotecsistemas.com', category: 'Tecnologia', products: 12, rating: 4.3, status: 'Aprovado', date: 'Out/2024' },
  { id: '11', name: 'Pecuária Forte', email: 'contato@pecuariaforte.com', category: 'Pecuária', products: 24, rating: 4.5, status: 'Aprovado', date: 'Jul/2026' },
  { id: '12', name: 'Transporte Rural Log', email: 'logistica@transporterural.com', category: 'Logística', products: 5, rating: 4.2, status: 'Aprovado', date: 'Nov/2024' },
  { id: '13', name: 'Armazenagem Total', email: 'admin@armazenagemtotal.com', category: 'Armazenagem', products: 9, rating: 4.4, status: 'Aprovado', date: 'Dez/2024' },
  { id: '14', name: 'Orgânicos do Vale', email: 'contato@organicosdovale.com', category: 'Orgânicos', products: 0, rating: 0, status: 'Pendente', date: 'Jul/2026' },
  { id: '15', name: 'BioDefensivos Naturais', email: 'pedidos@biodefensivos.com', category: 'Defensivos', products: 22, rating: 4.6, status: 'Aprovado', date: 'Mar/2025' },
  { id: '16', name: 'Tratores e Cia', email: 'vendas@tratoresecia.com', category: 'Máquinas', products: 14, rating: 4.5, status: 'Aprovado', date: 'Abr/2025' },
  { id: '17', name: 'IrrigaTech Solutions', email: 'suporte@irrigatech.com', category: 'Irrigação', products: 28, rating: 4.7, status: 'Bloqueado', date: 'Fev/2023' },
  { id: '18', name: 'NutriPlant Fertilizantes', email: 'admin@nutriplant.com', category: 'Fertilizantes', products: 41, rating: 4.8, status: 'Aprovado', date: 'Mai/2023' },
];

export default function AdminSuppliersPage() {
  const [items, setItems] = useState<SupplierItem[]>(data);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<SupplierItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [chatSupplier, setChatSupplier] = useState<SupplierItem | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  function openChat(supplier: SupplierItem) {
    setChatSupplier(supplier);
    setChatMessages([
      { id: '1', sender: 'supplier', text: `Olá! Como posso ajudar?`, time: '10:00' },
    ]);
  }

  function sendChat() {
    if (!chatMessage.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender: 'admin', text: chatMessage.trim(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((prev) => [...prev, msg]);
    setChatMessage('');
    const settings = getChatSettings();
    if (settings.autoReplyEnabled) {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'supplier', text: settings.autoReplyMessage, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      }, 1500);
    }
  }

  const filtered = items.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(s: SupplierItem) {
    setEditItem({ ...s });
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setItems(items.map((s) => (s.id === editItem.id ? editItem : s)));
    toast.success('Fornecedor atualizado');
    setSaving(false);
    setEditItem(null);
  }

  function doApprove(s: SupplierItem) {
    setItems(items.map((x) => (x.id === s.id ? { ...x, status: 'Aprovado' } : x)));
    toast.success('Fornecedor aprovado');
  }

  function doReject(s: SupplierItem) {
    setItems(items.map((x) => (x.id === s.id ? { ...x, status: 'Bloqueado' } : x)));
    toast.success('Fornecedor rejeitado');
  }

  function doToggleStatus(s: SupplierItem) {
    const ns = s.status === 'Aprovado' ? 'Bloqueado' : 'Aprovado';
    setItems(items.map((x) => (x.id === s.id ? { ...x, status: ns } : x)));
    toast.success('Status alterado');
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os fornecedores da plataforma.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar fornecedores..." className="input-field pl-9 text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((supplier) => (
          <div key={supplier.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">{supplier.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{supplier.name}</p>
                <p className="text-xs text-gray-500">{supplier.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (supplier.status === 'Aprovado' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300')}>
                  {supplier.status}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openChat(supplier)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => startEdit(supplier)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.products}</p>
                <p className="text-xs text-gray-500">Produtos</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.rating > 0 ? supplier.rating : '-'}</p>
                <p className="text-xs text-gray-500">Avaliacao</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{supplier.date}</p>
                <p className="text-xs text-gray-500">Desde</p>
              </div>
            </div>
            <div className="flex gap-2">
              {supplier.status === 'Pendente' && (
                <>
                  <button onClick={() => doApprove(supplier)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 transition-colors">
                    <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                  </button>
                  <button onClick={() => doReject(supplier)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 transition-colors">
                    <XCircle className="h-3.5 w-3.5" /> Rejeitar
                  </button>
                </>
              )}
              {supplier.status !== 'Pendente' && (
                <button onClick={() => doToggleStatus(supplier)} className={'flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ' + (supplier.status === 'Aprovado' ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300')}>
                  {supplier.status === 'Aprovado' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  {supplier.status === 'Aprovado' ? 'Bloquear' : 'Ativar'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
          </div>
        )}
      </div>

      {chatSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col" style={{ maxHeight: '560px' }}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600">{chatSupplier.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{chatSupplier.name}</p>
                  <p className="text-xs text-gray-500">{chatSupplier.email}</p>
                </div>
              </div>
              <button onClick={() => setChatSupplier(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {chatMessages.map((msg) => (
                <div key={msg.id} className={'flex ' + (msg.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                  <div className={'max-w-[80%] rounded-xl px-4 py-2 text-sm ' + (msg.sender === 'admin' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm')}>
                    <p>{msg.text}</p>
                    <p className={'text-xs mt-1 ' + (msg.sender === 'admin' ? 'text-primary-100' : 'text-gray-400')}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
              <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Digite sua mensagem..." className="input-field flex-1 text-sm" />
                <button type="submit" disabled={!chatMessage.trim()} className="btn-primary p-2.5 rounded-lg">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Fornecedor</h2>
              <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input type="text" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" value={editItem.email} onChange={(e) => setEditItem({ ...editItem, email: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Categoria</label>
                  <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} className="input-field">
                    <option value="Sementes">Sementes</option>
                    <option value="Fertilizantes">Fertilizantes</option>
                    <option value="Defensivos">Defensivos</option>
                    <option value="Implementos">Implementos</option>
                    <option value="Irrigacao">Irrigacao</option>
                    <option value="Maquinas">Maquinas</option>
                    <option value="Diversos">Diversos</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Status</label>
                  <select value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value })} className="input-field">
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setEditItem(null)} className="btn-outline text-sm">Cancelar</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm gap-2">
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
