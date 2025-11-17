import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlagsModule } from './flags/flags.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
