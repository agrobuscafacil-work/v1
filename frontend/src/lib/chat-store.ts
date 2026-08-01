export interface ChatMessage {
  id: string;
  text: string;
  sentByMe: boolean;
  time: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  email?: string;
  subject: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const CONV_KEY = 'agro_chat_conversations';
const MSGS_KEY = 'agro_chat_messages';

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key: string, value: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getAllConversations(): ChatConversation[] {
  return getStorage<ChatConversation[]>(CONV_KEY, []);
}

export function getAllMessages(): Record<string, ChatMessage[]> {
  return getStorage<Record<string, ChatMessage[]>>(MSGS_KEY, {});
}

export function getConversationMessages(convId: string): ChatMessage[] {
  const all = getAllMessages();
  return all[convId] || [];
}

function makeId(): string {
  try { return crypto.randomUUID(); } catch { return Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
}

export function sendMessage(convId: string, text: string, sentByMe: boolean): ChatMessage {
  const msg: ChatMessage = {
    id: makeId(),
    text,
    sentByMe,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
  const all = getAllMessages();
  if (!all[convId]) all[convId] = [];
  all[convId].push(msg);
  setStorage(MSGS_KEY, all);

  const convs = getAllConversations();
  const idx = convs.findIndex((c) => c.id === convId);
  if (idx !== -1) {
    convs[idx].lastMessage = text;
    convs[idx].time = 'Agora mesmo';
    convs[idx].unread = !sentByMe;
    if (sentByMe) {
      const [conv] = convs.splice(idx, 1);
      convs.unshift(conv);
    }
    setStorage(CONV_KEY, convs);
  }
  return msg;
}

export function addConversation(conv: ChatConversation): void {
  const convs = getAllConversations();
  if (!convs.find((c) => c.id === conv.id)) {
    convs.unshift(conv);
    setStorage(CONV_KEY, convs);
  }
}

export function markConversationRead(convId: string): void {
  const convs = getAllConversations().map((c) =>
    c.id === convId ? { ...c, unread: false } : c
  );
  setStorage(CONV_KEY, convs);
}

export function addPendingMessage(msg: { supplierId: string; supplierName: string; customerName: string; customerEmail: string; text: string }): void {
  const convId = 'chat_' + makeId();
  addConversation({
    id: convId,
    name: msg.customerName,
    email: msg.customerEmail,
    subject: 'Chat - ' + msg.supplierName,
    lastMessage: msg.text,
    time: 'Agora mesmo',
    unread: true,
  });
  sendMessage(convId, msg.text, false);
}

export function getPendingMessages() {
  return getAllConversations().filter((c) => c.unread).map((c) => ({
    id: c.id,
    supplierId: 'all',
    supplierName: c.subject.replace('Chat - ', ''),
    customerName: c.name,
    customerEmail: c.email || '',
    text: c.lastMessage,
    timestamp: c.time,
    read: !c.unread,
  }));
}

export function markPendingAsRead(id: string): void {
  markConversationRead(id);
}

export function markAllPendingAsRead(_supplierId: string): void {}

export function clearPendingMessages(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('agro_chat_conversations');
    localStorage.removeItem('agro_chat_messages');
  }
}

export function seedInitialConversations(): void {
  if (process.env.NEXT_PUBLIC_ENABLE_SEED !== 'true') return;
  const convs = getAllConversations();
  if (convs.length > 0) return;

  const seed: ChatConversation[] = [
    { id: 'c1', name: 'João Silva', email: 'joao@email.com', subject: 'Dúvida sobre entrega', lastMessage: 'Meu pedido ABF-2024-0010 ainda não chegou.', time: '5 min atrás', unread: true },
    { id: 'c2', name: 'Fertilizantes ABC', email: 'contato@fertabc.com', subject: 'Aprovação de cadastro', lastMessage: 'Gostaria de saber o status da análise do meu cadastro.', time: '1 hora atrás', unread: true },
    { id: 'c3', name: 'Maria Oliveira', email: 'maria@email.com', subject: 'Troca de produto', lastMessage: 'O produto veio diferente do anunciado.', time: '3 horas atrás', unread: false },
    { id: 'c4', name: 'Agro Tech Ltda', email: 'admin@agrotech.com', subject: 'Atualização de preços', lastMessage: 'Preciso atualizar os preços do catálogo.', time: '1 dia atrás', unread: false },
    { id: 'c5', name: 'Carlos Pereira', email: 'carlos@email.com', subject: 'Cancelamento', lastMessage: 'Solicito o cancelamento do pedido.', time: '2 dias atrás', unread: false },
    { id: 'c6', name: 'Pecuária Forte', email: 'contato@pecuariaforte.com', subject: 'Parceria comercial', lastMessage: 'Temos interesse em anunciar no portal.', time: '3 dias atrás', unread: false },
    { id: 'c7', name: 'Ana Souza', email: 'ana@email.com', subject: 'Reclamação', lastMessage: 'Recebi o produto avariado.', time: '4 dias atrás', unread: false },
    { id: 'c8', name: 'Máquinas Agrícolas LTDA', email: 'contato@maquinasagri.com', subject: 'Disponibilidade', lastMessage: 'O trator 75cv está disponível?', time: '5 dias atrás', unread: false },
  ];
  setStorage(CONV_KEY, seed);

  const seedMsgs: Record<string, ChatMessage[]> = {};
  for (const c of seed) {
    seedMsgs[c.id] = [
      { id: c.id + '_init', text: c.lastMessage, sentByMe: false, time: c.time === '5 min atrás' ? '10:00' : c.time === '1 hora atrás' ? '09:00' : c.time === '3 horas atrás' ? '07:00' : 'Ontem' },
    ];
  }
  seedMsgs['c1'].push({ id: 'c1_reply', text: 'Olá João! Vou verificar o status do seu pedido e retorno em breve.', sentByMe: true, time: 'Agora mesmo' });
  setStorage(MSGS_KEY, seedMsgs);
}
