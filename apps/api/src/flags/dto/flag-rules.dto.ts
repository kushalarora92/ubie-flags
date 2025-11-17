import {
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
  Min,
  Max,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RuleOperator, ConditionOperator } from '../../entities/types/rule.types';

export class RuleConditionDto {
  @IsString()
  field: string;

  @IsEnum(ConditionOperator)
  operator: ConditionOperator;

  // value can be any type (string, number, array, object, etc.)
  @IsDefined()
  value: any;
}

export class RolloutConfigDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsString()
  @IsOptional()
  seed?: string;
}

export class RuleMetadataDto {
  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  lastModifiedBy?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class FlagRulesDto {
  @IsEnum(RuleOperator)
  @IsOptional()
  operator?: RuleOperator;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleConditionDto)
  @IsOptional()
  conditions?: RuleConditionDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => RolloutConfigDto)
  @IsOptional()
  rollout?: RolloutConfigDto;

  @IsObject()
  @ValidateNested()
  @Type(() => RuleMetadataDto)
  @IsOptional()
  metadata?: RuleMetadataDto;
}
