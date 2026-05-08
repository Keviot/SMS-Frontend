import { useState } from "react";
import { User, Building2, Plus, Check } from "lucide-react";
import DataTable, { type DataTableColumn } from "../../ui/DataTable";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { cn } from "../../lib/cn";
import { EditIcon, EyeIcon } from "../../icons/admin-dashboard-icons";

interface Resident {
  id: string;
  fullName: string;
  unitNumber: string;
  unitStatus: "occupied" | "vacate";
  residentStatus: "tenant" | "owner";
  phoneNumber: string;
  member: number;
  vehicle: number;
  avatar?: string;
}

const mockResidents: Resident[] = [
  {
    id: "1",
    fullName: "Evelyn Harper",
    unitNumber: "A 1001",
    unitStatus: "occupied",
    residentStatus: "tenant",
    phoneNumber: "97587 85828",
    member: 1,
    vehicle: 2,
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    fullName: "-",
    unitNumber: "B 1002",
    unitStatus: "vacate",
    residentStatus: "tenant",
    phoneNumber: "--",
    member: 0,
    vehicle: 0,
  },
  {
    id: "3",
    fullName: "Evelyn Harper",
    unitNumber: "C 1003",
    unitStatus: "occupied",
    residentStatus: "owner",
    phoneNumber: "97587 85828",
    member: 1,
    vehicle: 4,
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "4",
    fullName: "Evelyn Harper",
    unitNumber: "D 1004",
    unitStatus: "occupied",
    residentStatus: "tenant",
    phoneNumber: "97587 85828",
    member: 4,
    vehicle: 2,
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "5",
    fullName: "-",
    unitNumber: "E 2001",
    unitStatus: "vacate",
    residentStatus: "tenant",
    phoneNumber: "--",
    member: 0,
    vehicle: 0,
  },
  {
    id: "6",
    fullName: "Robert Fox",
    unitNumber: "F 2002",
    unitStatus: "occupied",
    residentStatus: "tenant",
    phoneNumber: "97587 85828",
    member: 3,
    vehicle: 2,
    avatar: "https://i.pravatar.cc/150?u=6",
  },
  {
    id: "7",
    fullName: "Evelyn Harper",
    unitNumber: "G 2003",
    unitStatus: "occupied",
    residentStatus: "owner",
    phoneNumber: "97587 85828",
    member: 5,
    vehicle: 6,
    avatar: "https://i.pravatar.cc/150?u=7",
  },
];

