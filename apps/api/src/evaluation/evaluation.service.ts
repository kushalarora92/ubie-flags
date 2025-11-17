import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { FeatureFlag, Environment } from '../entities/feature-flag.entity';
import {
  EvaluationContext,
  EvaluationResult,
} from '../entities/types/evaluation.types';
import {
  RuleOperator,
  ConditionOperator,
  RuleCondition,
} from '../entities/types/rule.types';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flagRepository: Repository<FeatureFlag>,
  ) {}

  /**
   * Main evaluation method - evaluates a flag against user context
   */
  async evaluateFlag(
    flagKey: string,
    environment: Environment,
    context: EvaluationContext,
  ): Promise<EvaluationResult> {
    // Load the flag
    const flag = await this.flagRepository.findOne({
      where: { key: flagKey, environment },
    });

    if (!flag) {
      throw new NotFoundException(
        `Flag '${flagKey}' not found in '${environment}' environment`,
      );
    }

    const details: string[] = [];
    let result = flag.defaultValue;
    let matchedRule: string | undefined;

    details.push(`Flag: ${flag.name}`);
    details.push(`Environment: ${environment}`);
    details.push(`Default value: ${flag.defaultValue}`);

    // If no rules, use default value
    if (!flag.rules || Object.keys(flag.rules).length === 0) {
      details.push('No rules defined, using default value');
      result = flag.defaultValue;
    } else {
      details.push('Evaluating rules...');

      // Evaluate conditions
      if (flag.rules.conditions && flag.rules.conditions.length > 0) {
        const conditionsResult = this.evaluateConditions(
          flag.rules.conditions,
          flag.rules.operator || RuleOperator.AND,
          context,
          details,
        );

        if (conditionsResult) {
          result = true;
          matchedRule = `Conditions matched (${flag.rules.operator || 'AND'})`;
          details.push(`✓ Conditions matched`);
        } else {
          result = flag.defaultValue;
          details.push(`✗ Conditions did not match, using default value`);
        }
      }

      // Evaluate rollout percentage
      if (flag.rules.rollout && result === true) {
        const rolloutResult = this.evaluateRollout(
          flag.rules.rollout.percentage,
          context.userId,
          flag.rules.rollout.seed || flagKey,
          details,
        );

        if (!rolloutResult) {
          result = false;
          details.push(`✗ User not in rollout percentage`);
        } else {
          details.push(`✓ User is in rollout percentage`);
        }
      }
    }

    // Update last evaluated timestamp
    await this.flagRepository.update(
      { id: flag.id },
      { lastEvaluatedAt: new Date() },
    );

    return {
      result,
      explanation: {
        flagKey: flag.key,
        environment,
        result,
        defaultValue: flag.defaultValue,
        matchedRule,
        details,
      },
    };
  }

  /**
   * Evaluates rule conditions with AND/OR logic
   */
  private evaluateConditions(
    conditions: RuleCondition[],
    operator: RuleOperator,
    context: EvaluationContext,
    details: string[],
  ): boolean {
    details.push(
      `Checking ${conditions.length} condition(s) with ${operator} operator:`,
    );

    const results = conditions.map((condition, index) => {
      const contextValue = context[condition.field];
      const result = this.evaluateSingleCondition(condition, contextValue);

      const statusIcon = result ? '✓' : '✗';
      details.push(
        `  ${statusIcon} Condition ${index + 1}: ${condition.field} ${condition.operator} ${JSON.stringify(condition.value)} (context: ${JSON.stringify(contextValue)})`,
      );

      return result;
    });

    if (operator === RuleOperator.AND) {
      return results.every((r) => r === true);
    } else {
      // OR
      return results.some((r) => r === true);
    }
  }

  /**
   * Evaluates a single condition based on operator
   */
  private evaluateSingleCondition(
    condition: RuleCondition,
    contextValue: any,
  ): boolean {
    const { operator, value } = condition;

    switch (operator) {
      case ConditionOperator.EQUALS:
        return contextValue === value;

      case ConditionOperator.NOT_EQUALS:
        return contextValue !== value;

      case ConditionOperator.IN:
        return Array.isArray(value) && value.includes(contextValue);

      case ConditionOperator.NOT_IN:
        return Array.isArray(value) && !value.includes(contextValue);

      case ConditionOperator.GREATER_THAN:
        return typeof contextValue === 'number' && contextValue > value;

      case ConditionOperator.LESS_THAN:
        return typeof contextValue === 'number' && contextValue < value;

      case ConditionOperator.GREATER_THAN_OR_EQUAL:
        return typeof contextValue === 'number' && contextValue >= value;

      case ConditionOperator.LESS_THAN_OR_EQUAL:
        return typeof contextValue === 'number' && contextValue <= value;

      case ConditionOperator.CONTAINS:
        if (typeof contextValue === 'string') {
          return contextValue.includes(value);
        }
        if (Array.isArray(contextValue)) {
          return contextValue.includes(value);
        }
        return false;

      case ConditionOperator.STARTS_WITH:
        return (
          typeof contextValue === 'string' && contextValue.startsWith(value)
        );

      case ConditionOperator.ENDS_WITH:
        return typeof contextValue === 'string' && contextValue.endsWith(value);

      default:
        return false;
    }
  }

  /**
   * Evaluates rollout percentage using consistent hashing
   */
  private evaluateRollout(
    percentage: number,
    userId: string | undefined,
    seed: string,
    details: string[],
  ): boolean {
    if (!userId) {
      details.push('  ⚠ No userId provided, rollout cannot be evaluated');
      return false;
    }

    if (percentage === 0) {
      return false;
    }

    if (percentage === 100) {
      return true;
    }

    // Use consistent hashing to determine rollout
    const hash = createHash('md5').update(`${userId}:${seed}`).digest('hex');

    // Convert first 8 characters of hash to number and get percentage
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const userPercentage = (hashValue % 100) + 1;

    details.push(
      `  Rollout check: user ${userId} → ${userPercentage}% (threshold: ${percentage}%)`,
    );

    return userPercentage <= percentage;
  }
}
