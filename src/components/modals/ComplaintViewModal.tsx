import AppModal from "./AppModal";
import type { ComplaintStatus, Priority } from "../../data/dashboard.data";
import { data } from "react-router-dom";

export type ComplaintViewData = {
  id: string;
  complainerName: string;
  complaintName: string;
  date: string;
  priority: Priority;
  status: ComplaintStatus;
  initials: string;
  description?: string;
  wing?: string;
  unit?: string;
};

type ComplaintViewModalProps = {
  open: boolean;
  complaint: ComplaintViewData | null;
  onClose: () => void;
};

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

function MetaItem({
  label,
  value,
  badgeClassName,
  badgeClassExtra = "",
  className = "",
}: {
  label: string;
  value: string;
  badgeClassName?: string;
  badgeClassExtra?: string;
  className?: string;
}) {
  return (
    <div className={`flex h-[55px] flex-col items-center justify-start text-center ${className}`}>
      <p className="w-full text-center text-[16px] font-normal leading-[16px] text-[#A7A7A7]">
        {label}
      </p>

      <div className="mt-[8px] flex h-[31px] w-full items-center justify-center">
        {badgeClassName ? (
          <span
            className={`inline-flex h-[31px] items-center justify-center rounded-full px-[10px] text-[14px] font-normal leading-none sm:px-[12px] sm:text-[16px] ${badgeClassName} ${badgeClassExtra}`}
          >
            {value}
          </span>
        ) : (
          <p className="text-center text-[16px] font-normal leading-[20px] text-[#202224]">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ComplaintViewModal({
  open,
  complaint,
  onClose,
}: ComplaintViewModalProps) {
  if (!complaint) return null;

  const formattedDate =
    complaint.date === "01/02/2024" ? "Aug 5, 2024" : complaint.date;

  return (
    <AppModal
      open={open}
      title="View Complain"
      widthClassName="w-[410px]"
      panelClassName="!h-[416px]"
      showHeaderDivider
      headerRight={
        <button
          type="button"
          aria-label="Close view complaint"
          onClick={onClose}
          className="-mt-1 grid h-[24px] w-[24px] place-items-center text-[30px] font-light leading-none text-[#202224]"
        >
          ×
        </button>
      }
    >
      <div className="mt-[20px] flex h-[283px] w-full max-w-[370px] flex-col">
        {/* User Row */}
        <div className="flex h-[70px] w-[285px] items-center gap-[15px]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F6F8FB] text-base font-bold uppercase text-[#5678E9]">
            {complaint.initials || complaint.complainerName?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold leading-[20px] text-[#202224]">
              {complaint.complainerName}
            </h3>

            <p className="mt-[5px] text-[16px] font-normal leading-[20px] text-[#A7A7A7]">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Request Name */}
        <div className="mt-[25px]">
          <p className="text-[16px] font-normal leading-[16px] text-[#A7A7A7]">
            Request Name
          </p>

          <p className="mt-[8px] text-[16px] font-normal leading-[20px] text-[#202224]">
            {complaint.complaintName}
          </p>
        </div>

        {/* Description */}
        <div className="mt-[25px] h-[75px] w-full max-w-[370px]">
          <p className="text-[16px] font-normal leading-[16px] text-[#A7A7A7]">
            Description
          </p>

          <p className="mt-[8px] text-[16px] font-normal leading-[16px] text-[#202224]">
            {complaint.description ??
              "Offering, giving, receiving, or soliciting of value to influence the actions of an."}
          </p>
        </div>

        {/* Bottom Meta Row - no outer box, only vertical dividers */}
        <div className="mt-[25px] grid h-[55px] w-full max-w-[364px] grid-cols-[22%_22%_31%_25%]">
          <MetaItem
            label="Wing"
            value={complaint.wing ?? "A"}
            className="border-r border-[#F4F4F4] pr-[12px]"
          />

          <MetaItem
            label="Unit"
            value={complaint.unit ?? "1002"}
            className="border-r border-[#F4F4F4] px-[12px]"
          />

          <MetaItem
            label="Priority"
            value={complaint.priority}
            badgeClassName={priorityClasses[complaint.priority]}
            badgeClassExtra="min-w-[78px]"
            className="border-r border-[#F4F4F4] px-[12px]"
          />

          <MetaItem
            label="Status"
            value={complaint.status}
            badgeClassName={statusClasses[complaint.status]}
            badgeClassExtra="min-w-[62px]"
            className="pl-[12px]"
          />
        </div>
      </div>
    </AppModal>
  );
}