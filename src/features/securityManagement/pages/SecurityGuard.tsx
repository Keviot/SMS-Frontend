import { Plus, Edit, Eye, Trash2, Sun, Moon, User as UserIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../../../ui/DataTable";
import Button from "../../../ui/Button";
import AddSecurityModal from "../components/AddSecurityModal";
import ViewSecurityModal from "../components/ViewSecurityModal";
import { securityGuardApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";
import ConfirmPopup from "../../../ui/ConfirmPopup";
import Avatar from "../../../components/Avatar";

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
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex shrink-0">
            <Avatar
              src={row.profileImage}
              name={row.name || `${row.firstname} ${row.lastname}`}
            />
          </div>
          <span className="font-semibold text-gray-900">{row.name || `${row.firstname} ${row.lastname}`}</span>
        </div>
      ),
    },
    { key: "phoneNumber", header: "Phone Number", render: (row: any) => <span className="text-gray-500 font-medium">{row.phoneNumber}</span> },
    {
      key: "shift",
      header: "Select Shift",
      render: (row: any) => (
        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${row.shift === 'Day' ? 'bg-[#FFF9E7] text-[#FFB302]' : 'bg-[#313131] text-white'
          }`}>
          {row.shift === 'Day' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="capitalize">{row.shift}</span>
        </span>
      )
    },
    {
      key: "shiftDate",
      header: "Shift Date",
      render: (row: any) => {
        if (!row.shiftDate) return <span className="text-gray-500">N/A</span>;
        const date = new Date(row.shiftDate);
        return <span className="text-gray-500 font-medium">{date.toLocaleDateString('en-GB')}</span>;
      }
    },
    { key: "shiftTime", header: "Shift Time", render: (row: any) => <span className="text-gray-500 font-medium">{row.shiftTime}</span> },
    {
      key: "gender",
      header: "Gender",
      render: (row: any) => (
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${row.gender?.toLowerCase() === 'male' ? 'bg-[#F1F4FF] text-[#5678E9]' : 'bg-[#FFF1F8] text-[#FF71BA]'
          }`}>
          <UserIcon size={14} />
          <span className="capitalize">{row.gender}</span>
        </span>
      )
    },
    {
      key: "action",
      header: "Action",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white text-[#39973D] transition-all hover:bg-green-50 shadow-sm"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleView(row)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white text-[#5678E9] transition-all hover:bg-blue-50 shadow-sm"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white text-[#E74C3C] transition-all hover:bg-red-50 shadow-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ].filter(col => userRole === "admin" || col.key !== "action");

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#F6F8FB] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Security Guard Details</h1>

          {userRole === "admin" && (
            <Button
              variant="primary"
              onClick={handleAdd}
              className="h-12 px-6 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] whitespace-nowrap"
              leftIcon={<Plus size={20} />}
            >
              Add Security
            </Button>
          )}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
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
