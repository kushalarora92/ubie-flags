'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, EvaluationResult } from '@/lib/api';
import EvaluationExamples from '@/components/EvaluationExamples';
import { Button, Select, Alert } from '@/components/ui';
import { FLAG_ENVIRONMENT_OPTIONS } from '@/constants/flag';

export default function EvaluatePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    flagKey: '',
    environment: 'dev',
    context: '{\n  "userId": "user123",\n  "country": "CA"\n}',
  });

  // Pre-fill from URL params if present
  useEffect(() => {
    const flagKey = searchParams.get('flagKey');
    const environment = searchParams.get('environment');
    
    if (flagKey) {
      setFormData(prev => ({
        ...prev,
        flagKey,
        environment: environment || prev.environment,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse context JSON
      let context;
      try {
        context = JSON.parse(formData.context);
      } catch {
        throw new Error('Invalid JSON in context field');
      }

      const evalResult = await api.evaluateFlag(
        formData.flagKey,
        formData.environment,
        context
      );
      
      setResult(evalResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate flag');
    } finally {
      setLoading(false);
    }
  };

  const handleUseScenario = (flagKey: string, environment: string, context: Record<string, unknown>) => {
    setFormData({
      flagKey,
      environment,
      context: JSON.stringify(context, null, 2),
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Flag Evaluation</h1>
          <p className="mt-2 text-gray-600">
            Evaluate a flag with user context and see detailed explanations
          </p>
        </div>
        <EvaluationExamples onUseScenario={handleUseScenario} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Input</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flag Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.flagKey}
                onChange={(e) => setFormData({ ...formData, flagKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="new_onboarding"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment <span className="text-red-500">*</span>
              </label>
              <Select
                options={FLAG_ENVIRONMENT_OPTIONS}
                value={formData.environment}
                onChange={(value) => setFormData({ ...formData, environment: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Context (JSON) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={10}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Evaluating...' : 'Evaluate Flag'}
            </Button>
          </form>
        </div>

        {/* Result Display */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Result</h2>

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              {/* Result Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Flag Result:</span>
                <span
                  className={`px-4 py-2 rounded-lg font-semibold text-lg ${
                    result.result
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.result ? 'true ✓' : 'false ✗'}
                </span>
              </div>

              {/* Explanation */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  🔍 Detailed Explanation
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Flag:</span>{' '}
                    <span className="text-gray-900">{result.explanation.flagKey}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Environment:</span>{' '}
                    <span className="text-gray-900">{result.explanation.environment}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Default Value:</span>{' '}
                    <span className="text-gray-900">
                      {result.explanation.defaultValue ? 'true' : 'false'}
                    </span>
                  </div>
                  {result.explanation.matchedRule && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Matched Rule:</span>{' '}
                      <span className="text-gray-900">{result.explanation.matchedRule}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluation Steps */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  📋 Evaluation Steps
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-1 font-mono text-xs">
                    {result.explanation.details.map((detail, index) => (
                      <li
                        key={index}
                        className={`${
                          detail.includes('✓')
                            ? 'text-green-700'
                            : detail.includes('✗')
                            ? 'text-red-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Core Differentiator Callout */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Core Differentiator:</strong> This explanation shows exactly WHY
                  the flag evaluated this way - making debugging instant and transparent!
                </p>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="text-center py-12 text-gray-400">
              <p>Enter flag details and click Evaluate to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
