'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Flag } from '@/lib/api';

export default function FlagDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [flag, setFlag] = useState<Flag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadFlag(params.id as string);
    }
  }, [params.id]);

  const loadFlag = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getFlag(id);
      setFlag(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flag');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!flag || !confirm(`Delete flag "${flag.key}"?`)) return;

    try {
      await api.deleteFlag(flag.id);
      router.push('/flags');
    } catch (err) {
      alert('Failed to delete flag');
    }
  };

  const getStateBadge = (state: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      live: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
    };
    return colors[state as keyof typeof colors] || colors.draft;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-12">Loading flag...</div>;
  }

  if (error || !flag) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          Error: {error || 'Flag not found'}
        </div>
        <a href="/flags" className="text-blue-600 hover:text-blue-900">
          ← Back to Flags
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <a href="/flags" className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block">
            ← Back to Flags
          </a>
          <h1 className="text-3xl font-bold text-gray-900">{flag.name}</h1>
          <p className="text-gray-600 mt-1">Key: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{flag.key}</code></p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/flags/${flag.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </a>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white shadow rounded-lg divide-y">
        {/* Basic Info */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Environment</span>
              <p className="mt-1">
                <span className="px-2 py-1 text-sm rounded bg-gray-100">
                  {flag.environment}
                </span>
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">State</span>
              <p className="mt-1">
                <span className={`px-2 py-1 text-sm rounded ${getStateBadge(flag.state)}`}>
                  {flag.state}
                </span>
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-500">Default Value</span>
              <p className="mt-1 text-gray-900">
                {flag.defaultValue ? (
                  <span className="text-green-600 font-semibold">ON</span>
                ) : (
                  <span className="text-red-600 font-semibold">OFF</span>
                )}
              </p>
            </div>
          </div>

          {flag.description && (
            <div>
              <span className="text-sm font-medium text-gray-500">Description</span>
              <p className="mt-1 text-gray-900">{flag.description}</p>
            </div>
          )}
        </div>

        {/* Lifecycle Info */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Lifecycle Information</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Created At</span>
              <p className="mt-1 text-sm text-gray-900">{formatDate(flag.createdAt)}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Updated At</span>
              <p className="mt-1 text-sm text-gray-900">{formatDate(flag.updatedAt)}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Last Evaluated At</span>
              <p className="mt-1 text-sm text-gray-900">
                {flag.lastEvaluatedAt ? (
                  formatDate(flag.lastEvaluatedAt)
                ) : (
                  <span className="text-yellow-600">Never evaluated</span>
                )}
              </p>
            </div>
          </div>

          {flag.lastEvaluatedAt && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              💡 This flag was last evaluated {Math.floor((Date.now() - new Date(flag.lastEvaluatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Rules</h2>
          
          {flag.rules ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-900 font-mono overflow-x-auto">
                {JSON.stringify(flag.rules, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-600">No rules defined. This flag uses the default value.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          <a
            href={`/evaluate?flagKey=${flag.key}&environment=${flag.environment}`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            🔍 Test Evaluation
          </a>
          <a
            href={`/flags/${flag.id}/edit`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            ✏️ Edit Flag
          </a>
        </div>
      </div>
    </div>
  );
}
