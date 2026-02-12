"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTable({
  columns,
  data = [],
  pagination,
  onPageChange,
  loading = false,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200 gap-2">
          <p className="text-xs md:text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {Math.min(
                pagination.current_page * (pagination.per_page || data.length),
                pagination.total
              )}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </p>
          <div className="flex items-center justify-end gap-1 md:gap-2">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="p-1.5 rounded bg-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              <span className="hidden md:inline text-xs ml-1">Previous</span>
            </button>
            {/* Page number buttons */}
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
              .filter((page) => {
                const current = pagination.current_page;
                // show first & last, and window around current
                return (
                  page === 1 ||
                  page === pagination.last_page ||
                  (page >= current - 2 && page <= current + 2)
                );
              })
              .map((page, index, arr) => {
                const prev = arr[index - 1];
                const needEllipsis = prev && page - prev > 1;
                return (
                  <span key={page} className="flex items-center">
                    {needEllipsis && (
                      <span className="px-1 text-xs text-gray-400">…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onPageChange(page)}
                      className={`min-w-[28px] px-2 py-1 rounded-md text-xs font-medium ${
                        page === pagination.current_page
                          ? "bg-brand-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="p-1.5 rounded bg-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <span className="hidden md:inline text-xs mr-1">Next</span>
              <ChevronRight size={16} />
            </button>
            {pagination.last_page > 1 && (
              <button
                type="button"
                onClick={() => onPageChange(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="ml-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                Last
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
