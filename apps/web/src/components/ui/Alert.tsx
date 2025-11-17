import React from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ variant, children, onClose, className = '' }: AlertProps) {
  const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
    success: {
      container: 'bg-green-50 text-green-800 border-green-200',
      icon: '✓',
    },
    error: {
      container: 'bg-red-50 text-red-800 border-red-200',
      icon: '✕',
    },
    warning: {
      container: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: '⚠',
    },
    info: {
      container: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: 'ℹ',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${styles.container} ${className}`}>
      <div className="flex items-center space-x-3">
        <span className="text-lg font-bold">{styles.icon}</span>
        <div className="flex-1">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 ml-4"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
