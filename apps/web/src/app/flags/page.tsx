'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Flag } from '@/lib/api';
import { Button, Badge, Alert } from '@/components/ui';

export default function FlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await api.getFlags();
      setFlags(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flags');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Delete flag "${key}"?`)) return;
    
    try {
      await api.deleteFlag(id);
      await loadFlags();
    } catch {
      alert('Failed to delete flag');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const getDaysSinceEvaluation = (lastEvaluatedAt: string | null): number | null => {
    if (!lastEvaluatedAt) return null;
    return Math.floor(
      (Date.now() - new Date(lastEvaluatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const isStale = (flag: Flag): boolean => {
    if (!flag.lastEvaluatedAt) return true;
    const days = getDaysSinceEvaluation(flag.lastEvaluatedAt);
    return days !== null && days > 30;
  };

  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      const { DEMO_FLAG_TEMPLATES } = await import('@/lib/demo-flags');
      const result = await api.seedDemoData(DEMO_FLAG_TEMPLATES);
      alert(`✅ ${result.message}\n${result.created} flags created`);
      await loadFlags();
    } catch (err) {
      alert('Failed to seed demo data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    if (!confirm('Are you sure you want to clear all data? This will delete ALL flags.')) return;
    
    try {
      setLoading(true);
      const result = await api.clearDemoData();
      alert(`✅ ${result.message}\n${result.deleted} flags deleted`);
      await loadFlags();
    } catch (err) {
      alert('Failed to clear demo data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading flags...</div>;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
        <div className="flex space-x-2">
          {flags.length > 0 && (
            <Button
              variant="danger"
              onClick={handleClearDemoData}
            >
              🗑️ Clear All Data
            </Button>
          )}
          <Link href="/flags/new">
            <Button variant="primary">
              + Create Flag
            </Button>
          </Link>
        </div>
      </div>

      {flags.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg space-y-6">
          <div>
            <p className="text-gray-600 text-lg mb-2">No flags yet!</p>
            <p className="text-gray-500 text-sm">Get started by creating a flag or seeding demo data</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSeedDemoData}
              className="bg-purple-600 hover:bg-purple-700"
            >
              ✨ Seed Demo Data
            </Button>
            <Link href="/flags/new">
              <Button variant="primary" size="lg">
                + Create Flag
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-left max-w-2xl mx-auto bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">💡 What does &quot;Seed Demo Data&quot; do?</h3>
            <p className="text-sm text-purple-800 mb-2">Creates 11 sample flags showcasing:</p>
            <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
              <li>Simple conditions (country, email, age)</li>
              <li>Complex rules (AND/OR operators)</li>
              <li>Rollout percentages (50% gradual rollout)</li>
              <li>Different environments (dev, staging, prod)</li>
              <li>Different states (draft, live, deprecated)</li>
              <li>Stale flags for lifecycle testing</li>
            </ul>
            <p className="text-sm text-purple-800 mt-2">
              Perfect for testing evaluation, stale flag detection, and exploring all features!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Evaluated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flag.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {flag.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <Badge variant="environment" value={flag.environment}>
                      {flag.environment}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge variant="state" value={flag.state}>
                      {flag.state}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>{formatDate(flag.lastEvaluatedAt)}</span>
                      {isStale(flag) && (
                        <span
                          className="text-yellow-600"
                          title={
                            !flag.lastEvaluatedAt
                              ? 'Never evaluated'
                              : `${getDaysSinceEvaluation(flag.lastEvaluatedAt)} days since last evaluation`
                          }
                        >
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/flags/${flag.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/flags/${flag.id}/edit`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(flag.id, flag.key)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
