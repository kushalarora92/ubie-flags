import { FlagEnvironment, FlagState } from '@/constants/flag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string;
  environment: FlagEnvironment;
  state: FlagState;
  defaultValue: boolean;
  rules?: string | object;
  createdAt: string;
  updatedAt: string;
  lastEvaluatedAt: string | null;
}

export interface EvaluationResult {
  result: boolean;
  explanation: {
    flagKey: string;
    environment: string;
    result: boolean;
    defaultValue: boolean;
    matchedRule?: string;
    details: string[];
  };
}

export interface FlagStats {
  total: number;
  stale: {
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
  };
}

export const api = {
  // Flags
  async getFlags(): Promise<Flag[]> {
    const res = await fetch(`${API_BASE_URL}/flags`);
    if (!res.ok) throw new Error('Failed to fetch flags');
    return res.json();
  },

  async getFlag(id: string): Promise<Flag> {
    const res = await fetch(`${API_BASE_URL}/flags/${id}`);
    if (!res.ok) throw new Error('Failed to fetch flag');
    return res.json();
  },

  async createFlag(data: Partial<Flag>): Promise<Flag> {
    const res = await fetch(`${API_BASE_URL}/flags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create flag');
    }
    return res.json();
  },

  async updateFlag(id: string, data: Partial<Flag>): Promise<Flag> {
    const res = await fetch(`${API_BASE_URL}/flags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update flag');
    return res.json();
  },

  async deleteFlag(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/flags/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete flag');
  },

  // Evaluation
  async evaluateFlag(
    flagKey: string,
    environment: string,
    context: Record<string, unknown>
  ): Promise<EvaluationResult> {
    const res = await fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagKey, environment, context }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to evaluate flag');
    }
    return res.json();
  },

  // Lifecycle
  async getStaleFlags(days: number = 30): Promise<Flag[]> {
    const res = await fetch(`${API_BASE_URL}/flags/stale?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch stale flags');
    return res.json();
  },

  async getStats(): Promise<FlagStats> {
    const res = await fetch(`${API_BASE_URL}/flags/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Demo Data
  async seedDemoData(flags: Partial<Flag>[]): Promise<{ message: string; created: number; flags: Array<{ key: string; name: string; environment: string }> }> {
    const res = await fetch(`${API_BASE_URL}/flags/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flags }),
    });
    if (!res.ok) throw new Error('Failed to seed demo data');
    return res.json();
  },

  async clearDemoData(): Promise<{ message: string; deleted: number }> {
    const res = await fetch(`${API_BASE_URL}/flags/seed`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear demo data');
    return res.json();
  },
};
