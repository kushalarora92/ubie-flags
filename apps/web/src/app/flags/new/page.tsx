'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import FlagExamples from '@/components/FlagExamples';
import Link from 'next/link';

export default function NewFlagPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    environment: 'dev',
    state: 'draft',
    defaultValue: false,
    rules: '',
  });

  const handleUseTemplate = (templateData: any) => {
    setFormData({
      key: templateData.key,
      name: templateData.name,
      description: templateData.description || '',
      environment: templateData.environment,
      state: templateData.state,
      defaultValue: templateData.defaultValue,
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
      if (formData.rules.trim()) {
        try {
          rules = JSON.parse(formData.rules);
        } catch {
          throw new Error('Invalid JSON in rules field');
        }
      }

      await api.createFlag({
        key: formData.key,
        name: formData.name,
        description: formData.description || undefined,
        environment: formData.environment as any,
        state: formData.state as any,
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
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-4 text-red-800">
          {error}
        </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Value <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.defaultValue ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="false">OFF (false)</option>
              <option value="true">ON (true)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rules (JSON)
          </label>
          <textarea
            value={formData.rules}
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
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Flag'}
          </button>
          <Link
            href="/flags"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
