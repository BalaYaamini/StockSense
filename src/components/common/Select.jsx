import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  required,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-coral-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`appearance-none block w-full rounded-xl border bg-white text-slate-900 text-sm pl-3.5 pr-10 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer ${
            error
              ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const label = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
