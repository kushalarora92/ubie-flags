import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatResponseDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
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
