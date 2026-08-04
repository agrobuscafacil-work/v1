import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

interface AuthSocket extends Socket {
  user?: { id: string; email: string; name: string; role: string };
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) throw new UnauthorizedException('Missing token');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role,
      };
      client.data.user = user;
      this.onlineUsers.set(user.id, client.id);
      await client.join(`user:${user.id}`);

      this.server.emit('user:online', { userId: user.id, name: user.name });
      this.logger.log(`Socket connected: ${user.email} (${client.id})`);
    } catch (error) {
      this.logger.warn(`Socket connection rejected: ${error?.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthSocket) {
    const user = client.data?.user as AuthSocket['user'];
    if (user) {
      this.onlineUsers.delete(user.id);
      this.server.emit('user:offline', { userId: user.id });
      this.logger.log(`Socket disconnected: ${user.email}`);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user = client.data?.user;
    if (!user) return { status: 'error', message: 'Not authenticated' };

    const conversation = await this.chatService
      .findConversationById(payload.conversationId, user.id)
      .catch(() => null);
    if (!conversation) return { status: 'error', message: 'Conversation not found' };

    await client.join(`conversation:${payload.conversationId}`);
    return { status: 'ok' };
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    await client.leave(`conversation:${payload.conversationId}`);
    return { status: 'ok' };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: {
      conversationId: string;
      content: string;
      messageType?: string;
      attachments?: string[];
    },
  ) {
    const user = client.data?.user;
    if (!user) return { status: 'error', message: 'Not authenticated' };
    if (!payload?.content?.trim()) return { status: 'error', message: 'Empty message' };

    try {
      const message = await this.chatService.sendMessage(
        payload.conversationId,
        user.id,
        {
          content: payload.content,
          messageType: payload.messageType,
          attachments: payload.attachments,
        },
      );

      this.server
        .to(`conversation:${payload.conversationId}`)
        .emit('message:new', { conversationId: payload.conversationId, message });
      this.server
        .to(`conversation:${payload.conversationId}`)
        .emit('conversation:updated', { conversationId: payload.conversationId });

      return { status: 'ok', message };
    } catch (error) {
      this.logger.warn(`sendMessage error: ${error?.message}`);
      return { status: 'error', message: error?.message || 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ) {
    const user = client.data?.user;
    if (!user) return;
    client.to(`conversation:${payload.conversationId}`).emit('typing', {
      conversationId: payload.conversationId,
      userId: user.id,
      name: user.name,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage('readConversation')
  async handleReadConversation(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user = client.data?.user;
    if (!user) return;
    await this.chatService.markAsRead(payload.conversationId, user.id);
    this.server.to(`conversation:${payload.conversationId}`).emit('read', {
      conversationId: payload.conversationId,
      userId: user.id,
    });
  }
}
