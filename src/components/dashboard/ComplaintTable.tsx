import type { ComplaintStatus, Priority } from "../../data/dashboard.data";
import { EditIcon, EyeIcon, TrashIcon } from "../../icons/admin-dashboard-icons";
import Card from "../ui/Card";

type ComplaintRow = {
  id: string;
  complainerName: string;
  complaintName: string;
  date: string;
  priority: Priority;
  status: ComplaintStatus;
  avatar?: string;
};

type ComplaintTableProps = {
  data: ComplaintRow[];
};

const priorityStyles: Record<
  Priority,
  {
    bg: string;
    text: string;
  }
> = {
  Medium: {
    bg: "#5678E9",
    text: "#FFFFFF",
  },
  Low: {
    bg: "#39973D",
    text: "#FFFFFF",
  },
  High: {
    bg: "#E74C3C",
    text: "#FFFFFF",
  },
};

const statusStyles: Record<
  ComplaintStatus,
  {
    bg: string;
    text: string;
  }
> = {
  Open: {
    bg: "#5678E91A",
    text: "#5678E9",
  },
  Pending: {
    bg: "#FFC3131A",
    text: "#FFC313",
  },
  Solve: {
    bg: "#39973D1A",
    text: "#39973D",
  },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const style = priorityStyles[priority];

  return (
    <span
      className="inline-flex h-[26px] min-w-[70px] items-center justify-center rounded-full px-[14px] text-[11px] font-medium leading-none"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {priority}
    </span>
  );
}

function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className="inline-flex h-[26px] min-w-[78px] items-center justify-center rounded-full px-[14px] text-[11px] font-medium leading-none"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {status}
    </span>
  );
}

type ActionButtonProps = {
  label: string;
  children: React.ReactNode;
  iconColor: string;
};

function ActionButton({ label, children, iconColor }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[#F6F8FB] transition hover:opacity-80"
      style={{
        color: iconColor,
      }}
    >
      <span className="flex h-[14px] w-[14px] items-center justify-center [&_svg]:h-[14px] [&_svg]:w-[14px] [&_svg]:text-current [&_svg_path]:stroke-current">
        {children}
      </span>
    </button>
  );
}

export default function ComplaintTable({ data }: ComplaintTableProps) {
  return (
    <Card className="h-[320px] w-full rounded-[14px] border border-[#EDF0F5] bg-white p-[15px] shadow-[0px_8px_24px_rgba(15,23,42,0.05)] lg:h-[361px] lg:p-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold leading-none text-[#202224] sm:text-[16px] lg:text-[18px]">
          Complaint List
        </h2>

        <button
          type="button"
          className="flex h-[36px] items-center gap-[8px] rounded-[10px] border border-[#E6EAF0] bg-white px-[14px] text-[12px] font-medium text-[#202224]"
        >
          Month
          <span className="text-[10px]">⌄</span>
        </button>
      </div>

      {/* Table */}
      <div className="mt-[16px] h-[250px] overflow-y-auto rounded-[12px] lg:h-[286px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-[1]">
            <tr className="h-[46px] bg-[#F0F3FF]">
              <th className="rounded-l-[10px] px-[18px] text-left text-[11px] font-semibold text-[#202224]">
                Complainer Name
              </th>
              <th className="px-[18px] text-left text-[11px] font-semibold text-[#202224]">
                Complaint Name
              </th>
              <th className="px-[18px] text-left text-[11px] font-semibold text-[#202224]">
                Date
              </th>
              <th className="px-[18px] text-left text-[11px] font-semibold text-[#202224]">
                Priority
              </th>
              <th className="px-[18px] text-left text-[11px] font-semibold text-[#202224]">
                Complain Status
              </th>
              <th className="rounded-r-[10px] px-[18px] text-left text-[11px] font-semibold text-[#202224]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="h-[58px] border-b border-[#F1F1F1] last:border-b-0"
              >
                <td className="px-[18px]">
                  <div className="flex items-center gap-[10px]">
                    {row.avatar ? (
                      <img
                        src={row.avatar}
                        alt={row.complainerName}
                        className="h-[30px] w-[30px] rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#FFF1E8] text-[11px] font-semibold text-[#FF6B2C]">
                        {row.complainerName.charAt(0)}
                      </div>
                    )}

                    <span className="whitespace-nowrap text-[12px] font-medium text-[#202224]">
                      {row.complainerName}
                    </span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-[18px] text-[12px] font-medium text-[#202224]">
                  {row.complaintName}
                </td>

                <td className="whitespace-nowrap px-[18px] text-[12px] font-medium text-[#202224]">
                  {row.date}
                </td>

                <td className="px-[18px]">
                  <PriorityBadge priority={row.priority} />
                </td>

                <td className="px-[18px]">
                  <ComplaintStatusBadge status={row.status} />
                </td>

                <td className="px-[18px]">
                  <div className="flex items-center gap-[8px]">
                    <ActionButton label="Edit complaint" iconColor="#39973D">
                      <EditIcon />
                    </ActionButton>

                    <ActionButton label="View complaint" iconColor="WHITE">
                      <EyeIcon />
                    </ActionButton>

                    <ActionButton label="Delete complaint" iconColor="WHITE">
                      <TrashIcon />
                    </ActionButton>
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