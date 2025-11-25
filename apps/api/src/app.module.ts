import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlagsModule } from './flags/flags.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { ChatModule } from './chat/chat.module';
import { ChatAgentModule } from './chat-agent/chat-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (60 seconds)
        limit: 20, // Max requests per ttl window
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'ubie',
      password: process.env.DB_PASSWORD || 'ubie',
      database: process.env.DB_NAME || 'ubieflags',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Only for development - auto-creates tables
      logging: true,
    }),
    FlagsModule,
    EvaluationModule,
    ChatModule,
    ChatAgentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
