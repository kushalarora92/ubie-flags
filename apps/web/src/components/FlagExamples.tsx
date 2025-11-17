'use client';

import { useState } from 'react';

interface FlagTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  data: {
    key: string;
    name: string;
    description?: string;
    environment: 'dev' | 'staging' | 'prod';
    state: 'draft' | 'live' | 'deprecated';
    defaultValue: boolean;
    rules?: any;
  };
}

interface FlagExamplesProps {
  onUseTemplate: (data: FlagTemplate['data']) => void;
}

export default function FlagExamples({ onUseTemplate }: FlagExamplesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: FlagTemplate[] = [
    {
      id: 'simple',
      name: 'Simple Boolean Flag',
      description: 'Basic on/off toggle with no targeting',
      category: 'Basic',
      data: {
        key: 'new_feature',
        name: 'New Feature Toggle',
        description: 'Simple feature flag',
        environment: 'dev',
        state: 'draft',
        defaultValue: false,
      },
    },
    {
      id: 'country',
      name: 'Country-Based Targeting',
      description: 'Enable for specific country',
      category: 'Targeting',
      data: {
        key: 'canada_feature',
        name: 'Canada Only Feature',
        description: 'Feature available only in Canada',
        environment: 'prod',
        state: 'live',
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
    },
    {
      id: 'multi-country',
      name: 'Multi-Country Targeting',
      description: 'Enable for multiple countries using IN operator',
      category: 'Targeting',
      data: {
        key: 'north_america_feature',
        name: 'North America Feature',
        description: 'Available in US, CA, and MX',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          conditions: [
            {
              field: 'country',
              operator: 'IN',
              value: ['US', 'CA', 'MX'],
            },
          ],
        },
      },
    },
    {
      id: 'role-based',
      name: 'Role-Based Access',
      description: 'Enable for specific user roles',
      category: 'Targeting',
      data: {
        key: 'admin_features',
        name: 'Admin Features',
        description: 'Features for admin users only',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          conditions: [
            {
              field: 'role',
              operator: 'EQUALS',
              value: 'admin',
            },
          ],
        },
      },
    },
    {
      id: 'beta-tester',
      name: 'Beta Tester Access (AND)',
      description: 'Requires both country and role to match',
      category: 'Complex Logic',
      data: {
        key: 'beta_access',
        name: 'Beta Features',
        description: 'Beta testers in select countries',
        environment: 'staging',
        state: 'live',
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
    },
    {
      id: 'special-access',
      name: 'Special Access (OR)',
      description: 'Admin OR company email can access',
      category: 'Complex Logic',
      data: {
        key: 'special_features',
        name: 'Special Features',
        description: 'For admins or internal employees',
        environment: 'prod',
        state: 'live',
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
    },
    {
      id: 'rollout-50',
      name: 'Gradual Rollout (50%)',
      description: 'Enable for 50% of users using consistent hashing',
      category: 'Rollout',
      data: {
        key: 'gradual_feature',
        name: 'Gradual Feature Rollout',
        description: '50% rollout to all users',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          rollout: {
            percentage: 50,
          },
        },
      },
    },
    {
      id: 'rollout-10',
      name: 'Canary Release (10%)',
      description: 'Small percentage for testing',
      category: 'Rollout',
      data: {
        key: 'canary_release',
        name: 'Canary Release',
        description: '10% canary deployment',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          rollout: {
            percentage: 10,
          },
        },
      },
    },
    {
      id: 'targeted-rollout',
      name: 'Targeted Rollout',
      description: 'Combine country targeting with percentage rollout',
      category: 'Complex Logic',
      data: {
        key: 'canada_rollout',
        name: 'Canada 50% Rollout',
        description: '50% of Canadian users',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
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
    },
    {
      id: 'age-restricted',
      name: 'Age Restriction',
      description: 'Numeric comparison for age verification',
      category: 'Numeric',
      data: {
        key: 'adult_content',
        name: 'Adult Content',
        description: 'Must be 18 or older',
        environment: 'prod',
        state: 'live',
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
    },
    {
      id: 'score-threshold',
      name: 'Score Threshold',
      description: 'Enable for high-scoring users',
      category: 'Numeric',
      data: {
        key: 'premium_features',
        name: 'Premium Features',
        description: 'For users with score > 100',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          conditions: [
            {
              field: 'score',
              operator: 'GT',
              value: 100,
            },
          ],
        },
      },
    },
    {
      id: 'internal-email',
      name: 'Internal Email Domain',
      description: 'String matching for company emails',
      category: 'String Matching',
      data: {
        key: 'internal_tools',
        name: 'Internal Tools',
        description: 'For @company.com emails',
        environment: 'prod',
        state: 'live',
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
    },
    {
      id: 'admin-username',
      name: 'Admin Username Pattern',
      description: 'Match usernames starting with admin_',
      category: 'String Matching',
      data: {
        key: 'admin_panel',
        name: 'Admin Panel Access',
        description: 'For admin_ prefixed usernames',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          conditions: [
            {
              field: 'username',
              operator: 'STARTS_WITH',
              value: 'admin_',
            },
          ],
        },
      },
    },
    {
      id: 'vip-tags',
      name: 'VIP User Tags',
      description: 'Check if tags array contains specific value',
      category: 'Array Operations',
      data: {
        key: 'vip_features',
        name: 'VIP Features',
        description: 'For users with VIP tag',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          conditions: [
            {
              field: 'tags',
              operator: 'CONTAINS',
              value: 'vip',
            },
          ],
        },
      },
    },
    {
      id: 'exclude-countries',
      name: 'Exclude Countries',
      description: 'Enable for all except specific countries',
      category: 'Targeting',
      data: {
        key: 'global_feature',
        name: 'Global Feature (Except Restricted)',
        description: 'Available everywhere except restricted countries',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          conditions: [
            {
              field: 'country',
              operator: 'NOT_IN',
              value: ['XX', 'YY', 'ZZ'],
            },
          ],
        },
      },
    },
    {
      id: 'complex-combo',
      name: 'Complex Combination',
      description: 'Multiple conditions with AND operator',
      category: 'Complex Logic',
      data: {
        key: 'premium_beta',
        name: 'Premium Beta Access',
        description: 'Premium users in specific countries, partial rollout',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
        rules: {
          operator: 'AND',
          conditions: [
            {
              field: 'country',
              operator: 'IN',
              value: ['US', 'CA', 'UK'],
            },
            {
              field: 'subscription',
              operator: 'EQUALS',
              value: 'premium',
            },
            {
              field: 'age',
              operator: 'GTE',
              value: 18,
            },
          ],
          rollout: {
            percentage: 30,
          },
        },
      },
    },
  ];

  const categories = ['all', ...new Set(templates.map((t) => t.category))];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (template: FlagTemplate) => {
    onUseTemplate(template.data);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
      >
        <span>✨</span>
        <span>Show Examples</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">✨ Flag Examples & Templates</h2>
            <p className="text-sm text-purple-100 mt-1">
              Click &quot;Use This&quot; to populate the form with example data
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
                {cat === 'all' ? 'All Examples' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className="text-xs text-gray-500">{template.category}</span>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Use This
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="bg-gray-900 rounded p-2">
                  <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                    {JSON.stringify(template.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
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
