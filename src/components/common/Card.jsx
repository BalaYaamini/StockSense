import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  noPadding = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-card-hover hover:border-slate-300 dark:hover:border-[#3a3a3a]' : ''
      } ${noPadding ? '' : 'p-6'} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#2a2a2a] mb-5 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-sage-50 text-sage-600 border border-sage-100 flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
