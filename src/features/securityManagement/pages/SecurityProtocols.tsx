import { useState, useEffect } from "react";
import {
  EditIcon,
  EyeIcon,
  TrashIcon,
  AddSquareIcon,
} from "../../../assets/icons/admin-dashboard-icons";
import DeleteSecurityProtocolModal from "../components/DeleteSecurityProtocolModal";
import ViewSecurityProtocolModal from "../components/ViewSecurityProtocolModal";
import SecurityProtocolFormModal from "../components/SecurityProtocolFormModal";
import { securityApi, authApi, societyApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";


type SecurityProtocol = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
};

function ActionButton({
  label,
  children,
  bgClassName,
  textClassName,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  bgClassName: string;
  textClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] transition hover:scale-105 ${bgClassName} ${textClassName}`}
    >
      <span className="inline-flex size-4 items-center justify-center">
        {children}
      </span>
    </button>
  );
}

function TimeBadge({ time }: { time: string }) {
  return (
    <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-[#F6F8FB] px-3 py-1.5 text-sm font-medium leading-5 text-[#202224]">
      {time}
    </span>
  );
}

export default function SecurityProtocols() {
  const [protocols, setProtocols] = useState<SecurityProtocol[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] =
    useState<SecurityProtocol | null>(null);

  // Fetch protocols on component mount
  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      setLoading(true);

      // Fetch protocols - backend uses req.user.society from auth token
      const response = await securityApi.getAllSecurityProtocols();

      // Backend returns { securityProtocol: [...] }
      const protocolsData = response.securityProtocol || [];

      if (!protocolsData || protocolsData.length === 0) {
        setProtocols([]);
        setLoading(false);
        return;
      }

      // Transform backend data to frontend format
      const transformedProtocols = protocolsData.map((item: any) => ({
        id: item._id,
        title: item.title,
        description: item.description,
        date: item.date ? new Date(item.date).toLocaleDateString("en-GB") : new Date(item.createdAt).toLocaleDateString("en-GB"),
        time: item.time || new Date(item.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      }));

      setProtocols(transformedProtocols);
    } catch (error: any) {
      console.error("Error fetching protocols:", error);
      toast.error(error.message || "Failed to fetch security protocols");
      setProtocols([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedProtocol(null);
    setShowProtocolModal(true);
  };

  const handleEditClick = (protocol: SecurityProtocol) => {
    setSelectedProtocol(protocol);
    setShowProtocolModal(true);
  };

  const handleViewClick = (protocol: SecurityProtocol) => {
    setSelectedProtocol(protocol);
    setShowViewModal(true);
  };

  const handleDeleteClick = (protocol: SecurityProtocol) => {
    setSelectedProtocol(protocol);
    setShowDeleteModal(true);
  };

  const handleCloseFormModal = () => {
    setShowProtocolModal(false);
    setSelectedProtocol(null);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedProtocol(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedProtocol(null);
  };

  const handleSubmitProtocol = async (data: {
    title: string;
    description: string;
    date?: string;
    time?: string;
  }) => {
    try {
      if (selectedProtocol) {
        // Edit existing protocol
        await securityApi.editSecurityProtocol(selectedProtocol.id, {
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
        });
        toast.success("Security protocol updated successfully!");
      } else {
        // Create new protocol - need society ID
        const profileResponse = await authApi.getProfile();
        const user = profileResponse.user;

        if (!user) {
          toast.error("Unable to fetch user profile. Please try again.");
          return;
        }

        // Get society ID
        let societyId = user.society;

        if (!societyId && user.societies && user.societies.length > 0) {
          societyId = user.societies[0]._id;
        }

        if (!societyId && user.selectSociety && user.selectSociety.length > 0) {
          const societies = await societyApi.getAll();
          const matchingSociety = societies.data.find(
            (s: any) => user.selectSociety.includes(s.societyName)
          );
          if (matchingSociety) {
            societyId = matchingSociety._id;
          }
        }

        if (!societyId) {
          toast.error("Society information not found. Please contact administrator.");
          return;
        }

        await securityApi.createSecurityProtocol({
          title: data.title,
          description: data.description,
          society: societyId,
        });
        toast.success("Security protocol created successfully!");
      }

      handleCloseFormModal();
      // Refresh protocols list
      await fetchProtocols();
    } catch (error: any) {
      toast.error(error.message || "Failed to save security protocol");
      console.error("Save protocol error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedProtocol) return;

      await securityApi.deleteSecurityProtocol(selectedProtocol.id);
      toast.success("Security protocol deleted successfully!");

      handleCloseDeleteModal();
      // Refresh protocols list
      await fetchProtocols();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete security protocol");
      console.error("Delete protocol error:", error);
    }
  };

  return (
    <>
      <div className="w-full">
        <section className="rounded-[15px] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold leading-6 text-[#202224]">
              Security Protocols
            </h1>

            <button
              type="button"
              onClick={handleCreateClick}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] px-5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)] transition hover:shadow-[0_12px_24px_rgba(255,107,53,0.28)] sm:self-auto"
            >
              <AddSquareIcon className="size-4 shrink-0 text-white" />
              Create Protocol
            </button>
          </div>

          <div className="overflow-hidden rounded-[10px] bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[1.1fr_2.2fr_1fr_1fr_0.8fr] items-center rounded-t-[10px] bg-[#F1F4FF] px-4 py-4 text-sm font-bold leading-5 text-[#202224]">
                  <div>Title</div>
                  <div>Description</div>
                  <div>Date</div>
                  <div>Time</div>
                  <div className="text-center">Action</div>
                </div>

                <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      <span className="ml-3 text-gray-600">Loading protocols...</span>
                    </div>
                  ) : protocols.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-gray-500">No security protocols found</p>
                      <button
                        onClick={handleCreateClick}
                        className="mt-4 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-6 text-sm font-bold text-white"
                      >
                        <AddSquareIcon className="size-4" />
                        Create First Protocol
                      </button>
                    </div>
                  ) : (
                    protocols.map((protocol) => (
                      <div
                        key={protocol.id}
                        className="grid grid-cols-[1.1fr_2.2fr_1fr_1fr_0.8fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0"
                      >
                        <div className="truncate pr-4">{protocol.title}</div>

                        <div className="truncate pr-6">
                          {protocol.description}
                        </div>

                        <div>{protocol.date}</div>

                        <div>
                          <TimeBadge time={protocol.time} />
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <ActionButton
                            label="Edit security protocol"
                            onClick={() => handleEditClick(protocol)}
                            bgClassName="bg-[#E8F7ED]"
                            textClassName="text-[#39973D]"
                          >
                            <EditIcon className="size-4" />
                          </ActionButton>

                          <ActionButton
                            label="View security protocol"
                            onClick={() => handleViewClick(protocol)}
                            bgClassName="bg-[#EEF3FF]"
                            textClassName="text-[#5678E9]"
                          >
                            <EyeIcon className="size-4" />
                          </ActionButton>

                          <ActionButton
                            label="Delete security protocol"
                            onClick={() => handleDeleteClick(protocol)}
                            bgClassName="bg-[#FFEDED]"
                            textClassName="text-[#E74C3C]"
                          >
                            <TrashIcon className="size-4" />
                          </ActionButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SecurityProtocolFormModal
        open={showProtocolModal}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmitProtocol}
        isEdit={Boolean(selectedProtocol)}
        initialData={
          selectedProtocol
            ? {
              title: selectedProtocol.title,
              description: selectedProtocol.description,
              date: selectedProtocol.date,
              time: selectedProtocol.time,
            }
            : null
        }
      />

      <ViewSecurityProtocolModal
        open={showViewModal}
        onClose={handleCloseViewModal}
        data={
          selectedProtocol
            ? {
              title: selectedProtocol.title,
              description: selectedProtocol.description,
              date: selectedProtocol.date,
              time: selectedProtocol.time,
            }
            : null
        }
      />

      <DeleteSecurityProtocolModal
        open={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
