import { MoreVertical, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../ui/Button";
import { cn } from "../../../lib/cn";
import CreateFacilityModal from "../components/CreateFacilityModal";
import { facilityApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";
import ConfirmPopup from "../../../ui/ConfirmPopup";

interface Facility {
  _id: string;
  name: string;
  scheduleServiceDate: string;
  description: string;
  remindBefore?: number;
}

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [role, setRole] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      // Fetch profile to get society ID
      const profileData = await authApi.getProfile();
      const user = profileData.user;
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        setFacilities([]);
        return;
      }

      const res = await facilityApi.getAll(societyId);
      // Backend returns { message: "...", data: [...] }
      setFacilities(res.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    const fetchRole = async () => {
      try {
        const data = await authApi.getProfile();
        if (data.user) {
          setRole(data.user.role?.toLowerCase());
        }
      } catch (error) {
        console.error("Failed to fetch role in FacilityManagement:", error);
      }
    };
    fetchRole();
  }, []);

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFacility(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await facilityApi.delete(deleteId);
      toast.success("Facility deleted successfully");
      fetchFacilities();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete facility");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#F6F8FB] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Facility Management</h1>
          
          {role && role !== "resident" && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FE512E] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              Create Facility
            </Button>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#FE512E]" />
              <p className="text-gray-400 font-medium">Loading facilities...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Plus size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Facilities Found</h3>
              <p className="text-gray-500 max-w-xs">
                {role === "resident" 
                  ? "No facilities have been added by the administrator yet." 
                  : "You haven't added any facilities yet. Click \"Create Facility\" to get started."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((facility) => (
                <FacilityCard 
                  key={facility._id} 
                  facility={facility} 
                  role={role}
                  onEdit={() => handleEdit(facility)}
                  onDelete={() => setDeleteId(facility._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateFacilityModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        facility={selectedFacility}
        onSuccess={fetchFacilities}
      />

      <ConfirmPopup 
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Facility"
        message="Are you sure you want to delete this facility? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

function FacilityCard({ facility, role, onEdit, onDelete }: { facility: Facility, role: string | null, onEdit: () => void, onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full group">
      {/* Card Header */}
      <div className="bg-[#5678E9] text-white p-4 flex justify-between items-center">
        <h3 className="font-bold text-sm truncate pr-2">{facility.name}</h3>
        {role !== "resident" && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4 flex-1">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-medium">Upcoming Schedule Service Date</span>
            <span className="text-[12px] text-gray-900 font-bold">
              {facility.scheduleServiceDate ? new Date(facility.scheduleServiceDate).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-gray-400 font-medium">Description</p>
          <p className="text-[12px] text-gray-900 leading-relaxed font-medium line-clamp-3">
            {facility.description}
          </p>
        </div>
      </div>
    </div>
  );
}
