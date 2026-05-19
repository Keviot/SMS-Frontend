import { MoreVertical, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../ui/Button";
import { cn } from "../../../lib/cn";
import CreateAnnouncementModal from "../components/CreateAnnouncementModal";
import AnnouncementDetailModal from "../components/AnnouncementDetailModal";
import { announcementApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";
import ConfirmPopup from "../../../ui/ConfirmPopup";

interface AnnouncementItem {
  _id: string;
  title: string;
  description: string;
  announcementType: string[];
  date: string;
  time: string;
}

export default function Announcement() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [viewAnnouncement, setViewAnnouncement] = useState<AnnouncementItem | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch profile to get society ID
      const profileData = await authApi.getProfile();
      const user = profileData.user;
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        setAnnouncements([]);
        return;
      }

      const res = await announcementApi.getAll(societyId);
      setAnnouncements(res.announcement || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const fetchRole = async () => {
      try {
        const data = await authApi.getProfile();
        if (data.user) {
          setRole(data.user.role?.toLowerCase());
        }
      } catch (error) {
        console.error("Failed to fetch role in Announcement:", error);
      }
    };
    fetchRole();
  }, []);

  const handleEdit = (announcement: AnnouncementItem) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await announcementApi.delete(deleteId);
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete announcement");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="bg-[#F6F8FB] p-4 lg:p-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
       <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-[#202224]">Announcement</h1>

          {role !== "resident" && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-11 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              Create Announcement
            </Button>
          )}
        </div>

        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#FE512E]" />
              <p className="text-gray-400 font-medium">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-lg font-bold text-gray-900">No Announcements Found</h3>
              <p className="text-gray-500 max-w-xs">Broadcast important notices to all society members.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {announcements.map((item) => (
                <AnnouncementCard
                  key={item._id}
                  item={item}
                  role={role}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => setDeleteId(item._id)}
                  onView={() => setViewAnnouncement(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateAnnouncementModal
        open={isModalOpen}
        onClose={handleCloseModal}
        announcement={selectedAnnouncement}
        onSuccess={fetchAnnouncements}
      />

      <AnnouncementDetailModal
        open={Boolean(viewAnnouncement)}
        onClose={() => setViewAnnouncement(null)}
        announcement={viewAnnouncement}
      />

      <ConfirmPopup
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

function AnnouncementCard({ item, role, onEdit, onDelete, onView }: { item: AnnouncementItem, role: string | null, onEdit: () => void, onDelete: () => void, onView: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeColor = (type: string | string[]) => {
    const t = Array.isArray(type) ? type[0] : type;
    switch (t) {
      case "Notice":
        return "bg-[#5678E9]"; // Blue
      case "Event":
        return "bg-[#FFB302]"; // Yellow/Orange
      case "Community Initiatives":
        return "bg-[#34A853]"; // Green
      default:
        return "bg-[#5678E9]";
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#DDE5FF] bg-white shadow-sm">
      {/* Card Header */}
      <div className={cn("flex items-center justify-between px-3 py-2.5 text-white", getTypeColor(item.announcementType))}>
        <h3 className="font-bold text-sm truncate pr-2">
          {Array.isArray(item.announcementType) ? item.announcementType[0] : item.announcementType}
        </h3>
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
                {role !== "resident" && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    onView();
                    setShowMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium",
                    role !== "resident" && "border-b border-gray-50"
                  )}
                >
                  View
                </button>
                {role !== "resident" && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-3 p-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-gray-400 font-medium">Announcement Date</span>
            <span className="text-[13px] text-gray-900 font-bold">
              {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-gray-400 font-medium">Announcement Time</span>
            <span className="text-[13px] text-gray-900 font-bold">
              {item.time || "N/A"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-gray-50">
          <p className="text-[12px] text-gray-400 font-medium">Description</p>
          <p className="line-clamp-2 text-xs font-medium leading-5 text-[#202224]">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
