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
  getRowKey: (row: T) => string;
};

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse mt-0">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={String(column.key)}
                className={cn(
                  "bg-white-grey h-15 px-4 py-3 text-sm font-bold transition-colors",
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
            <tr key={getRowKey(row)} className="border-b border-gray-light-grey last:border-b-0">
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