'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import FlagExamples from '@/components/FlagExamples';
import Link from 'next/link';
import { CreateFlagFormData, FlagEnvironment, FlagState, FLAG_ENVIRONMENT_OPTIONS, FLAG_STATE_OPTIONS } from '@/constants/flag';
import { Button, Select, Alert } from '@/components/ui';

export default function NewFlagPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateFlagFormData>({
    key: '',
    name: '',
    description: '',
    environment: 'dev',
    state: 'draft',
    defaultValue: false,
    rules: '',
  });

  const handleUseTemplate = (templateData: Partial<CreateFlagFormData>) => {
    setFormData({
      key: templateData.key || '',
      name: templateData.name || '',
      description: templateData.description || '',
      environment: templateData.environment || 'dev',
      state: templateData.state || 'draft',
      defaultValue: templateData.defaultValue ?? false,
      rules: templateData.rules ? JSON.stringify(templateData.rules, null, 2) : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse rules if provided
      let rules = undefined;
      if (formData.rules && typeof formData.rules === 'string' && formData.rules.trim()) {
        try {
          rules = JSON.parse(formData.rules);
        } catch {
          throw new Error('Invalid JSON in rules field');
        }
      } else if (formData.rules && typeof formData.rules === 'object') {
        rules = formData.rules;
      }

      await api.createFlag({
        key: formData.key,
        name: formData.name,
        description: formData.description || undefined,
        environment: formData.environment,
        state: formData.state,
        defaultValue: formData.defaultValue,
        rules,
      });

      router.push('/flags');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Flag</h1>
        <FlagExamples onUseTemplate={handleUseTemplate} />
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="new_onboarding"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New Onboarding Flow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Environment"
            required
            options={FLAG_ENVIRONMENT_OPTIONS}
            value={formData.environment}
            onChange={(value) => setFormData({ ...formData, environment: value as FlagEnvironment })}
          />

          <Select
            label="State"
            required
            options={FLAG_STATE_OPTIONS}
            value={formData.state}
            onChange={(value) => setFormData({ ...formData, state: value as FlagState })}
          />

          <Select
            label="Default Value"
            required
            options={[
              { value: 'false', label: 'false' },
              { value: 'true', label: 'true' },
            ]}
            value={formData.defaultValue ? 'true' : 'false'}
            onChange={(value) => setFormData({ ...formData, defaultValue: value === 'true' })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rules (JSON)
          </label>
          <textarea
            value={typeof formData.rules === 'string' ? formData.rules : JSON.stringify(formData.rules, null, 2)}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={10}
            placeholder={`{
  "operator": "AND",
  "conditions": [
    {
      "field": "country",
      "operator": "EQUALS",
      "value": "CA"
    }
  ]
}`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional: Enter rules as JSON. Leave empty for simple ON/OFF flag.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Creating...' : 'Create Flag'}
          </Button>
          <Link href="/flags">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
