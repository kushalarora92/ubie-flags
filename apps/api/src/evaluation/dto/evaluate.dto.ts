import { IsString, IsEnum, IsObject } from 'class-validator';
import { Environment } from '../../entities/feature-flag.entity';
import { EvaluationContext } from '../../entities/types/evaluation.types';

export class EvaluateDto {
  @IsString()
  flagKey: string;

  @IsEnum(Environment)
  environment: Environment;

  @IsObject()
  context: EvaluationContext;
}
