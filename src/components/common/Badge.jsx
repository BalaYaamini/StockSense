import React from 'react';

const BADGE_VARIANTS = {
  // Stock Statuses
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-500/10',
  LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-500/10',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-500/10',

  // Operation Statuses
  DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  READY: 'bg-blue-50 text-blue-700 border-blue-200/60',
  WAITING: 'bg-amber-50 text-amber-700 border-amber-200/60',
  IN_TRANSIT: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/60',

  // Movement Types
  RECEIPT: 'bg-blue-50 text-blue-700 border-blue-200/60',
  DELIVERY: 'bg-purple-50 text-purple-700 border-purple-200/60',
  TRANSFER: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  ADJUSTMENT: 'bg-amber-50 text-amber-700 border-amber-200/60',
  INITIAL: 'bg-teal-50 text-teal-700 border-teal-200/60',

  // Default variants
  primary: 'bg-coral-50 text-coral-700 border-coral-200/60',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  info: 'bg-sky-50 text-sky-700 border-sky-200/60'
};

const BADGE_LABELS = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  DONE: 'Done',
  READY: 'Ready',
  WAITING: 'Waiting',
  IN_TRANSIT: 'In Transit',
  DRAFT: 'Draft',
  CANCELLED: 'Cancelled',
  RECEIPT: 'Receipt',
  DELIVERY: 'Delivery',
  TRANSFER: 'Transfer',
  ADJUSTMENT: 'Adjustment',
  INITIAL: 'Initial Stock'
};

export const Badge = ({
  variant = 'secondary',
  label,
  children,
  size = 'md',
  dot = false,
  className = ''
}) => {
  const resolvedVariant = BADGE_VARIANTS[variant] || BADGE_VARIANTS.secondary;
  const resolvedLabel = label || BADGE_LABELS[variant] || children;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-semibold',
    lg: 'text-sm px-3 py-1 font-semibold'
  }[size] || 'text-xs px-2.5 py-0.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${resolvedVariant} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'IN_STOCK' || variant === 'DONE' || variant === 'success'
              ? 'bg-emerald-500 animate-pulse'
              : variant === 'LOW_STOCK' || variant === 'WAITING' || variant === 'warning'
              ? 'bg-amber-500'
              : variant === 'OUT_OF_STOCK' || variant === 'CANCELLED' || variant === 'danger'
              ? 'bg-rose-500'
              : variant === 'IN_TRANSIT' || variant === 'TRANSFER'
              ? 'bg-indigo-500'
              : 'bg-blue-500'
          }`}
        />
      )}
      {resolvedLabel}
    </span>
  );
};
