import { api } from './api';

export interface ChatConversation {
  id: string;
  supplierId: string;
  customerId: string;
  subject?: string | null;
  otherPartyName: string;
  lastMessage?: string;
  updatedAt: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  sentByMe: boolean;
  createdAt: string;
}

export interface ChatSupplierSettings {
  online: boolean;
  autoReply?: boolean;
  autoReplyMessage?: string | null;
  welcomeMessage?: string | null;
}

interface RawConversation {
  id: string;
  supplierId: string;
  customerId: string;
  subject?: string | null;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: RawMessage[];
  customer?: { id: string; name: string };
  supplier?: { id: string; companyName: string; tradingName?: string | null };
}

interface RawMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
}

function adaptConversation(raw: RawConversation, myUserId: string): ChatConversation {
  const last = raw.messages?.[0];
  const otherPartyName =
    raw.supplier && raw.customerId !== myUserId
      ? (raw.supplier.tradingName ?? raw.supplier.companyName)
      : (raw.customer?.name ?? 'Cliente');
  const lastMessageWasOther = last ? last.senderId !== myUserId : false;
  return {
    id: raw.id,
    supplierId: raw.supplierId,
    customerId: raw.customerId,
    subject: raw.subject,
    otherPartyName,
    lastMessage: last?.content,
    updatedAt: raw.updatedAt,
    unread: last ? !last.readAt && lastMessageWasOther : false,
  };
}

export async function fetchConversations(myUserId: string): Promise<ChatConversation[]> {
  const res = await api.get('/chat/conversations');
  const conversations: RawConversation[] = res.data.data ?? [];
  return conversations.map((c) => adaptConversation(c, myUserId));
}

export async function fetchConversationMessages(conversationId: string, myUserId: string): Promise<ChatMessage[]> {
  const res = await api.get(`/chat/conversations/${conversationId}`);
  const conversation = res.data.data as RawConversation;
  return (conversation.messages ?? []).map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    content: m.content,
    senderId: m.senderId,
    sentByMe: m.senderId === myUserId,
    createdAt: m.createdAt,
  }));
}

export async function createConversation(otherPartyId: string, subject?: string): Promise<ChatConversation> {
  const res = await api.post('/chat/conversations', { otherPartyId, subject });
  return res.data.data as ChatConversation;
}

export async function openSupplierConversation(supplierId: string, myUserId: string, subject?: string) {
  const existing = await fetchConversations(myUserId);
  const found = existing.find((c) => c.supplierId === supplierId);
  if (found) return found;
  return createConversation(supplierId, subject);
}

export async function sendMessage(conversationId: string, content: string) {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content,
    messageType: 'TEXT',
  });
  return res.data.data as RawMessage;
}

export async function markConversationRead(conversationId: string) {
  await api.post(`/chat/conversations/${conversationId}/read`);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get('/chat/unread');
  return res.data.data?.unreadCount ?? 0;
}

export async function fetchFirstApprovedSupplier(): Promise<{ id: string; companyName: string; chatSettings?: ChatSupplierSettings } | null> {
  const res = await api.get('/suppliers', { params: { status: 'APPROVED', limit: 1 } });
  const list = res.data.data?.data ?? [];
  return list[0] ?? null;
}