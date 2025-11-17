'use client';

import { useEffect, useState } from 'react';
import { api, Flag, FlagStats } from '@/lib/api';
import Link from 'next/link';

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

  function getStateBadge(state: string) {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      live: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
    };
    return colors[state as keyof typeof colors] || colors.draft;
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
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Flags</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700">Stale (30 days)</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.stale.thirtyDays}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-700">Stale (60 days)</div>
            <div className="text-2xl font-bold text-orange-900">{stats.stale.sixtyDays}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700">Stale (90 days)</div>
            <div className="text-2xl font-bold text-red-900">{stats.stale.ninetyDays}</div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedDays(30)}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedDays === 30
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setSelectedDays(60)}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedDays === 60
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          60 Days
        </button>
        <button
          onClick={() => setSelectedDays(90)}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedDays === 90
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          90 Days
        </button>
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
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateBadge(
                        flag.state
                      )}`}
                    >
                      {flag.state}
                    </span>
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
