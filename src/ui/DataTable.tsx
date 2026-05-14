import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey?: (row: T) => string;
  isLoading?: boolean;
};

export default function DataTable<T>({
  columns,
  data,
  getRowKey = (row: any) => row.id || row._id || Math.random().toString(),
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[#FE512E]/20 border-t-[#FE512E] rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-400 font-medium">No records found</p>
      </div>
    );
  }
  return (
    <div className="w-full overflow-x-auto max-h-[680px] overflow-y-auto custom-scrollbar">
      <table className="w-full border-collapse mt-0">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={String(column.key)}
                className={cn(
                  "bg-white-grey h-15 px-4 py-3 text-sm font-bold transition-colors sticky top-0 z-10",
                  index === 0 && "rounded-tl-xl",
                  index === columns.length - 1 && "rounded-tr-xl",
                  column.className || "text-left"
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-[#F1F1F1] last:border-b-0 hover:bg-gray-50 transition-colors">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    "h-17 px-4 py-3 text-sm text-white-black",
                    column.className || "text-left"
                  )}
                >
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[String(column.key)] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}