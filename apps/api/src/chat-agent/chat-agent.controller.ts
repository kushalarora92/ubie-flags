import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatAgentService } from './chat-agent.service';
import { SendMessageDto, ChatResponseDto } from './dto/chat-agent-message.dto';
import { ConversationService } from '../conversation/conversation.service';

@Controller('chat-agent')
export class ChatAgentController {
  constructor(
    private readonly chatAgentService: ChatAgentService,
    private readonly conversationService: ConversationService,
  ) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (uses OpenAI & agent calls)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    const result = await this.chatAgentService.sendMessage(
      sendMessageDto.message,
      sendMessageDto.threadId,
    );

    return {
      message: result.message,
      threadId: result.threadId,
    };
  }

  @Get('conversations/:threadId/history')
  @HttpCode(HttpStatus.OK)
  async getConversationHistory(@Param('threadId') threadId: string) {
    const messages =
      await this.conversationService.getConversationHistory(threadId);

    return {
      threadId,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    };
  }
}
