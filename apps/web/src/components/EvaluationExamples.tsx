'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface EvaluationScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  flagKey: string;
  environment: string;
  context: Record<string, unknown>;
  expectedResult: boolean;
  explanation: string;
}

interface EvaluationExamplesProps {
  onUseScenario: (flagKey: string, environment: string, context: Record<string, unknown>) => void;
}

export default function EvaluationExamples({ onUseScenario }: EvaluationExamplesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const scenarios: EvaluationScenario[] = [
    {
      id: 'country-match',
      name: 'Country Match (TRUE)',
      description: 'User from Canada matches country condition',
      category: 'Basic Conditions',
      flagKey: 'canada_feature',
      environment: 'prod',
      context: {
        userId: 'user123',
        country: 'CA',
      },
      expectedResult: true,
      explanation: 'Condition matched: country == CA',
    },
    {
      id: 'country-no-match',
      name: 'Country No Match (FALSE)',
      description: 'User from US does not match CA condition',
      category: 'Basic Conditions',
      flagKey: 'canada_feature',
      environment: 'prod',
      context: {
        userId: 'user456',
        country: 'US',
      },
      expectedResult: false,
      explanation: 'Condition not matched, uses default value',
    },
    {
      id: 'and-both-match',
      name: 'AND Logic - Both Match (TRUE)',
      description: 'Both country AND role conditions are satisfied',
      category: 'AND Operator',
      flagKey: 'beta_access',
      environment: 'prod',
      context: {
        userId: 'beta_user_1',
        country: 'CA',
        role: 'beta_tester',
      },
      expectedResult: true,
      explanation: 'All AND conditions satisfied',
    },
    {
      id: 'and-partial-match',
      name: 'AND Logic - Partial Match (FALSE)',
      description: 'Only one of two AND conditions matches',
      category: 'AND Operator',
      flagKey: 'beta_access',
      environment: 'prod',
      context: {
        userId: 'regular_user',
        country: 'CA',
        role: 'regular_user',
      },
      expectedResult: false,
      explanation: 'AND requires all conditions to match',
    },
    {
      id: 'and-no-match',
      name: 'AND Logic - No Match (FALSE)',
      description: 'Neither condition matches',
      category: 'AND Operator',
      flagKey: 'beta_access',
      environment: 'prod',
      context: {
        userId: 'user789',
        country: 'JP',
        role: 'regular_user',
      },
      expectedResult: false,
      explanation: 'No conditions matched',
    },
    {
      id: 'or-first-match',
      name: 'OR Logic - First Condition (TRUE)',
      description: 'First condition matches (admin role)',
      category: 'OR Operator',
      flagKey: 'special_access',
      environment: 'dev',
      context: {
        userId: 'admin_user',
        role: 'admin',
        email: 'user@external.com',
      },
      expectedResult: true,
      explanation: 'First OR condition matched',
    },
    {
      id: 'or-second-match',
      name: 'OR Logic - Second Condition (TRUE)',
      description: 'Second condition matches (company email)',
      category: 'OR Operator',
      flagKey: 'special_access',
      environment: 'dev',
      context: {
        userId: 'employee',
        role: 'user',
        email: 'john@company.com',
      },
      expectedResult: true,
      explanation: 'Second OR condition matched',
    },
    {
      id: 'or-both-match',
      name: 'OR Logic - Both Match (TRUE)',
      description: 'Both conditions match',
      category: 'OR Operator',
      flagKey: 'special_access',
      environment: 'dev',
      context: {
        userId: 'admin_employee',
        role: 'admin',
        email: 'admin@company.com',
      },
      expectedResult: true,
      explanation: 'Multiple OR conditions matched',
    },
    {
      id: 'or-no-match',
      name: 'OR Logic - No Match (FALSE)',
      description: 'No conditions match',
      category: 'OR Operator',
      flagKey: 'special_access',
      environment: 'dev',
      context: {
        userId: 'external_user',
        role: 'user',
        email: 'user@external.com',
      },
      expectedResult: false,
      explanation: 'No OR conditions matched',
    },
    {
      id: 'rollout-user1',
      name: 'Rollout - User 1',
      description: 'Test consistent hashing for user1',
      category: 'Rollout',
      flagKey: 'gradual_rollout',
      environment: 'dev',
      context: {
        userId: 'user1',
      },
      expectedResult: true,
      explanation: 'User hashes into the 50% rollout group',
    },
    {
      id: 'rollout-user2',
      name: 'Rollout - User 2',
      description: 'Test consistent hashing for user2',
      category: 'Rollout',
      flagKey: 'gradual_rollout',
      environment: 'dev',
      context: {
        userId: 'user2',
      },
      expectedResult: false,
      explanation: 'User hashes outside the 50% rollout group',
    },
    {
      id: 'rollout-consistency',
      name: 'Rollout Consistency Check',
      description: 'Same user should always get same result',
      category: 'Rollout',
      flagKey: 'gradual_rollout',
      environment: 'dev',
      context: {
        userId: 'user1',
      },
      expectedResult: true,
      explanation: 'Consistent hashing ensures same result',
    },
    {
      id: 'targeted-rollout-wrong-country',
      name: 'Targeted Rollout - Wrong Country (FALSE)',
      description: 'Country condition fails, rollout not checked',
      category: 'Combined Logic',
      flagKey: 'targeted_rollout',
      environment: 'dev',
      context: {
        userId: 'us_user',
        country: 'US',
      },
      expectedResult: false,
      explanation: 'Condition must pass before rollout applies',
    },
    {
      id: 'targeted-rollout-right-country',
      name: 'Targeted Rollout - Right Country',
      description: 'Country matches, then rollout applies',
      category: 'Combined Logic',
      flagKey: 'targeted_rollout',
      environment: 'dev',
      context: {
        userId: 'canadian_user_1',
        country: 'CA',
      },
      expectedResult: true,
      explanation: 'Condition passed, then included in rollout',
    },
    {
      id: 'age-above',
      name: 'Age Check - Above Threshold (TRUE)',
      description: 'User age 25 >= 18',
      category: 'Numeric Operators',
      flagKey: 'age_restricted',
      environment: 'dev',
      context: {
        userId: 'adult_user',
        age: 25,
      },
      expectedResult: true,
      explanation: 'age (25) >= 18',
    },
    {
      id: 'age-exact',
      name: 'Age Check - Exact Threshold (TRUE)',
      description: 'User age exactly 18',
      category: 'Numeric Operators',
      flagKey: 'age_restricted',
      environment: 'dev',
      context: {
        userId: 'just_18',
        age: 18,
      },
      expectedResult: true,
      explanation: 'age (18) >= 18',
    },
    {
      id: 'age-below',
      name: 'Age Check - Below Threshold (FALSE)',
      description: 'User age 16 < 18',
      category: 'Numeric Operators',
      flagKey: 'age_restricted',
      environment: 'dev',
      context: {
        userId: 'minor',
        age: 16,
      },
      expectedResult: false,
      explanation: 'age (16) < 18, condition not met',
    },
    {
      id: 'score-high',
      name: 'Score Check - High Score (TRUE)',
      description: 'Score 150 > 100',
      category: 'Numeric Operators',
      flagKey: 'premium_features',
      environment: 'prod',
      context: {
        userId: 'high_scorer',
        score: 150,
      },
      expectedResult: true,
      explanation: 'score (150) > 100',
    },
    {
      id: 'score-low',
      name: 'Score Check - Low Score (FALSE)',
      description: 'Score 50 <= 100',
      category: 'Numeric Operators',
      flagKey: 'premium_features',
      environment: 'prod',
      context: {
        userId: 'low_scorer',
        score: 50,
      },
      expectedResult: false,
      explanation: 'score (50) not > 100',
    },
    {
      id: 'email-internal',
      name: 'Email Domain - Internal (TRUE)',
      description: 'Email ends with @company.com',
      category: 'String Operators',
      flagKey: 'internal_features',
      environment: 'dev',
      context: {
        userId: 'employee',
        email: 'john@company.com',
      },
      expectedResult: true,
      explanation: 'email ends with @company.com',
    },
    {
      id: 'email-external',
      name: 'Email Domain - External (FALSE)',
      description: 'Email does not end with @company.com',
      category: 'String Operators',
      flagKey: 'internal_features',
      environment: 'dev',
      context: {
        userId: 'external',
        email: 'user@external.com',
      },
      expectedResult: false,
      explanation: 'email does not match pattern',
    },
    {
      id: 'username-admin',
      name: 'Username Pattern - Admin (TRUE)',
      description: 'Username starts with admin_',
      category: 'String Operators',
      flagKey: 'admin_panel',
      environment: 'prod',
      context: {
        userId: 'admin_john',
        username: 'admin_john',
      },
      expectedResult: true,
      explanation: 'username starts with admin_',
    },
    {
      id: 'username-regular',
      name: 'Username Pattern - Regular (FALSE)',
      description: 'Username does not start with admin_',
      category: 'String Operators',
      flagKey: 'admin_panel',
      environment: 'prod',
      context: {
        userId: 'john_doe',
        username: 'john_doe',
      },
      expectedResult: false,
      explanation: 'username does not match pattern',
    },
    {
      id: 'tags-contains',
      name: 'Array Contains - VIP Tag (TRUE)',
      description: 'Tags array contains "vip"',
      category: 'Array Operators',
      flagKey: 'vip_features',
      environment: 'prod',
      context: {
        userId: 'vip_user',
        tags: ['premium', 'vip', 'early_access'],
      },
      expectedResult: true,
      explanation: 'tags contains "vip"',
    },
    {
      id: 'tags-no-contains',
      name: 'Array Contains - No VIP Tag (FALSE)',
      description: 'Tags array does not contain "vip"',
      category: 'Array Operators',
      flagKey: 'vip_features',
      environment: 'prod',
      context: {
        userId: 'regular_user',
        tags: ['premium', 'member'],
      },
      expectedResult: false,
      explanation: 'tags does not contain "vip"',
    },
    {
      id: 'country-in-list',
      name: 'IN Operator - Country in List (TRUE)',
      description: 'Country is in the allowed list',
      category: 'List Operators',
      flagKey: 'north_america_feature',
      environment: 'prod',
      context: {
        userId: 'us_user',
        country: 'US',
      },
      expectedResult: true,
      explanation: 'country in [US, CA, MX]',
    },
    {
      id: 'country-not-in-list',
      name: 'IN Operator - Country Not in List (FALSE)',
      description: 'Country is not in the allowed list',
      category: 'List Operators',
      flagKey: 'north_america_feature',
      environment: 'prod',
      context: {
        userId: 'uk_user',
        country: 'UK',
      },
      expectedResult: false,
      explanation: 'country not in [US, CA, MX]',
    },
    {
      id: 'country-exclude',
      name: 'NOT_IN Operator - Not Excluded (TRUE)',
      description: 'Country is not in restricted list',
      category: 'List Operators',
      flagKey: 'global_feature',
      environment: 'prod',
      context: {
        userId: 'canadian',
        country: 'CA',
      },
      expectedResult: true,
      explanation: 'country not in restricted list',
    },
    {
      id: 'country-excluded',
      name: 'NOT_IN Operator - Excluded (FALSE)',
      description: 'Country is in restricted list',
      category: 'List Operators',
      flagKey: 'global_feature',
      environment: 'prod',
      context: {
        userId: 'restricted',
        country: 'XX',
      },
      expectedResult: false,
      explanation: 'country is in restricted list',
    },
  ];

  const categories = ['all', ...new Set(scenarios.map((s) => s.category))];

  const filteredScenarios =
    selectedCategory === 'all'
      ? scenarios
      : scenarios.filter((s) => s.category === selectedCategory);

  const handleUseScenario = (scenario: EvaluationScenario) => {
    onUseScenario(scenario.flagKey, scenario.environment, scenario.context);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2"
      >
        <span>🧪</span>
        <span>Show Test Scenarios</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">🧪 Evaluation Test Scenarios</h2>
            <p className="text-sm text-purple-100 mt-1">
              Click &quot;Test This&quot; to populate the form and test the scenario
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'All Scenarios' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded ${
                          scenario.expectedResult
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {scenario.expectedResult ? '✓ TRUE' : '✗ FALSE'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{scenario.category}</span>
                  </div>
                  <button
                    onClick={() => handleUseScenario(scenario)}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 whitespace-nowrap"
                  >
                    Test This
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-medium text-gray-700">Flag: {scenario.flagKey} ({scenario.environment})</div>
                  </div>
                  <div className="bg-gray-900 rounded p-2">
                    <div className="text-xs text-gray-400 mb-1">Context:</div>
                    <pre className="text-xs text-blue-400 font-mono overflow-x-auto">
                      {JSON.stringify(scenario.context, null, 2)}
                    </pre>
                  </div>
                  <div className={`rounded p-2 text-xs ${
                    scenario.expectedResult ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <div className="font-medium">Expected: {scenario.explanation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} available
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