export default function ResidentManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"occupied" | "vacate">("occupied");
  const [agreed, setAgreed] = useState(false);

  const columns: DataTableColumn<Resident>[] = [
    {
      key: "fullName",
      header: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
            {row.fullName !== "-" ? (
              <img src={row.avatar} alt={row.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                <User size={20} />
              </div>
            )}
          </div>
          <span className={row.fullName === "-" ? "text-gray-400" : "text-gray-900"}>{row.fullName}</span>
        </div>
      ),
    },
    {
      key: "unitNumber",
      header: "Unit Number",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-500">
            {row.unitNumber.charAt(0)}
          </span>
          <span className="font-semibold text-white-black">{row.unitNumber.split(" ")[1]}</span>
        </div>
      ),
    },
    {
      key: "unitStatus",
      header: "Unit Status",
      className: "text-center",
      render: (row) => (
        <StatusBadge variant={row.unitStatus} icon={Building2}>
          {row.unitStatus}
        </StatusBadge>
      ),
    },
    {
      key: "residentStatus",
      header: "Resident Status",
      className: "text-center",
      render: (row) => (
        row.fullName !== "-" ? (
          <StatusBadge variant={row.residentStatus} icon={User}>
            {row.residentStatus}
          </StatusBadge>
        ) : (
          <span className="inline-flex h-8 min-w-25 items-center justify-center rounded-full bg-gray-light-grey  text-sm font-semibold text-gray-400">
            --
          </span>
        )
      ),
    },
    {
      key: "phoneNumber",
      header: "Phone Number",
      className: "text-center",
      render: (row) => (
        row.phoneNumber !== "--" ? (
          <span className="text-gray-600 font-medium">{row.phoneNumber}</span>
        ) : (
          <span className="inline-flex h-8 min-w-25 items-center justify-center rounded-full bg-gray-light-grey  text-sm font-semibold text-gray-400">
            --
          </span>
        )
      ),
    },
    {
      key: "member",
      header: "Member",
      className: "text-center",
      render: (row) => (
        row.member !== 0 ? (
          <span className="text-gray-600 font-medium">{row.member}</span>
        ) : (
          <span className="inline-flex h-8 min-w-25 items-center justify-center rounded-full bg-gray-light-grey  text-sm font-semibold text-gray-400">
            -
          </span>
        )
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      className: "text-center",
      render: (row) => (
        row.vehicle !== 0 ? (
          <span className="text-gray-600 font-medium">{row.vehicle}</span>
        ) : (
          <span className="inline-flex h-8 min-w-25 items-center justify-center rounded-full bg-gray-light-grey  text-sm font-semibold text-gray-400">
            -
          </span>
        )
      ),
    },
    {
      key: "actions",
      header: "Action",
      className: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {row.fullName !== "-" ? (
            <>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#00B69B] transition-colors hover:bg-blue-hover hover:text-black">
                <EditIcon className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#5678E9] transition-colors hover:bg-blue-hover hover:text-black">
                <EyeIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <span className="inline-flex h-[31px] min-w-[100px] items-center justify-center rounded-full bg-[#F6F8FB] text-[12px] font-semibold text-gray-400">
              --
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 mt-0">
      <div className="rounded-2xl bg-white p-6 mt-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Resident Tenant and Owner Details</h2>
          <Button 
            leftIcon={<Plus size={18} />} 
            className="h-13 w-74 rounded-2xl px-6 text-base"
            onClick={() => setIsModalOpen(true)}
          >
            Add New Resident details
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={mockResidents}
          getRowKey={(row) => row.id}
        />
      </div>

      <Modal open={isModalOpen} title="Residence Status" onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setSelectedStatus("occupied")}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all", 
                selectedStatus === "occupied" ? "border-[#FF6B35] bg-[#FFF8F5]" : "border-[#F1F1F1] bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center", 
                selectedStatus === "occupied" ? "border-[#FF6B35]" : "border-[#D9D9D9]"
              )}>
                {selectedStatus === "occupied" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />}
              </div>
              <span className={cn("font-bold text-base", selectedStatus === "occupied" ? "text-[#FF6B35]" : "text-[#A7A7A7]")}>
                Occupied
              </span>
            </div>
            
            <div 
              onClick={() => setSelectedStatus("vacate")}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all", 
                selectedStatus === "vacate" ? "border-[#FF6B35] bg-[#FFF8F5]" : "border-[#F1F1F1] bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center", 
                selectedStatus === "vacate" ? "border-[#FF6B35]" : "border-[#D9D9D9]"
              )}>
                {selectedStatus === "vacate" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />}
              </div>
              <span className={cn("font-bold text-base", selectedStatus === "vacate" ? "text-[#FF6B35]" : "text-[#A7A7A7]")}>
                Vacate
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
             <div className={cn(
               "w-5 h-5 rounded border flex items-center justify-center transition-all", 
               agreed ? "bg-[#FF6B35] border-[#FF6B35]" : "border-[#D9D9D9]"
             )}>
                {agreed && <Check size={14} className="text-white" />}
             </div>
             <p className="text-sm text-[#4D4D4D]">
               By submitting, you agree to select <span className="capitalize">{selectedStatus}</span>
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-12 rounded-xl text-base font-bold">
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)} className="h-12 rounded-xl text-base font-bold">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
