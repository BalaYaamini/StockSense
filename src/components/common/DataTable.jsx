import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  pageSize = 10,
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your search filters or add a new record.',
  onRowClick,
  isLoading = false,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  
  // Safe page clamp
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  return (
    <div className={`w-full bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-card overflow-hidden ${className}`}>
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-5 py-3.5 ${col.headerAlign === 'right' ? 'text-right' : col.headerAlign === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2a2a2a] text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-3 border-sage-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{emptySubtext}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row[keyField] || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-sage-50/30 dark:hover:bg-sage-50/10' : 'hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`px-5 py-3.5 text-slate-700 dark:text-slate-300 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{(safePage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(safePage * pageSize, data.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800 dark:text-slate-200">{data.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-medium">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
