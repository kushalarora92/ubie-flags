'use client';

import { useEffect, useState } from 'react';
import { api, Flag, FlagStats } from '@/lib/api';
import Link from 'next/link';
import { Button, Badge, Card } from '@/components/ui';

export default function StaleFlagsPage() {
  const [staleFlags, setStaleFlags] = useState<Flag[]>([]);
  const [stats, setStats] = useState<FlagStats | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [flags, statsData] = await Promise.all([
        api.getStaleFlags(selectedDays),
        api.getStats(),
      ]);
      setStaleFlags(flags);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stale flags:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDays]);

  function getDaysSinceEvaluation(lastEvaluatedAt: string | null): string {
    if (!lastEvaluatedAt) return 'Never evaluated';
    const days = Math.floor(
      (Date.now() - new Date(lastEvaluatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} days ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading stale flags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stale Flags</h1>
        <p className="mt-2 text-gray-600">
          Flags that haven&apos;t been evaluated recently and may be safe to deprecate
        </p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-gray-600">Total Flags</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="text-sm text-yellow-700">Stale (30 days)</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.stale.thirtyDays}</div>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <div className="text-sm text-orange-700">Stale (60 days)</div>
            <div className="text-2xl font-bold text-orange-900">{stats.stale.sixtyDays}</div>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <div className="text-sm text-red-700">Stale (90 days)</div>
            <div className="text-2xl font-bold text-red-900">{stats.stale.ninetyDays}</div>
          </Card>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={() => setSelectedDays(30)}
          variant={selectedDays === 30 ? 'primary' : 'secondary'}
        >
          30 Days
        </Button>
        <Button
          onClick={() => setSelectedDays(60)}
          variant={selectedDays === 60 ? 'primary' : 'secondary'}
        >
          60 Days
        </Button>
        <Button
          onClick={() => setSelectedDays(90)}
          variant={selectedDays === 90 ? 'primary' : 'secondary'}
        >
          90 Days
        </Button>
      </div>

      {/* Stale Flags Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {staleFlags.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-gray-900">No Stale Flags</h3>
            <p className="mt-2 text-gray-600">
              All flags have been evaluated within the last {selectedDays} days
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Flag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Evaluated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Suggestion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staleFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{flag.key}</div>
                    <div className="text-sm text-gray-500">{flag.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{flag.environment}</td>
                  <td className="px-6 py-4">
                    <Badge variant="state" value={flag.state}>
                      {flag.state}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getDaysSinceEvaluation(flag.lastEvaluatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-orange-700">
                      <span className="mr-1">⚠️</span>
                      Consider deprecating
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <Link
                      href={`/flags/${flag.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
