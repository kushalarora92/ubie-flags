/**
 * Evaluation context and result types for feature flag evaluation
 */

/**
 * User context provided during evaluation
 * Contains any attributes that rules can evaluate against
 */
export interface EvaluationContext {
  userId?: string;
  email?: string;
  country?: string;
  role?: string;
  age?: number;
  company?: string;
  [key: string]: any; // Allow any custom attributes
}

/**
 * Detailed explanation of why a flag evaluated to a particular value
 */
export interface EvaluationExplanation {
  flagKey: string;
  environment: string;
  result: boolean;
  defaultValue: boolean;
  matchedRule?: string;
  details: string[];
}

/**
 * Complete evaluation result with flag value and human-readable explanation
 */
export interface EvaluationResult {
  result: boolean;
  explanation: EvaluationExplanation;
}
