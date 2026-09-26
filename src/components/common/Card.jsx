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
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-card-hover hover:border-slate-300' : ''
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
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-5 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-coral-50 text-coral-600 border border-coral-100 flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
