import {
  Controller, Get, Post, Put, Param, Body, UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateChatSettingsDto } from './dto/update-chat-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(@CurrentUser() user: any, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(user.id, user.role, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  async getUserConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation with messages' })
  async findConversation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.findConversationById(id, user.id);
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Param('id') id: string, @CurrentUser() user: any, @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, user.id, dto);
  }

  @Post('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markAsRead(id, user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@CurrentUser() user: any) {
    return this.chatService.getUnreadCount(user.id);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get chat settings (supplier)' })
  async getSettings(@CurrentUser() user: any) {
    return this.chatService.getSettings(user.id);
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update chat settings (supplier)' })
  async updateSettings(@CurrentUser() user: any, @Body() dto: UpdateChatSettingsDto) {
    return this.chatService.updateSettings(user.id, dto);
  }

  @Get('admin/conversations')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all conversations (admin)' })
  async adminGetConversations() {
    return this.chatService.adminGetAllConversations();
  }

  @Get('admin/conversations/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get conversation with messages (admin)' })
  async adminFindConversation(@Param('id') id: string) {
    return this.chatService.adminFindConversation(id);
  }

  @Post('admin/conversations/:id/messages')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message as admin' })
  async adminSendMessage(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.chatService.adminSendMessage(id, user.id, dto);
  }

  @Post('admin/conversations/:id/read')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark conversation messages as read (admin)' })
  async adminMarkAsRead(@Param('id') id: string) {
    return this.chatService.adminMarkAsRead(id);
  }
}
