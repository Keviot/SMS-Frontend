import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

interface OtherIncomeCardProps {
  data: {
    id: string;
    title: string;
    amountPerMember: number;
    totalMember: number;
    date: string;
    dueDate: string;
    description: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
}

export default function OtherIncomeCard({
  data,
  onEdit,
  onDelete,
  onView,
}: OtherIncomeCardProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="overflow-visible rounded-xl border border-[#D9DCE5] bg-white shadow-sm">
      <div className="flex h-12 items-center justify-between rounded-t-xl bg-[#5678E9] px-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">
          {data.title}
        </h3>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => !prev)}
            className="flex size-6 items-center justify-center rounded-md bg-white/20 text-white transition hover:bg-white/30"
          >
            <MoreVertical size={16} />
          </button>

          {openMenu && (
            <div className="absolute right-0 top-8 z-40 w-28 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(false);
                  onEdit(data.id);
                }}
                className="block w-full px-4 py-2 text-left text-xs font-medium text-[#202224] hover:bg-[#F6F8FB]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(false);
                  onView?.(data.id);
                }}
                className="block w-full px-4 py-2 text-left text-xs font-medium text-[#6F7786] hover:bg-[#F6F8FB] hover:text-[#202224]"
              >
                View
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(false);
                  onDelete(data.id);
                }}
                className="block w-full px-4 py-2 text-left text-xs font-medium text-[#6F7786] hover:bg-[#F6F8FB]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#6F7786]">Amount Per Member</span>
            <span className="font-semibold text-[#5678E9]">
              ₹{data.amountPerMember}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#6F7786]">Total Member</span>
            <span className="font-semibold text-[#202224]">
              {data.totalMember}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#6F7786]">Date</span>
            <span className="font-semibold text-[#202224]">{data.date}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#6F7786]">Due Date</span>
            <span className="font-semibold text-[#202224]">{data.dueDate}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-[#E5E7EB] pt-3">
          <p className="text-xs font-medium text-[#6F7786]">Description</p>
          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-[#202224]">
            {data.description}
          </p>
        </div>
      </div>
    </div>
  );
}