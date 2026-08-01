import {
  Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
}
