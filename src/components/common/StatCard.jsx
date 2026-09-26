import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive', 'negative', 'warning', 'neutral'
  badgeText,
  variant = 'default', // 'default', 'coral', 'amber', 'rose', 'emerald'
  onClick,
  actionText
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700',
      accent: 'text-slate-900',
    },
    coral: {
      bg: 'bg-white',
      border: 'border-coral-200/80 ring-1 ring-coral-500/10',
      iconBg: 'bg-coral-50 text-coral-600 border border-coral-100',
      accent: 'text-coral-600',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-amber-200/80 ring-1 ring-amber-500/10',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      accent: 'text-amber-600',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-rose-200/80 ring-1 ring-rose-500/10',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      accent: 'text-rose-600',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-emerald-200/80 ring-1 ring-emerald-500/10',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      accent: 'text-emerald-600',
    }
  }[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border shadow-card transition-all duration-200 ${variantStyles.bg} ${variantStyles.border} ${
        onClick ? 'cursor-pointer hover:shadow-card-hover hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {value}
            </span>
            {badgeText && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                variant === 'rose' ? 'bg-rose-100 text-rose-700' :
                variant === 'amber' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl ${variantStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          {trend && (
            <span
              className={`inline-flex items-center font-semibold ${
                trendType === 'positive'
                  ? 'text-emerald-600'
                  : trendType === 'negative'
                  ? 'text-rose-600'
                  : trendType === 'warning'
                  ? 'text-amber-600'
                  : 'text-slate-600'
              }`}
            >
              {trendType === 'positive' && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
              {trendType === 'negative' && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {trend}
            </span>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>

        {actionText && (
          <span className="inline-flex items-center font-semibold text-coral-600 hover:text-coral-700 group">
            {actionText}
            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  );
};
