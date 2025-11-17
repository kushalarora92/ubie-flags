import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FlagRules } from './types/rule.types';

export enum FlagState {
  DRAFT = 'draft',
  LIVE = 'live',
  DEPRECATED = 'deprecated',
}

export enum Environment {
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod',
}

@Entity('feature_flags')
@Index(['key', 'environment'], { unique: true })
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'default_value', type: 'boolean', default: false })
  defaultValue: boolean;

  @Column({
    type: 'enum',
    enum: FlagState,
    default: FlagState.DRAFT,
  })
  state: FlagState;

  @Column({
    type: 'enum',
    enum: Environment,
    default: Environment.DEV,
  })
  environment: Environment;

  @Column({ type: 'jsonb', default: {} })
  rules: FlagRules;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'last_evaluated_at', type: 'timestamptz', nullable: true })
  lastEvaluatedAt: Date | null;
}
