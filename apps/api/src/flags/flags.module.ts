import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlagsController } from './flags.controller';
import { FlagsService } from './flags.service';
import { FeatureFlag } from '../entities/feature-flag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag])],
  controllers: [FlagsController],
  providers: [FlagsService],
  exports: [FlagsService],
})
export class FlagsModule {}
