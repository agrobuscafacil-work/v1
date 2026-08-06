import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateChatSettingsDto } from './dto/update-chat-settings.dto';
import { MessageType } from '../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async getSupplierProfileId(userId: string) {
    const profile = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return profile?.id;
  }

  private async getUserSupplierProfileIds(userId: string) {
    const profileId = await this.getSupplierProfileId(userId);
    return profileId ? [profileId] : [];
  }

  private async isParticipant(conversation: { supplierId: string; customerId: string }, userId: string) {
    if (conversation.customerId === userId) return true;
    const profileIds = await this.getUserSupplierProfileIds(userId);
    return profileIds.includes(conversation.supplierId);
  }

  private async getRecipientUserId(conversation: { supplierId: string; customerId: string }, senderUserId: string) {
    if (conversation.customerId === senderUserId) {
      const profile = await this.prisma.supplierProfile.findUnique({
        where: { id: conversation.supplierId },
        select: { userId: true },
      });
      return profile?.userId || null;
    }
    return conversation.customerId;
  }

  async createConversation(userId: string, currentUserRole: string, dto: CreateConversationDto) {
    const isSupplier = currentUserRole === 'SUPPLIER';
    let supplierId: string;
    if (isSupplier) {
      const profileId = await this.getSupplierProfileId(userId);
      if (!profileId) throw new BadRequestException('Supplier profile not found');
      supplierId = profileId;
    } else {
      supplierId = dto.otherPartyId;
    }
    const conversation = await this.prisma.conversation.create({
      data: {
        supplierId,
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
    const supplierProfileIds = await this.getUserSupplierProfileIds(userId);
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { supplierId: { in: supplierProfileIds } },
          { customerId: userId },
        ],
      },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        customer: { select: { id: true, name: true, avatarUrl: true } },
        supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations;
  }

  async adminGetAllConversations() {
    const conversations = await this.prisma.conversation.findMany({
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        customer: { select: { id: true, name: true, avatarUrl: true } },
        supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations;
  }

  async adminFindConversation(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        },
        customer: { select: { id: true, name: true, avatarUrl: true } },
        supplier: { select: { id: true, companyName: true, tradingName: true, logoUrl: true } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async adminSendMessage(conversationId: string, adminUserId: string, dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: adminUserId,
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

    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { id: conversation.supplierId },
      select: { userId: true },
    });
    const recipientIds = [conversation.customerId, supplier?.userId].filter(
      (id): id is string => !!id && id !== adminUserId,
    );
    for (const userId of recipientIds) {
      await this.notificationsService.create({
        userId,
        type: 'MESSAGE_RECEIVED',
        title: `Nova mensagem de ${message.sender?.name || 'Atendimento'}`,
        message: message.content.slice(0, 120),
        data: { conversationId },
      }).catch(() => undefined);
    }

    return message;
  }

  async adminMarkAsRead(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    await this.prisma.message.updateMany({
      where: { conversationId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'Messages marked as read' };
  }

  async findConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (!(await this.isParticipant(conversation, userId))) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
    return conversation;
  }

  async sendMessage(conversationId: string, userId: string, dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (!(await this.isParticipant(conversation, userId))) {
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

    const recipientUserId = await this.getRecipientUserId(conversation, userId);
    if (recipientUserId) {
      await this.notificationsService.create({
        userId: recipientUserId,
        type: 'MESSAGE_RECEIVED',
        title: `Nova mensagem de ${message.sender?.name || 'contato'}`,
        message: message.content.slice(0, 120),
        data: { conversationId },
      }).catch(() => undefined);
    }

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (!(await this.isParticipant(conversation, userId))) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'Messages marked as read' };
  }

  async getUnreadCount(userId: string) {
    const supplierProfileIds = await this.getUserSupplierProfileIds(userId);
    const count = await this.prisma.message.count({
      where: {
        conversation: {
          OR: [
            { supplierId: { in: supplierProfileIds } },
            { customerId: userId },
          ],
        },
        senderId: { not: userId },
        readAt: null,
      },
    });
    return { unreadCount: count };
  }

  async getSettings(userId: string) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return this.prisma.chatSettings.findUnique({ where: { supplierId: supplier.id } });
  }

  async updateSettings(userId: string, dto: UpdateChatSettingsDto) {
    const supplier = await this.prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');
    return this.prisma.chatSettings.upsert({
      where: { supplierId: supplier.id },
      create: { supplierId: supplier.id, ...dto },
      update: dto,
    });
  }
}
