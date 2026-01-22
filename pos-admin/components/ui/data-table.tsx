"use client";

import { Search, Filter, Download, Plus } from "lucide-react";
import { ReactNode } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  onExport?: () => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  actions?: ReactNode;
}

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearch,
  onAdd,
  onExport,
  addButtonLabel = "Add New",
  emptyMessage = "No data available",
  actions,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border ">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center gap-3 flex-wrap text-gray-900">
        {/* Search */}
        {onSearch && (
          <div className="relative flex-1 min-w-[200px] ">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none  focus:ring-2 focus:ring-black/10 text-sm"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {actions}
          
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          )}

          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              {addButtonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full  text-gray-900">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (if needed) */}
      {data.length > 0 && (
        <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-500">
          <div>Showing {data.length} results</div>
          <div className="flex items-center gap-2">
            {/* Add pagination buttons if needed */}
          </div>
        </div>
      )}
    </div>
  );
}
