// Flag state constants
export const FlagState = {
  DRAFT: 'draft',
  LIVE: 'live',
  DEPRECATED: 'deprecated',
} as const;

export type FlagState = typeof FlagState[keyof typeof FlagState];

// Flag state options for dropdowns
export const FLAG_STATE_OPTIONS = [
  { value: FlagState.DRAFT, label: 'Draft' },
  { value: FlagState.LIVE, label: 'Live' },
  { value: FlagState.DEPRECATED, label: 'Deprecated' },
] as const;

// Flag environment constants
export const FlagEnvironment = {
  DEV: 'dev',
  STAGING: 'staging',
  PROD: 'prod',
} as const;

export type FlagEnvironment = typeof FlagEnvironment[keyof typeof FlagEnvironment];

// Flag environment options for dropdowns
export const FLAG_ENVIRONMENT_OPTIONS = [
  { value: FlagEnvironment.DEV, label: 'Development' },
  { value: FlagEnvironment.STAGING, label: 'Staging' },
  { value: FlagEnvironment.PROD, label: 'Production' },
] as const;

// Form data types
export interface FlagFormData {
  name: string;
  description?: string;
  state: FlagState;
  defaultValue: boolean;
  rules?: string | object; // Optional, supports both JSON string and object representation
}

// For creating a new flag (includes key and environment)
export interface CreateFlagFormData extends FlagFormData {
  key: string;
  environment: FlagEnvironment;
}

export type UpdateFlagFormData = Omit<FlagFormData, 'key' | 'environment'>;
