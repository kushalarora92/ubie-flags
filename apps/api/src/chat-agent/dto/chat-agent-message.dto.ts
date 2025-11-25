import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Represents a single message in the chat conversation
 */
export class ChatMessageDto {
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @IsString()
  content: string;
}

/**
 * Request DTO for sending a message to the AI agent
 */
export class SendMessageDto {
  @IsString()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @IsOptional()
  conversationHistory?: ChatMessageDto[];
}

/**
 * Response DTO for agent reply
 */
export class ChatResponseDto {
  message: string;
  conversationHistory: ChatMessageDto[];
}
