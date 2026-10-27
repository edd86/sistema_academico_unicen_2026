import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No se encontraron registros.',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto border border-[#e2e8f0] rounded-lg bg-white shadow-academic-sm ${className}`}>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="h-9 bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-semibold uppercase tracking-wider text-[11px]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-3 py-2 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#64748b] text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                className="h-10 hover:bg-[#f8fafc] transition-colors"
              >
                {columns.map((col, colIdx) => {
                  const content =
                    typeof col.accessor === 'function'
                      ? col.accessor(row, rowIdx)
                      : col.accessor
                      ? (row[col.accessor] as any)
                      : null;

                  return (
                    <td
                      key={colIdx}
                      className={`px-3 py-2 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
