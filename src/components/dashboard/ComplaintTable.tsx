 import type { ComplaintStatus, Priority } from "../../data/dashboard.data";
import { EditIcon, EyeIcon, TrashIcon } from "../../icons/admin-dashboard-icons";
import Card from "../../ui/Card";

type ComplaintRow = {
  id: string;
  complainerName: string;
  complaintName: string;
  date: string;
  priority: Priority;
  status: ComplaintStatus;
  avatar?: string;
};

type ComplaintTableProps = { data: ComplaintRow[] };

const priorityClasses: Record<Priority, string> = {
  Medium: "bg-[#5678E9] text-white",
  Low: "bg-[#39973D] text-white",
  High: "bg-[#E74C3C] text-white",
};

const statusClasses: Record<ComplaintStatus, string> = {
  Open: "bg-[#5678E93A] text-[#5678E9]",
  Pending: "bg-[#FFC3131A] text-[#FFC313]",
  Solve: "bg-[#39973D1A] text-[#39973D]",
};

function Badge({ children, className }: { children: string; className: string }) {
  return (
    <span className={`inline-flex h-[31px] min-w-[78px] items-center justify-center rounded-full px-[16px] text-[12px] font-medium leading-none ${className}`}>
      {children}
    </span>
  );
}

function ActionButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-[30px] w-[30px] place-items-center rounded-[6px] bg-[#F6F8FB] transition hover:bg-[#EEF4FF] [&_svg]:h-[17px] [&_svg]:w-[17px]"
    >
      {children}
    </button>
  );
}

export default function ComplaintTable({ data }: ComplaintTableProps) {
  return (
    <Card className="h-[361px] p-[20px]">
      <div className="flex items-center justify-between gap-[12px]">
        <h2 className="text-[16px] font-semibold leading-[20px] text-[#202224]">Complaint List</h2>
        <button type="button" className="flex h-[36px] items-center gap-[8px] rounded-[10px] border border-[#D3D3D3] bg-white px-[14px] text-[12px] font-semibold text-[#202224]">
          Month <span className="text-[11px]">⌄</span>
        </button>
      </div>

      <div className="mt-[15px] h-[286px] overflow-auto rounded-[10px]">
        <table className="w-full min-w-[830px] border-collapse">
          <thead className="sticky top-0 z-[1]">
            <tr className="h-[50px] bg-[#F0F3FF]">
              {[
                "Complainer Name",
                "Complaint Name",
                "Date",
                "Priority",
                "Complain Status",
                "Action",
              ].map((heading, index, arr) => (
                <th
                  key={heading}
                  className={`px-[18px] text-left text-[12px] font-semibold text-[#202224] ${index === 0 ? "rounded-l-[10px]" : ""} ${index === arr.length - 1 ? "rounded-r-[10px]" : ""}`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="h-[58px] border-b border-[#F1F1F1] last:border-b-0">
                <td className="px-[18px]">
                  <div className="flex items-center gap-[10px]">
                    <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#FFF1E9] text-[11px] font-semibold text-[#FE512E]">
                      {row.complainerName.charAt(0)}
                    </div>
                    <span className="whitespace-nowrap text-[12px] font-medium text-[#202224]">{row.complainerName}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-[18px] text-[12px] font-medium text-[#202224]">{row.complaintName}</td>
                <td className="whitespace-nowrap px-[18px] text-[12px] font-medium text-[#202224]">{row.date}</td>
                <td className="px-[18px]"><Badge className={priorityClasses[row.priority]}>{row.priority}</Badge></td>
                <td className="px-[18px]"><Badge className={statusClasses[row.status]}>{row.status}</Badge></td>
                <td className="px-[18px]">
                  <div className="flex items-center gap-[8px]">
                    <ActionButton label="Edit complaint"><EditIcon /></ActionButton>
                    <ActionButton label="View complaint"><EyeIcon /></ActionButton>
                    <ActionButton label="Delete complaint"><TrashIcon /></ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
