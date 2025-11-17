'use client';

export default function StaleFlagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stale Flags</h1>
        <p className="mt-2 text-gray-600">
          Flags that haven't been evaluated recently (Feature 3 - Coming Soon)
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900">🚧 In Development</h3>
        <p className="mt-2 text-yellow-800">
          This page will show flags that haven't been evaluated in the last 30/60/90 days,
          helping you identify flags that are safe to deprecate or remove.
        </p>
        <p className="mt-2 text-yellow-800">
          <strong>Coming in Feature 3:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-yellow-800 list-disc list-inside">
          <li>View flags not evaluated in X days</li>
          <li>Suggest flags for deprecation</li>
          <li>Lifecycle statistics dashboard</li>
        </ul>
      </div>
    </div>
  );
}
