import { useState, useEffect } from "react";
import { MoreVertical, Plus, Loader2 } from "lucide-react";
import Button from "../../../ui/Button";
import NoteFormModal, { type NoteFormData } from "../components/NoteFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { financialApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";

type NoteItem = {
    id: string;
    title: string;
    description: string;
    date: string;
};

export default function Note() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);

    // Fetch notes on component mount
    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await financialApi.getNotes();

            // Transform backend data to frontend format
            const transformedNotes = response.data.map((item: any) => ({
                id: item._id,
                title: item.title,
                description: item.description,
                date: item.date ? new Date(item.date).toLocaleDateString("en-GB") : "",
            }));

            setNotes(transformedNotes);
        } catch (error: any) {
            console.error("Error fetching notes:", error);
            toast.error(error.message || "Failed to fetch notes");
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = () => {
        setSelectedNote(null);
        setShowNoteModal(true);
    };

    const handleEditNote = (note: NoteItem) => {
        setSelectedNote(note);
        setShowNoteModal(true);
        setOpenMenuId(null);
    };

    const handleDeleteNote = (note: NoteItem) => {
        setNoteToDelete(note);
        setShowDeleteModal(true);
        setOpenMenuId(null);
    };

    const handleNoteSubmit = async (data: NoteFormData) => {
        try {
            // Get user profile to get society ID
            const profileResponse = await authApi.getProfile();
            const user = profileResponse.user;

            // Extract society ID
            const societyId = user?.society?._id || user?.society || (user?.societies?.[0]?._id);

            if (!societyId) {
                toast.error("Society ID not found in profile. Please ensure your account is linked to a society.");
                return;
            }

            const payload = {
                title: data.title,
                description: data.description,
                date: new Date(data.date).toISOString(),
                society: societyId,
            };

            if (selectedNote) {
                // Edit existing note
                await financialApi.editNote(selectedNote.id, payload);
                toast.success("Note updated successfully!");
            } else {
                // Add new note
                await financialApi.addNote(payload);
                toast.success("Note created successfully!");
            }

            setShowNoteModal(false);
            setSelectedNote(null);

            // Refresh notes list
            await fetchNotes();
        } catch (error: any) {
            console.error("Error saving note:", error);
            toast.error(error.message || "Failed to save note");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!noteToDelete) return;

            await financialApi.deleteNote(noteToDelete.id);
            toast.success("Note deleted successfully!");

            setShowDeleteModal(false);
            setNoteToDelete(null);

            // Refresh notes list
            await fetchNotes();
        } catch (error: any) {
            console.error("Error deleting note:", error);
            toast.error(error.message || "Failed to delete note");
        }
    };

    return (
        <>
            <div className="rounded-2xl bg-white p-4 sm:p-5">
                {/* Header */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-7 text-[#202224]">Note</h2>

                    <Button
                        type="button"
                        onClick={handleCreateNote}
                        className="h-12 w-full rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] px-4 text-sm font-semibold text-white shadow-none sm:w-auto"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Plus size={18} strokeWidth={2.5} />
                            Create Note
                        </span>
                    </Button>
                </div>

                {/* Notes Grid */}
                <div className="max-h-[calc(100vh-18.75rem)] overflow-y-auto pr-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            <span className="ml-3 text-gray-600">Loading notes...</span>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-gray-500">No notes found</p>
                            <Button onClick={handleCreateNote} className="mt-4 h-12 rounded-xl px-6">
                                <Plus size={18} className="mr-2" />
                                Create First Note
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="overflow-visible rounded-[10px] border border-[#D9DCE5] bg-white"
                                >
                                    {/* Card Header */}
                                    <div className="relative flex min-h-12 items-center justify-between rounded-t-[10px] bg-[#5678E9] px-4 py-3">
                                        <h3 className="line-clamp-1 text-sm font-semibold text-white">
                                            {note.title}
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenMenuId((prev) =>
                                                    prev === note.id ? null : note.id
                                                )
                                            }
                                            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/90 text-[#5678E9] transition hover:bg-white"
                                            aria-label="Open note menu"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {openMenuId === note.id && (
                                            <div className="absolute right-4 top-10 z-20 w-24 overflow-hidden rounded-md bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditNote(note)}
                                                    className="block w-full px-4 py-2 text-left text-xs font-medium text-[#202224] hover:bg-[#F6F8FB]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteNote(note)}
                                                    className="block w-full px-4 py-2 text-left text-xs font-medium text-[#E74C3C] hover:bg-[#FFF1F1]"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                        <p className="mb-1 text-sm font-medium text-[#6F7786]">
                                            Description
                                        </p>

                                        <p className="line-clamp-2 text-sm font-medium leading-5 text-[#202224]">
                                            {note.description}
                                        </p>

                                        {note.date && (
                                            <p className="mt-2 text-xs font-medium text-[#A7A7A7]">
                                                {note.date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <NoteFormModal
                open={showNoteModal}
                onClose={() => {
                    setShowNoteModal(false);
                    setSelectedNote(null);
                }}
                onSubmit={handleNoteSubmit}
                isEdit={Boolean(selectedNote)}
                initialData={
                    selectedNote
                        ? {
                            title: selectedNote.title,
                            description: selectedNote.description,
                            date: selectedNote.date,
                        }
                        : null
                }
            />

            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setNoteToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Note?"
                message="Are you sure you want to delete this note?"
            />
        </>
    );
}
