import React from 'react';
import { FlagState, FlagEnvironment } from '@/constants/flag';

export type BadgeVariant = 'state' | 'environment' | 'custom';
export type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  value?: FlagState | FlagEnvironment | string;
}

export default function Badge({ children, variant = 'custom', color, value }: BadgeProps) {
  // Auto-determine color based on variant and value
  const getColorForState = (state: string): BadgeColor => {
    switch (state) {
      case FlagState.DRAFT:
        return 'gray';
      case FlagState.LIVE:
        return 'green';
      case FlagState.DEPRECATED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getColorForEnvironment = (env: string): BadgeColor => {
    switch (env) {
      case FlagEnvironment.DEV:
        return 'blue';
      case FlagEnvironment.STAGING:
        return 'yellow';
      case FlagEnvironment.PROD:
        return 'purple';
      default:
        return 'gray';
    }
  };

  let finalColor: BadgeColor = color || 'gray';
  
  if (variant === 'state' && value) {
    finalColor = getColorForState(value);
  } else if (variant === 'environment' && value) {
    finalColor = getColorForEnvironment(value);
  }

  const colorStyles: Record<BadgeColor, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorStyles[finalColor]}`}>
      {children}
    </span>
  );
}
