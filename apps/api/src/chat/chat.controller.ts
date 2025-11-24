import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatResponseDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for chat (uses OpenAI)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    const result = await this.chatService.sendMessage(
      sendMessageDto.message,
      sendMessageDto.conversationHistory || [],
    );

    return {
      message: result.message,
      conversationHistory: result.conversationHistory,
    };
  }
}
