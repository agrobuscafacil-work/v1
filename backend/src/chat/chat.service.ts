import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createConversation(userId: string, currentUserRole: string, dto: CreateConversationDto) {
    const isSupplier = currentUserRole === 'SUPPLIER';
    const conversation = await this.prisma.conversation.create({
      data: {
        supplierId: isSupplier ? userId : dto.otherPartyId,
        customerId: isSupplier ? dto.otherPartyId : userId,
        subject: dto.subject,
        orderId: dto.orderId,
      },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    this.logger.log(`Conversation created: ${conversation.id}`);
    return conversation;
  }

  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { supplierId: userId },
          { customerId: userId },
        ],
      },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations;
  }

  async findConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { supplierId: userId },
          { customerId: userId },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async sendMessage(conversationId: string, userId: string, dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.supplierId !== userId && conversation.customerId !== userId) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: dto.content,
        type: (dto.messageType as MessageType) || MessageType.TEXT,
        attachments: dto.attachments || [],
      },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'Messages marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        conversation: {
          OR: [
            { supplierId: userId },
            { customerId: userId },
          ],
        },
        senderId: { not: userId },
        readAt: null,
      },
    });
    return { unreadCount: count };
  }
}
