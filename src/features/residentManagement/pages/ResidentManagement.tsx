import { useState, useEffect } from "react";
import { User, Building2, Plus, Loader2 } from "lucide-react";
import { cn } from "../../../lib/cn";
import DataTable, { type DataTableColumn } from "../../../ui/DataTable";
import StatusBadge from "../../../ui/StatusBadge";
import Button from "../../../ui/Button";
import ResidenceStatusModal from "../components/ResidenceStatusModal";
import { EditIcon, EyeIcon } from "../../../assets/icons/admin-dashboard-icons";
import { residentApi, BASE_URL } from "../../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResidentViewModal from "../components/ResidentViewModal";
import Avatar from "../../../components/Avatar";

interface Resident {
  id: string;
  fullName: string;
  unitNumber: string;
  unitStatus: "occupied" | "vacate";
  residentStatus: "tenant" | "owner";
  phoneNumber: string;
  email: string;
  member: number;
  vehicle: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  avatar?: string;
}



export default function ResidentManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await residentApi.getAll();
      const sortedData = [...data].sort((a: any, b: any) => {
        const wingA = (a.wing || "").toUpperCase();
        const wingB = (b.wing || "").toUpperCase();
        if (wingA !== wingB) return wingA.localeCompare(wingB);

        const unitA = parseInt(a.unit) || 0;
        const unitB = parseInt(b.unit) || 0;
        return unitA - unitB;
      });

      const mapped: Resident[] = sortedData.map((r: any) => ({
        id: r._id,
        fullName: r.name || "-",
        unitNumber: `${r.wing || "-"} ${r.unit || "-"}`,
        unitStatus: r.unitStatus?.toLowerCase() === "vacant" ? "vacate" : "occupied",
        residentStatus: r.residentStatus?.toLowerCase() === "owner" ? "owner" : "tenant",
        phoneNumber: r.phoneNumber || "--",
        email: r.email || "",
        gender: r.gender,
        age: r.age,
        member: r.members?.length || 0,
        vehicle: r.vehicles?.length || 0,
        members: r.members || [],
        vehicles: r.vehicles || [],
        ownerName: r.ownerName,
        ownerPhone: r.ownerPhone,
        ownerAddress: r.ownerAddress,
        uploadAadharfront: r.uploadAadharfront,
        uploadAadharback: r.uploadAadharback,
        addressProof: r.addressProof,
        rentAgreeMent: r.rentAgreeMent,
        avatar: r.profileImage ? (r.profileImage.startsWith("http") ? r.profileImage : `${BASE_URL}/${r.profileImage}`) : undefined
      }));
      setResidents(mapped);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch residents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);



  const columns: DataTableColumn<Resident>[] = [
    {
      key: "fullName",
      header: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex shrink-0">
            <Avatar
              src={row.avatar}
              name={row.fullName}
            />
          </div>
          <span className={row.fullName === "-" ? "text-gray-400" : "text-gray-900"}>{row.fullName}</span>
        </div>
      ),
    },
    {
      key: "unitNumber",
      header: "Unit Number",
      render: (row) => {
        const wing = row.unitNumber.split(" ")[0] || "-";
        const unit = row.unitNumber.split(" ")[1] || "-";
        const getWingClass = (w: string) => {
          switch (w.toUpperCase()) {
            case 'A': return "bg-blue-50 text-blue-500";
            case 'B': return "bg-purple-50 text-purple-500";
            case 'C': return "bg-teal-50 text-teal-500";
            case 'D': return "bg-pink-50 text-pink-500";
            default: return "bg-blue-50 text-blue-500";
          }
        };
        return (
          <div className="flex items-center gap-2">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", getWingClass(wing))}>
              {wing}
            </span>
            <span className="font-semibold text-white-black">{unit}</span>
          </div>
        );
      },
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
        row.fullName !== "-" && row.phoneNumber !== "--" ? (
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
        <div className="flex justify-center">
          {row.fullName !== "-" && row.member !== 0 ? (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F6F8FB] text-sm font-semibold text-gray-700">
              {row.member}
            </span>
          ) : (
            <span className="inline-flex h-8 min-w-25 items-center justify-center rounded-full bg-gray-light-grey text-sm font-semibold text-gray-400">
              -
            </span>
          )}
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center">
          {row.fullName !== "-" && row.vehicle !== 0 ? (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F6F8FB] text-sm font-semibold text-gray-700">
              {row.vehicle}
            </span>
          ) : (
            <span className="inline-flex h-8 min-w-25 items-center justify-center rounded-full bg-gray-light-grey text-sm font-semibold text-gray-400">
              -
            </span>
          )}
        </div>
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
              <button
                onClick={() => navigate(`/resident-management/edit/${row.id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#00B69B] transition-colors hover:bg-blue-hover hover:text-black"
              >
                <EditIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedResident(row);
                  setIsViewModalOpen(true);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#5678E9] transition-colors hover:bg-blue-hover hover:text-black"
              >
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
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Add New Resident details
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={residents}
            getRowKey={(row) => row.id}
          />
        )}
      </div>

      <ResidenceStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchResidents}
        residents={residents}
      />
      <ResidentViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedResident(null);
        }}
        resident={selectedResident}
      />
    </div>
  );
}
