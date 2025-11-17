import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome to UbieFlags</h1>
        <p className="mt-2 text-lg text-gray-600">
          Feature flag management with explainable evaluation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/flags"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold text-gray-900">📋 Manage Flags</h2>
          <p className="mt-2 text-gray-600">
            Create, view, and manage feature flags across environments
          </p>
        </Link>

        <Link
          href="/evaluate"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold text-gray-900">🔍 Test Evaluation</h2>
          <p className="mt-2 text-gray-600">
            Evaluate flags with user context and see detailed explanations
          </p>
        </Link>

        <Link
          href="/stale"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold text-gray-900">⚠️ Stale Flags</h2>
          <p className="mt-2 text-gray-600">
            View flags that haven&apos;t been evaluated recently
          </p>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900">Core Differentiators</h3>
        <ul className="mt-3 space-y-2 text-blue-800">
          <li>✓ <strong>Explainability:</strong> See exactly why a flag evaluated to true/false</li>
          <li>✓ <strong>Lifecycle Management:</strong> Track usage and identify stale flags</li>
          <li>✓ <strong>Simple Rules:</strong> Easy-to-understand conditions and rollouts</li>
        </ul>
      </div>
    </div>
  );
}
