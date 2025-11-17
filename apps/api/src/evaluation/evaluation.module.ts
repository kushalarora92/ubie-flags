import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { FeatureFlag } from '../entities/feature-flag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag])],
  controllers: [EvaluationController],
  providers: [EvaluationService],
})
export class EvaluationModule {}
