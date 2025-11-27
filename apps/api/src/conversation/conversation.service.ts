import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import {
  ConversationMessage,
  MessageRole,
} from '../entities/conversation-message.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private messageRepository: Repository<ConversationMessage>,
  ) {}

  /**
   * Find existing conversation by threadId or create a new one
   */
  async findOrCreateConversation(
    threadId: string,
    userId?: string,
  ): Promise<Conversation> {
    let conversation = await this.conversationRepository.findOne({
      where: { threadId },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        threadId,
        userId: userId || null,
        metadata: {},
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  /**
   * Get all messages for a conversation in chronological order
   */
  async getConversationHistory(
    threadId: string,
  ): Promise<ConversationMessage[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { threadId },
    });

    if (!conversation) {
      return [];
    }

    return this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Save a message to the conversation
   */
  async saveMessage(
    threadId: string,
    role: MessageRole,
    content: string,
    toolCalls?: any,
    toolCallId?: string,
  ): Promise<ConversationMessage> {
    const conversation = await this.findOrCreateConversation(threadId);

    const message = this.messageRepository.create({
      conversationId: conversation.id,
      role,
      content,
      toolCalls: toolCalls || null,
      toolCallId: toolCallId || null,
    });

    return this.messageRepository.save(message);
  }

  /**
   * Get conversation metadata (message count, dates, etc.)
   */
  async getConversationMetadata(threadId: string): Promise<{
    threadId: string;
    messageCount: number;
    createdAt: Date | null;
    lastActivity: Date | null;
    userId: string | null;
  }> {
    const conversation = await this.conversationRepository.findOne({
      where: { threadId },
    });

    if (!conversation) {
      return {
        threadId,
        messageCount: 0,
        createdAt: null,
        lastActivity: null,
        userId: null,
      };
    }

    const messageCount = await this.messageRepository.count({
      where: { conversationId: conversation.id },
    });

    const lastMessage = await this.messageRepository.findOne({
      where: { conversationId: conversation.id },
      order: { createdAt: 'DESC' },
    });

    return {
      threadId: conversation.threadId,
      messageCount,
      createdAt: conversation.createdAt,
      lastActivity: lastMessage?.createdAt || conversation.updatedAt,
      userId: conversation.userId,
    };
  }

  /**
   * Trim conversation history to keep only the last N messages
   */
  async trimConversationHistory(
    threadId: string,
    keepLast: number,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { threadId },
    });

    if (!conversation) {
      return;
    }

    const messages = await this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });

    if (messages.length <= keepLast) {
      return;
    }

    const messagesToDelete = messages.slice(0, messages.length - keepLast);
    const idsToDelete = messagesToDelete.map((msg) => msg.id);

    await this.messageRepository.delete(idsToDelete);
  }
}
