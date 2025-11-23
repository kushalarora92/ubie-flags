import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { FlagsModule } from '../flags/flags.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [FlagsModule, EvaluationModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
