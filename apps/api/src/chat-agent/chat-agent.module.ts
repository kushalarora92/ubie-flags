import { Module } from '@nestjs/common';
import { ChatAgentController } from './chat-agent.controller';
import { ChatAgentService } from './chat-agent.service';
import { FlagsModule } from '../flags/flags.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [FlagsModule, EvaluationModule],
  controllers: [ChatAgentController],
  providers: [ChatAgentService],
})
export class ChatAgentModule {}
