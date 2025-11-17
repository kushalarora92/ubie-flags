import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlagState, Environment } from '../../entities/feature-flag.entity';
import { FlagRulesDto } from './flag-rules.dto';

export class CreateFlagDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  defaultValue?: boolean;

  @IsEnum(FlagState)
  @IsOptional()
  state?: FlagState;

  @IsEnum(Environment)
  environment: Environment;

  @ValidateNested()
  @Type(() => FlagRulesDto)
  @IsOptional()
  rules?: FlagRulesDto;
}
