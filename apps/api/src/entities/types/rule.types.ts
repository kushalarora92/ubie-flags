/**
 * Rule evaluation types for feature flags
 */

export enum RuleOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  GREATER_THAN = 'GT',
  LESS_THAN = 'LT',
  GREATER_THAN_OR_EQUAL = 'GTE',
  LESS_THAN_OR_EQUAL = 'LTE',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface RolloutConfig {
  percentage: number;
  seed?: string; // For consistent hashing
}

export interface RuleMetadata {
  createdBy?: string;
  lastModifiedBy?: string;
  description?: string;
  tags?: string[];
}

export interface FlagRules {
  operator?: RuleOperator;
  conditions?: RuleCondition[];
  rollout?: RolloutConfig;
  metadata?: RuleMetadata;
}
