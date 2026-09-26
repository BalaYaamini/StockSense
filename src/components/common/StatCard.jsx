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
      iconBg: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/40',
    },
    sage: {
      iconBg: 'bg-sage-50 dark:bg-sage-950/40 text-sage-600 dark:text-sage-400 border-sage-100 dark:border-sage-900/40',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
    },
    rose: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
    }
  }[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border border-slate-200/80 dark:border-[#2a2a2a] bg-white dark:bg-[#121212] transition-all duration-200 shadow-xs flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:shadow-card-hover hover:border-slate-300 dark:hover:border-[#3a3a3a] group' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
            {badgeText && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                variant === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900' :
                variant === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900' :
                'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">{subtext}</p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform ${variantStyles.iconBg} ${onClick ? 'group-hover:scale-105' : ''}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
