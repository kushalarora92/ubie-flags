'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: string;
  sampleData?: string;
  sampleContext?: string;
  expectedOutcome: string;
  link?: string;
}

export default function DemoPage() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const feature1Steps: DemoStep[] = [
    {
      id: 'f1-s1',
      title: 'Create a Simple Flag',
      description: 'Start with a basic boolean flag for a new feature',
      action: 'Go to "Create Flag" and use this data',
      sampleData: JSON.stringify({
        key: 'new_onboarding',
        name: 'New Onboarding Flow',
        description: 'Enable new user onboarding experience',
        environment: 'dev',
        state: 'draft',
        defaultValue: false,
      }, null, 2),
      expectedOutcome: 'Flag created successfully in dev environment with draft state',
      link: '/flags/new',
    },
    {
      id: 'f1-s2',
      title: 'Create Flag with Country-Based Rules',
      description: 'Create a flag that targets specific countries',
      action: 'Create another flag with targeting rules',
      sampleData: JSON.stringify({
        key: 'canada_promotion',
        name: 'Canada Holiday Promotion',
        description: 'Special promotion for Canadian users',
        environment: 'staging',
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
      }, null, 2),
      expectedOutcome: 'Flag created with country-based targeting',
      link: '/flags/new',
    },
    {
      id: 'f1-s3',
      title: 'Create Flag with AND Logic',
      description: 'Target beta testers in specific countries',
      action: 'Create a flag with multiple conditions',
      sampleData: JSON.stringify({
        key: 'beta_access',
        name: 'Beta Features Access',
        description: 'Early access for beta testers in select countries',
        environment: 'prod',
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
      }, null, 2),
      expectedOutcome: 'Flag created requiring both country AND role match',
      link: '/flags/new',
    },
    {
      id: 'f1-s4',
      title: 'View All Flags',
      description: 'Check the flags list to see your created flags',
      action: 'Navigate to the Flags page',
      expectedOutcome: 'See all 3 flags listed with their environment and state',
      link: '/flags',
    },
    {
      id: 'f1-s5',
      title: 'View Flag Details',
      description: 'Click on any flag to see complete information',
      action: 'Click "View" on any flag',
      expectedOutcome: 'See detailed information including rules, timestamps, and lifecycle data',
      link: '/flags',
    },
    {
      id: 'f1-s6',
      title: 'Edit a Flag',
      description: 'Update the state of your first flag',
      action: 'Click "Edit" on the new_onboarding flag, change state to "live"',
      expectedOutcome: 'Flag state updated from draft to live',
      link: '/flags',
    },
  ];

  const feature2Steps: DemoStep[] = [
    {
      id: 'f2-s1',
      title: 'Evaluate Simple Flag - Match',
      description: 'Test the canada_promotion flag with a Canadian user',
      action: 'Go to Test Evaluation and use these values',
      sampleData: JSON.stringify({
        flagKey: 'canada_promotion',
        environment: 'staging',
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'user123',
        country: 'CA',
      }, null, 2),
      expectedOutcome: '✓ Result: TRUE | Explanation: "Condition matched: country == CA"',
      link: '/evaluate',
    },
    {
      id: 'f2-s2',
      title: 'Evaluate Simple Flag - No Match',
      description: 'Test with a US user (should fail)',
      action: 'Same flag, different context',
      sampleData: JSON.stringify({
        flagKey: 'canada_promotion',
        environment: 'staging',
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'user456',
        country: 'US',
      }, null, 2),
      expectedOutcome: '✗ Result: FALSE | Explanation shows condition didn\'t match',
      link: '/evaluate',
    },
    {
      id: 'f2-s3',
      title: 'Evaluate AND Logic - Both Match',
      description: 'Test beta_access with correct country AND role',
      action: 'Evaluate with matching conditions',
      sampleData: JSON.stringify({
        flagKey: 'beta_access',
        environment: 'prod',
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'beta_user_1',
        country: 'CA',
        role: 'beta_tester',
      }, null, 2),
      expectedOutcome: '✓ Result: TRUE | All AND conditions satisfied',
      link: '/evaluate',
    },
    {
      id: 'f2-s4',
      title: 'Evaluate AND Logic - Partial Match',
      description: 'Test with only one condition matching',
      action: 'Right country, wrong role',
      sampleData: JSON.stringify({
        flagKey: 'beta_access',
        environment: 'prod',
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'regular_user',
        country: 'CA',
        role: 'regular_user',
      }, null, 2),
      expectedOutcome: '✗ Result: FALSE | AND requires all conditions to match',
      link: '/evaluate',
    },
    {
      id: 'f2-s5',
      title: 'Create & Test OR Logic',
      description: 'Create a flag where any condition can match',
      action: 'Create a new flag first, then evaluate',
      sampleData: JSON.stringify({
        key: 'special_access',
        name: 'Special Access',
        environment: 'dev',
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
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'user789',
        role: 'user',
        email: 'john@company.com',
      }, null, 2),
      expectedOutcome: '✓ Result: TRUE | Only needs one condition (email matches)',
      link: '/flags/new',
    },
    {
      id: 'f2-s6',
      title: 'Create & Test Rollout (50%)',
      description: 'Test gradual rollout with consistent hashing',
      action: 'Create a rollout flag',
      sampleData: JSON.stringify({
        key: 'gradual_rollout',
        name: 'Gradual Feature Rollout',
        environment: 'dev',
        state: 'live',
        defaultValue: false,
        rules: {
          rollout: {
            percentage: 50,
          },
        },
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'test_user_1',
      }, null, 2),
      expectedOutcome: '~50% of users see TRUE (consistent per userId)',
      link: '/flags/new',
    },
    {
      id: 'f2-s7',
      title: 'Test Rollout Consistency',
      description: 'Verify same user always gets same result',
      action: 'Evaluate same userId multiple times',
      sampleData: JSON.stringify({
        flagKey: 'gradual_rollout',
        environment: 'dev',
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'test_user_1',
      }, null, 2),
      expectedOutcome: 'Result stays consistent across evaluations',
      link: '/evaluate',
    },
    {
      id: 'f2-s8',
      title: 'Create & Test Targeted Rollout',
      description: 'Combine conditions with rollout',
      action: 'Create a flag with both targeting and rollout',
      sampleData: JSON.stringify({
        key: 'targeted_rollout',
        name: 'Targeted Rollout',
        environment: 'dev',
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
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'canadian_user_1',
        country: 'CA',
      }, null, 2),
      expectedOutcome: 'Must match country first, then 50% rollout applies',
      link: '/flags/new',
    },
    {
      id: 'f2-s9',
      title: 'Test Numeric Operators',
      description: 'Test age-based restrictions',
      action: 'Create an age-restricted flag',
      sampleData: JSON.stringify({
        key: 'age_restricted',
        name: 'Age Restricted Content',
        environment: 'dev',
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
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'user_25',
        age: 25,
      }, null, 2),
      expectedOutcome: '✓ Result: TRUE (25 >= 18)',
      link: '/flags/new',
    },
    {
      id: 'f2-s10',
      title: 'Test String Operators',
      description: 'Test email domain matching',
      action: 'Create internal features flag',
      sampleData: JSON.stringify({
        key: 'internal_features',
        name: 'Internal Features',
        environment: 'dev',
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
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'employee_1',
        email: 'john@company.com',
      }, null, 2),
      expectedOutcome: '✓ Result: TRUE (email ends with @company.com)',
      link: '/flags/new',
    },
  ];

  const feature3Steps: DemoStep[] = [
    {
      id: 'f3-s1',
      title: 'View Lifecycle Statistics',
      description: 'Check overall flag health metrics',
      action: 'Go to Stale Flags page',
      expectedOutcome: 'See total flags and stale counts for 30/60/90 days',
      link: '/stale',
    },
    {
      id: 'f3-s2',
      title: 'Create Flag That Won\'t Be Evaluated',
      description: 'Create a flag to test stale detection',
      action: 'Create a new flag',
      sampleData: JSON.stringify({
        key: 'forgotten_feature',
        name: 'Forgotten Feature',
        description: 'This flag will never be evaluated',
        environment: 'prod',
        state: 'live',
        defaultValue: false,
      }, null, 2),
      expectedOutcome: 'Flag created with lastEvaluatedAt = null',
      link: '/flags/new',
    },
    {
      id: 'f3-s3',
      title: 'Check Stale Flags List',
      description: 'View flags that haven\'t been evaluated',
      action: 'Go to Stale Flags → Select "30 Days"',
      expectedOutcome: 'See forgotten_feature in the list with ⚠️ warning',
      link: '/stale',
    },
    {
      id: 'f3-s4',
      title: 'Check Flags List for Stale Indicators',
      description: 'Verify stale badges appear on main flags page',
      action: 'Go to Flags page',
      expectedOutcome: 'See ⚠️ icon next to forgotten_feature with tooltip',
      link: '/flags',
    },
    {
      id: 'f3-s5',
      title: 'Evaluate the Stale Flag',
      description: 'Update lastEvaluatedAt by evaluating',
      action: 'Evaluate forgotten_feature',
      sampleData: JSON.stringify({
        flagKey: 'forgotten_feature',
        environment: 'prod',
      }, null, 2),
      sampleContext: JSON.stringify({
        userId: 'test_user',
      }, null, 2),
      expectedOutcome: 'Flag evaluated, lastEvaluatedAt timestamp updated',
      link: '/evaluate',
    },
    {
      id: 'f3-s6',
      title: 'Verify Flag is No Longer Stale',
      description: 'Check that flag disappears from stale list',
      action: 'Go back to Stale Flags page',
      expectedOutcome: 'forgotten_feature no longer shows in stale list',
      link: '/stale',
    },
    {
      id: 'f3-s7',
      title: 'Mark Flag as Deprecated',
      description: 'Follow the deprecation workflow',
      action: 'Go to a stale flag → Edit → Change state to "deprecated"',
      expectedOutcome: 'Flag state changed, shows in red badge',
      link: '/flags',
    },
    {
      id: 'f3-s8',
      title: 'Filter Stale Flags by Time Period',
      description: 'Test different time filters',
      action: 'On Stale Flags page, click "60 Days" and "90 Days" buttons',
      expectedOutcome: 'List updates to show flags stale for that period',
      link: '/stale',
    },
    {
      id: 'f3-s9',
      title: 'View Updated Statistics',
      description: 'Check how stats changed after deprecation',
      action: 'Check the stats cards at top of Stale Flags page',
      expectedOutcome: 'Numbers updated to reflect current flag states',
      link: '/stale',
    },
  ];

  const allScenarios = [
    { id: 'feature1', title: '🚩 Feature 1: Basic Flag Management', steps: feature1Steps },
    { id: 'feature2', title: '🔍 Feature 2: Explainable Evaluation', steps: feature2Steps },
    { id: 'feature3', title: '📊 Feature 3: Lifecycle & Stale Flags', steps: feature3Steps },
  ];

  const totalSteps = feature1Steps.length + feature2Steps.length + feature3Steps.length;
  const progress = (completedSteps.size / totalSteps) * 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2">🎬 UbieFlags Complete Demo</h1>
        <p className="text-lg text-blue-100">
          Interactive walkthrough showcasing all features with sample data and expected outcomes
        </p>
        <div className="mt-4">
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-blue-100 mt-2">
            Progress: {completedSteps.size} / {totalSteps} steps completed ({Math.round(progress)}%)
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Demo Tips</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Click the 📋 button to copy sample data to clipboard</li>
                <li>Use the checkboxes to track your progress</li>
                <li>Links open in new tabs so you don&apos;t lose your place</li>
                <li>Follow steps in order for the best experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Scenarios */}
      {allScenarios.map((scenario) => (
        <div key={scenario.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Scenario Header */}
          <button
            onClick={() => setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id)}
            className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{expandedScenario === scenario.id ? '📖' : '📕'}</span>
              <h2 className="text-xl font-bold text-gray-900">{scenario.title}</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                {scenario.steps.filter((s) => completedSteps.has(s.id)).length} / {scenario.steps.length}
              </span>
            </div>
            <span className="text-gray-400">
              {expandedScenario === scenario.id ? '▼' : '▶'}
            </span>
          </button>

          {/* Steps */}
          {expandedScenario === scenario.id && (
            <div className="divide-y divide-gray-200">
              {scenario.steps.map((step, index) => (
                <div key={step.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={completedSteps.has(step.id)}
                      onChange={() => toggleStep(step.id)}
                      className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                          Step {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      </div>

                      <p className="text-gray-600 mb-3">{step.description}</p>

                      <div className="space-y-3">
                        {/* Action */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">📌 Action:</span>
                          <span className="text-sm text-gray-900">{step.action}</span>
                          {step.link && (
                            <Link
                              href={step.link}
                              target="_blank"
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              → Go
                            </Link>
                          )}
                        </div>

                        {/* Sample Data */}
                        {step.sampleData && (
                          <div className="bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400 font-mono">Sample Data:</span>
                              <button
                                onClick={() => copyToClipboard(step.sampleData!)}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded flex items-center space-x-1"
                              >
                                <span>📋</span>
                                <span>Copy</span>
                              </button>
                            </div>
                            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                              {step.sampleData}
                            </pre>
                          </div>
                        )}

                        {/* Sample Context */}
                        {step.sampleContext && (
                          <div className="bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400 font-mono">Sample Context:</span>
                              <button
                                onClick={() => copyToClipboard(step.sampleContext!)}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded flex items-center space-x-1"
                              >
                                <span>📋</span>
                                <span>Copy</span>
                              </button>
                            </div>
                            <pre className="text-xs text-blue-400 font-mono overflow-x-auto">
                              {step.sampleContext}
                            </pre>
                          </div>
                        )}

                        {/* Expected Outcome */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <span className="text-sm font-medium text-green-800">✓ Expected Outcome:</span>
                          <p className="text-sm text-green-700 mt-1">{step.expectedOutcome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Completion Message */}
      {progress === 100 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🎉</span>
            <div>
              <h3 className="text-lg font-bold text-green-800">Congratulations!</h3>
              <p className="text-green-700">
                You&apos;ve completed the entire demo walkthrough and explored all three core features of UbieFlags!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
