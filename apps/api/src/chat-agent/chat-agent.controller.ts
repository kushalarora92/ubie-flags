import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatAgentService } from './chat-agent.service';
import { SendMessageDto, ChatResponseDto } from './dto/chat-agent-message.dto';

@Controller('chat-agent')
export class ChatAgentController {
  constructor(private readonly chatAgentService: ChatAgentService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (uses OpenAI & agent calls)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    const result = await this.chatAgentService.sendMessage(
      sendMessageDto.message,
      sendMessageDto.conversationHistory || [],
    );

    return {
      message: result.message,
      conversationHistory: result.conversationHistory,
    };
  }
}
