/**
 * Demo flag templates - single source of truth
 * Used by both FlagExamples.tsx and for seeding the database
 */

export const DEMO_FLAG_TEMPLATES = [
  {
    key: 'test_country',
    name: 'Country-Based Feature',
    description: 'Feature enabled for users in Canada',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      conditions: [
        {
          field: 'country',
          operator: 'EQUALS',
          value: 'CA',
        },
      ],
    },
  },
  {
    key: 'beta_access',
    name: 'Beta Access',
    description: 'Beta features for testers in specific countries',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      operator: 'AND',
      conditions: [
        {
          field: 'country',
          operator: 'IN',
          value: ['CA', 'US', 'UK'],
        },
        {
          field: 'role',
          operator: 'EQUALS',
          value: 'beta_tester',
        },
      ],
    },
  },
  {
    key: 'special_access',
    name: 'Special Access',
    description: 'Access for admins or internal users',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      operator: 'OR',
      conditions: [
        {
          field: 'role',
          operator: 'EQUALS',
          value: 'admin',
        },
        {
          field: 'email',
          operator: 'ENDS_WITH',
          value: '@company.com',
        },
      ],
    },
  },
  {
    key: 'gradual_rollout',
    name: 'Gradual Rollout',
    description: '50% rollout to all users',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      rollout: {
        percentage: 50,
        seed: 'experiment-v1',
      },
    },
  },
  {
    key: 'targeted_rollout',
    name: 'Targeted Rollout',
    description: '50% rollout to users in Canada',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      operator: 'AND',
      conditions: [
        {
          field: 'country',
          operator: 'EQUALS',
          value: 'CA',
        },
      ],
      rollout: {
        percentage: 50,
      },
    },
  },
  {
    key: 'age_restricted',
    name: 'Age Restricted Feature',
    description: 'Feature for users 18 and older',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      conditions: [
        {
          field: 'age',
          operator: 'GTE',
          value: 18,
        },
      ],
    },
  },
  {
    key: 'internal_features',
    name: 'Internal Features',
    description: 'Features for internal company users',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: false,
    rules: {
      conditions: [
        {
          field: 'email',
          operator: 'ENDS_WITH',
          value: '@company.com',
        },
      ],
    },
  },
  {
    key: 'simple_flag',
    name: 'Simple Feature Toggle',
    description: 'Basic flag with no rules',
    environment: 'dev' as const,
    state: 'live' as const,
    defaultValue: true,
  },
  {
    key: 'stale_experiment',
    name: 'Old Experiment',
    description: 'This flag has never been evaluated',
    environment: 'prod' as const,
    state: 'live' as const,
    defaultValue: false,
  },
  {
    key: 'deprecated_feature',
    name: 'Deprecated Feature',
    description: 'Feature marked for removal',
    environment: 'prod' as const,
    state: 'deprecated' as const,
    defaultValue: false,
  },
  {
    key: 'draft_feature',
    name: 'Upcoming Feature',
    description: 'Feature in draft state',
    environment: 'staging' as const,
    state: 'draft' as const,
    defaultValue: false,
  },
];

export const DEMO_FLAG_KEYS = DEMO_FLAG_TEMPLATES.map((flag) => flag.key);
