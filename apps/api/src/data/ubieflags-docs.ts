/**
 * Sample documentation about UbieFlags features
 * Used for RAG-based question answering
 */

export const ubieflagsDocumentation = [
  {
    title: 'What is UbieFlags',
    content: `UbieFlags is a feature flag management platform designed to make every decision explainable, safe, and understandable. It helps teams manage feature rollouts across different environments (dev, staging, production) with built-in lifecycle management and clear evaluation explanations.`,
    category: 'overview',
  },
  {
    title: 'Explainability Feature',
    content: `UbieFlags provides built-in explainability for every flag evaluation. When a flag is evaluated, you get not just ON or OFF, but a detailed explanation showing which environment was used, which rule matched, what user context was checked, and whether fallback was used. This makes debugging "Why is user X seeing this?" incredibly fast.`,
    category: 'features',
  },
  {
    title: 'Flag Lifecycle',
    content: `Every flag has a lifecycle state: draft (being developed), live (active and being used), or deprecated (marked for removal). The system automatically tracks last_evaluated_at to help identify stale flags. Flags not evaluated for 45+ days are highlighted as candidates for deprecation.`,
    category: 'features',
  },
  {
    title: 'Rules Engine',
    content: `UbieFlags uses a JSON-based rules engine for targeting. You can create conditions like country equals CA, userId in a specific segment, or percentage rollouts for gradual feature releases. All rules are evaluated server-side for security and consistency across environments.`,
    category: 'features',
  },
  {
    title: 'Environment Support',
    content: `UbieFlags supports three environments: dev for development testing, staging for QA and integration tests, and prod for live user traffic. Each environment can have different rules and default values. Always test flags in dev and staging before enabling in production.`,
    category: 'features',
  },
  {
    title: 'AI Assistant Capabilities',
    content: `The UbieFlags AI assistant can list all flags in any environment, explain why a specific flag evaluated to ON or OFF for a particular user, find stale flags that haven't been used recently, and provide detailed flag configuration information. Just ask questions in plain English.`,
    category: 'features',
  },
];
