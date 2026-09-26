import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/60 dark:border-[#2a2a2a] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
              isActive
                ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#1a1a1a]'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-sage-500' : 'text-slate-400'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-sage-50 dark:bg-sage-500/10 text-sage-600 border border-sage-100 dark:border-sage-500/20'
                    : 'bg-slate-200 dark:bg-[#2a2a2a] text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
