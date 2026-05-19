import { Plus, Sun, Moon, User as UserIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../../../ui/DataTable";
import Button from "../../../ui/Button";
import AddSecurityModal from "../components/AddSecurityModal";
import ViewSecurityModal from "../components/ViewSecurityModal";
import { securityGuardApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";
import ConfirmPopup from "../../../ui/ConfirmPopup";
import Avatar from "../../../components/Avatar";
import { EditIcon, EyeIcon, TrashIcon } from "../../../assets/icons/admin-dashboard-icons";

export default function SecurityGuard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedGuard, setSelectedGuard] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");

  const [userRole, setUserRole] = useState<string>("");

  const fetchGuards = async () => {
    try {
      setLoading(true);
      const profileData = await authApi.getProfile();
      const user = profileData.user;
      setUserRole(user?.role || "");
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        setGuards([]);
        return;
      }

      const res = await securityGuardApi.getAll(societyId);
      setGuards(res.securityGuard || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch security guards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  const handleEdit = (guard: any) => {
    setSelectedGuard(guard);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (guard: any) => {
    setSelectedGuard(guard);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedGuard(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await securityGuardApi.delete(deleteId);
      toast.success("Security guard deleted successfully");
      fetchGuards();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete security guard");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Security Guard Name",
      className: "text-left lg:flex-[2]",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0">
            <Avatar
              src={row.profileImage}
              name={row.name || `${row.firstname} ${row.lastname}`}
            />
          </div>
          <span className="text-[14px] font-medium text-[#202224]">{row.name || `${row.firstname} ${row.lastname}`}</span>
        </div>
      ),
    },
    { key: "phoneNumber", header: "Phone Number", className: "text-left lg:flex-[1.4]", render: (row: any) => <span className="text-[14px] font-medium text-[#202224]">{row.phoneNumber}</span> },
    {
      key: "shift",
      header: "Select Shift",
      className: "text-center lg:flex-[1.25]",
      render: (row: any) => (
        <span className={`inline-flex h-[31px] min-w-[113px] items-center justify-center gap-[5px] rounded-full px-3 text-[12px] font-medium ${row.shift === 'Day' ? 'bg-[#FFF9E7] text-[#FFB302]' : 'bg-[#313131] text-white'
          }`}>
          {row.shift === 'Day' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="capitalize">{row.shift}</span>
        </span>
      )
    },
    {
      key: "shiftDate",
      header: "Shift Date",
      className: "text-center lg:flex-[1.25]",
      render: (row: any) => {
        if (!row.shiftDate) return <span className="text-gray-500">N/A</span>;
        const date = new Date(row.shiftDate);
        return <span className="text-[14px] font-medium text-[#202224]">{date.toLocaleDateString('en-GB')}</span>;
      }
    },
    {
      key: "shiftTime",
      header: "Shift Time",
      className: "text-center lg:flex-[1.15]",
      render: (row: any) => <span className="text-[14px] font-medium text-[#202224]">{row.shiftTime}</span>
    },
    {
      key: "gender",
      header: "Gender",
      className: "text-center lg:flex-[1.15]",
      render: (row: any) => (
        <span className={`inline-flex h-[31px] min-w-[113px] items-center justify-center gap-[5px] rounded-full px-3 text-[12px] font-medium ${row.gender?.toLowerCase() === 'male' ? 'bg-[#F1F4FF] text-[#5678E9]' : 'bg-[#FFF1F8] text-[#FF71BA]'
          }`}>
          <UserIcon size={14} />
          <span className="capitalize">{row.gender}</span>
        </span>
      )
    },
    {
      key: "action",
      header: "Action",
      className: "text-center lg:flex-[1]",
      render: (row: any) => (
        <div className="flex items-center justify-center gap-[10px]">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] bg-[#E8F7EC] text-[#39973D] transition hover:scale-105"
            aria-label="Edit security guard"
          >
            <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
              <EditIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleView(row)}
            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[#5678E9] transition hover:scale-105"
            aria-label="View security guard"
          >
            <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
              <EyeIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteId(row._id)}
            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] bg-[#FFF0F0] text-[#E74C3C] transition hover:scale-105"
            aria-label="Delete security guard"
          >
            <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
              <TrashIcon />
            </span>
          </button>
        </div>
      )
    },
  ].filter(col => userRole === "admin" || col.key !== "action");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-[20px] font-semibold leading-[28px] text-[#202224]">Security Guard Details</h1>

          {userRole === "admin" && (
            <Button
              variant="primary"
              onClick={handleAdd}
              className="h-[51px] rounded-[10px] px-[14px] text-[14px] font-semibold shadow-[0_8px_20px_rgba(254,81,46,0.22)]"
              leftIcon={<Plus size={20} />}
            >
              Add Security
            </Button>
          )}
        </div>

        <div className="max-h-[calc(100vh-16rem)] overflow-x-auto overflow-y-auto pr-1 [scrollbar-width:thin]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#FE512E]" />
              <p className="text-gray-400 font-medium">Loading guards...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={guards}
              getRowKey={(row) => row._id.toString()}
            />
          )}
        </div>
      </div>

      <AddSecurityModal
        open={isModalOpen && modalMode !== "view"}
        mode={modalMode === "view" ? "add" : modalMode}
        initialData={selectedGuard}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGuard(null);
        }}
        onSuccess={fetchGuards}
      />

      <ViewSecurityModal
        open={isModalOpen && modalMode === "view"}
        data={selectedGuard}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGuard(null);
        }}
      />

      <ConfirmPopup
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Security Guard"
        message="Are you sure you want to delete this security guard? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
