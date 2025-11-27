import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { Conversation } from '../entities/conversation.entity';
import { ConversationMessage } from '../entities/conversation-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, ConversationMessage])],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
