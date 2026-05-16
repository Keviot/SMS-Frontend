import { X } from "lucide-react";
import Modal from "../../../ui/Modal";

interface AnnouncementDetailModalProps {
  open: boolean;
  onClose: () => void;
  announcement: {
    title: string;
    description: string;
    announcementType: string[];
    date: string;
    time: string;
  } | null;
}

export default function AnnouncementDetailModal({ open, onClose, announcement }: AnnouncementDetailModalProps) {
  if (!announcement) return null;

  return (
    <Modal open={open} onClose={onClose} title="Announcement Details">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-[16px] text-gray-400 font-medium">Announcement Type</p>
          <div className="flex flex-wrap gap-1">
            {announcement.announcementType.map((type) => (
              <span key={type} className="bg-light-shiny-blue text-Shiny-Blue px-0 py-0.5 rounded-full text-[16px] font-semibold">
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-400 font-medium">Title</p>
          <p className="text-[15px] font-bold text-gray-900">{announcement.title}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-400 font-medium">Description</p>
          <p className="text-[15px] text-gray-900 leading-relaxed font-medium">
            {announcement.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">Date</p>
            <p className="text-[15px] font-bold text-gray-900">
              {announcement.date ? new Date(announcement.date).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">Time</p>
            <p className="text-[15px] font-bold text-gray-900">{announcement.time || "N/A"}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
