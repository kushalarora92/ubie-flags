import { IsArray } from 'class-validator';

export class SeedFlagsDto {
  @IsArray()
  flags: Array<{
    key: string;
    name: string;
    description?: string;
    environment: string;
    state: string;
    defaultValue: boolean;
    rules?: any;
  }>;
}
