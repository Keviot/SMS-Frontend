import type { ReactNode } from "react";

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
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={String(column.key)}
                className={`bg-[var(--blue)] px-[15px] py-[12px] text-left text-[14px] font-semibold text-white ${
                  index === 0 ? "rounded-l-[10px]" : ""
                } ${index === columns.length - 1 ? "rounded-r-[10px]" : ""} ${
                  column.className || ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-[#F1F1F1] last:border-b-0">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-[15px] py-[15px] text-[14px] font-medium text-[var(--text-tertiary)]"
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