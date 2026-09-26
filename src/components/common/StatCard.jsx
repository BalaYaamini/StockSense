import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  variant = 'default',
  onClick
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-slate-100 text-slate-600',
    },
    sage: {
      iconBg: 'bg-sage-50 text-sage-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
    }
  }[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border border-slate-200/60 dark:border-[#2a2a2a] bg-white dark:bg-[#121212] transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-[#3a3a3a]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
            {badgeText && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                variant === 'rose' ? 'bg-rose-100 text-rose-700' :
                variant === 'amber' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300'
              }`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{subtext}</p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${variantStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
