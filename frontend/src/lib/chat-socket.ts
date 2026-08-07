'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(): Socket | null {
  if (typeof window === 'undefined') return null;
  if (socket) return socket;

  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  socket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    timeout: 10000,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(conversationId: string) {
  socket?.emit('joinConversation', { conversationId });
}

export function leaveConversation(conversationId: string) {
  socket?.emit('leaveConversation', { conversationId });
}

export function sendViaSocket(payload: {
  conversationId: string;
  content: string;
  messageType?: string;
  attachments?: string[];
}) {
  socket?.emit('sendMessage', payload);
}

export function emitTyping(conversationId: string, isTyping: boolean) {
  socket?.emit('typing', { conversationId, isTyping });
}

export function emitRead(conversationId: string) {
  socket?.emit('readConversation', { conversationId });
}

interface UseChatSocketOptions {
  onMessage?: (data: { conversationId: string; message: any }) => void;
  onTyping?: (data: { conversationId: string; userId: string; name: string; isTyping: boolean }) => void;
  onRead?: (data: { conversationId: string; userId: string }) => void;
  onConversationUpdated?: (data: { conversationId: string }) => void;
}

export function useChatSocket(opts: UseChatSocketOptions = {}) {
  const [connected, setConnected] = useState(() => getSocket()?.connected ?? false);
  const optsRef = useRef(opts);

  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  useEffect(() => {
    const s = connectSocket();
    if (!s) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleMessage = (data: any) => optsRef.current.onMessage?.(data);
    const handleTyping = (data: any) => optsRef.current.onTyping?.(data);
    const handleRead = (data: any) => optsRef.current.onRead?.(data);
    const handleConversationUpdated = (data: any) => optsRef.current.onConversationUpdated?.(data);

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('message:new', handleMessage);
    s.on('typing', handleTyping);
    s.on('read', handleRead);
    s.on('conversation:updated', handleConversationUpdated);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('message:new', handleMessage);
      s.off('typing', handleTyping);
      s.off('read', handleRead);
      s.off('conversation:updated', handleConversationUpdated);
    };
  }, []);

  return { connected, socket };
}
