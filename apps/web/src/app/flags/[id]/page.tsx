'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Flag } from '@/lib/api';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';

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
    } catch {
      alert('Failed to delete flag');
    }
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
        <Alert variant="error">
          {error || 'Flag not found'}
        </Alert>
        <Link href="/flags" className="text-blue-600 hover:text-blue-900">
          ← Back to Flags
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/flags" className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block">
            ← Back to Flags
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{flag.name}</h1>
          <p className="text-gray-600 mt-1">Key: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{flag.key}</code></p>
        </div>
        <div className="flex gap-2">
          <Link href={`/flags/${flag.id}/edit`}>
            <Button variant="primary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
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
                <Badge variant="environment" value={flag.environment}>
                  {flag.environment}
                </Badge>
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">State</span>
              <p className="mt-1">
                <Badge variant="state" value={flag.state}>
                  {flag.state}
                </Badge>
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href={`/evaluate?flagKey=${flag.key}&environment=${flag.environment}`}>
              <Button variant="secondary" size="sm">
                🔍 Test Evaluation
              </Button>
            </Link>
            <Link href={`/flags/${flag.id}/edit`}>
              <Button variant="secondary" size="sm">
                ✏️ Edit Flag
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
