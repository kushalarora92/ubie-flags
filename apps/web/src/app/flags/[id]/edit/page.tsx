'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { UpdateFlagFormData, FlagState, FLAG_STATE_OPTIONS } from '@/constants/flag';
import { Button, Select, Alert } from '@/components/ui';

export default function EditFlagPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateFlagFormData>({
    name: '',
    description: '',
    state: 'draft',
    defaultValue: false,
    rules: '',
  });

  useEffect(() => {
    if (params.id) {
      loadFlag(params.id as string);
    }
  }, [params.id]);

  const loadFlag = async (id: string) => {
    try {
      setLoading(true);
      const flag = await api.getFlag(id);
      
      setFormData({
        name: flag.name,
        description: flag.description || '',
        state: flag.state,
        defaultValue: flag.defaultValue,
        rules: flag.rules ? JSON.stringify(flag.rules, null, 2) : '',
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flag');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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

      await api.updateFlag(params.id as string, {
        name: formData.name,
        description: formData.description || undefined,
        state: formData.state,
        defaultValue: formData.defaultValue,
        rules,
      });

      router.push(`/flags/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flag');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading flag...</div>;
  }

  if (error && !formData.name) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          {error}
        </Alert>
        <Link href="/flags" className="text-blue-600 hover:text-blue-900">
          ← Back to Flags
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/flags/${params.id}`}
          className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block"
        >
          ← Back to Flag Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Flag</h1>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
          <strong>Note:</strong> You cannot change the key or environment of an existing flag.
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
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              { value: 'false', label: 'OFF' },
              { value: 'true', label: 'ON' },
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
            rows={15}
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to remove rules and use only the default value.
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} variant="primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href={`/flags/${params.id}`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
