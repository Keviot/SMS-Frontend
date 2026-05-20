import { useState, useEffect } from "react";
import {
    Users,
    Eye,
    Plus,
    BarChart3,
    CheckCircle2,
    Clock,
    ChevronDown,
    Loader2,
    Trash2,
    Type,
    Binary,
    ArrowUpCircle,
    Star,
    MoreHorizontal,
    XCircle,
    Calendar,
    ChevronUp,
} from "lucide-react";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import FormInput from "../../../ui/FormInput";
import Avatar from "../../../components/Avatar";
import { pollApi, authApi } from "../../../services/api";

interface Option {
    _id: string;
    text: string;
    votes: number;
}

interface Poll {
    _id: string;
    question: string;
    description?: string;
    pollType: string;
    options: Option[];
    society: string;
    createdAt: string;
    allowMultipleAnswers: boolean;
    ratingScale: number;
    minValue?: number;
    maxValue?: number;
    unit?: string;
    dueDate?: string;
    status: string;
    createdBy?: {
        _id: string;
        name: string;
        firstname: string;
        lastname: string;
        profileImage: string;
    };
    voters?: { user: string; votedAt: string }[];
}

export default function Polls() {
    const [activeTab, setActiveTab] = useState("New Poll");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
    const [pollResults, setPollResults] = useState<any>(null);

    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Create Poll State
    const [pollType, setPollType] = useState<string | null>(null);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [pollForm, setPollForm] = useState({
        question: "",
        description: "",
        options: ["", ""],
        minValue: "",
        maxValue: "",
        unit: "",
        ratingScale: "5",
        decimalPlaces: "",
        answer: "",
        dueDate: "",
        allowMultipleAnswers: false
    });

    // Vote State
    const [voteData, setVoteData] = useState<any>({
        optionIds: [],
        rating: 0,
        numericValue: "",
        text: "",
        ranking: []
    });

    const tabs = ["Own Poll", "New Poll", "Previous Poll"];

    const pollTypes = [
        { label: "Multichoice", icon: Users },
        { label: "Ranking", icon: BarChart3 },
        { label: "Rating", icon: Star },
        { label: "Numeric", icon: Binary },
        { label: "Text", icon: Type }
    ];

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const profile = await authApi.getProfile();
            if (profile.user) {
                setCurrentUser(profile.user);
                let societyId = profile.user.society?._id || profile.user.society;
                if (!societyId && profile.user.societies && profile.user.societies.length > 0) {
                    societyId = profile.user.societies[0]._id || profile.user.societies[0];
                }

                if (societyId) {
                    const response = await pollApi.getAll(societyId);
                    setPolls(response.polls || []);
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch polls");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const filteredPolls = polls.filter(poll => {
        if (!currentUser) return false;
        const hasVoted = poll.voters?.some(v => String(v.user) === String(currentUser._id));
        const isOwner = String(poll.createdBy?._id) === String(currentUser._id);
        const isAdmin = currentUser.role?.toLowerCase() === "admin";

        if (activeTab === "Manage Polls") return isAdmin;
        if (activeTab === "Own Poll") return isOwner;
        if (activeTab === "New Poll") return poll.status === "Active" && !hasVoted;
        if (activeTab === "Previous Poll") return poll.status === "Closed" || (poll.status === "Active" && hasVoted);
        return true;
    });

    const getTabs = () => {
        const baseTabs = ["New Poll", "Previous Poll"];
        if (currentUser?.role?.toLowerCase() === "admin") {
            return ["Manage Polls", "Own Poll", ...baseTabs];
        }
        return ["Own Poll", ...baseTabs];
    };

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();

        // Robust society ID extraction matching Dashboard logic
        let societyId = currentUser?.society?._id || currentUser?.society;
        if (!societyId && currentUser?.societies && currentUser?.societies.length > 0) {
            societyId = currentUser?.societies[0]._id || currentUser?.societies[0];
        }

        if (!pollType || !pollForm.question.trim()) {
            toast.error("Please fill required fields");
            return;
        }

        if (!societyId) {
            toast.error("Society context missing. Please refresh and try again.");
            return;
        }

        const data: any = {
            pollType,
            question: pollForm.question.trim(),
            description: pollForm.description.trim(),
            allowMultipleAnswers: pollForm.allowMultipleAnswers,
            dueDate: pollForm.dueDate || undefined,
            society: societyId
        };

        if (pollType === "Multichoice" || pollType === "Ranking") {
            const validOptions = pollForm.options.filter(o => o.trim() !== "");
            if (validOptions.length < 2) {
                toast.error("At least 2 options required");
                return;
            }
            data.options = validOptions.map(text => ({ text }));
        } else if (pollType === "Rating") {
            data.ratingScale = parseInt(pollForm.ratingScale) || 5;
        } else if (pollType === "Numeric") {
            data.minValue = pollForm.minValue !== "" ? Number(pollForm.minValue) : undefined;
            data.maxValue = pollForm.maxValue !== "" ? Number(pollForm.maxValue) : undefined;
            data.unit = pollForm.unit;
        }

        try {
            await pollApi.create(data);
            toast.success("Poll created successfully");
            setIsCreateModalOpen(false);
            setPollForm({ question: "", description: "", options: ["", ""], minValue: "", maxValue: "", unit: "", ratingScale: "5", decimalPlaces: "", answer: "", dueDate: "", allowMultipleAnswers: false });
            fetchPolls();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleVoteSubmit = async () => {
        if (!selectedPoll) return;

        const data: any = { pollId: selectedPoll._id };

        if (selectedPoll.pollType === "Multichoice") {
            if (voteData.optionIds.length === 0) return toast.error("Select an option");
            data.optionIds = voteData.optionIds;
        } else if (selectedPoll.pollType === "Rating") {
            if (voteData.rating === 0) return toast.error("Give a rating");
            data.rating = voteData.rating;
        } else if (selectedPoll.pollType === "Numeric") {
            if (voteData.numericValue === "") return toast.error("Enter a number");
            const val = Number(voteData.numericValue);
            if (selectedPoll.minValue !== undefined && val < selectedPoll.minValue) return toast.error(`Min value is ${selectedPoll.minValue}`);
            if (selectedPoll.maxValue !== undefined && val > selectedPoll.maxValue) return toast.error(`Max value is ${selectedPoll.maxValue}`);
            data.numericValue = val;
        } else if (selectedPoll.pollType === "Text") {
            if (!voteData.text.trim()) return toast.error("Write your response");
            data.text = voteData.text;
        } else if (selectedPoll.pollType === "Ranking") {
            if (voteData.ranking.length !== selectedPoll.options.length) return toast.error("Rank all options");
            data.ranking = voteData.ranking;
        }

        try {
            await pollApi.answer(data);
            toast.success("Vote submitted!");
            setIsVoteModalOpen(false);
            fetchPolls();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const viewResults = async (poll: Poll) => {
        setSelectedPoll(poll);
        try {
            const res = await pollApi.getResults(poll._id);
            setPollResults(res.result);
            setIsResultsModalOpen(true);
        } catch (error: any) {
            toast.error("Failed to load results");
        }
    };

    const closePoll = async (id: string) => {
        try {
            await pollApi.updateStatus(id, "Closed");
            toast.success("Poll closed");
            fetchPolls();
        } catch (error: any) {
            toast.error("Failed to close poll");
        }
    };

    return (
        <div className="flex flex-col gap-0">
            {/* Mobile Create Poll Button */}
            <div className="sm:hidden mb-4 flex justify-end">
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-11 flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Create Polls
                </Button>
            </div>

            <div className="relative z-10 flex w-full items-end">
                <div className="flex items-end w-full sm:w-auto overflow-x-auto custom-scrollbar">
                    {getTabs().map((tab, index) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "relative flex-1 sm:flex-none min-h-12 px-3 sm:px-8 py-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center text-center leading-tight shrink-0",
                                index > 0 && "-ml-[1px]", // overlap borders
                                activeTab === tab
                                    ? "z-10 rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white border-0"
                                    : "z-0 rounded-t-xl border border-[#D9DCE5] border-b-0 bg-[#F6F8FB] text-[#6F7786] hover:bg-gray-50 hover:text-[#202224]"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className={cn(
                "-mt-px rounded-2xl rounded-tl-none border border-[#D9DCE5] bg-white p-4 sm:p-8 shadow-sm min-h-[500px]"
            )}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-[#202224] hidden sm:block">Polls</h2>
                    
                    {/* Desktop Create Poll Button */}
                    <div className="hidden sm:block">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-11 px-6 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create Polls
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                    </div>
                ) : filteredPolls.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-400">
                        <BarChart3 size={48} className="opacity-20" />
                        <p className="font-medium text-sm">No polls found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-100">
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider">Question</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider">Poll Type</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider text-center">Votes</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider">Expiry Date</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#202224] uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPolls.map((poll) => {
                                    const hasVoted = poll.voters?.some(v => String(v.user) === String(currentUser?._id));
                                    const isOwner = String(poll.createdBy?._id) === String(currentUser?._id);
                                    const totalVotes = poll.options.reduce((s, o) => s + (o.votes || 0), 0);

                                    return (
                                        <tr key={poll._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-[#202224] line-clamp-1 max-w-[300px]" title={poll.question}>
                                                    {poll.question}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-lg bg-blue-50 text-[#5678E9] flex items-center justify-center">
                                                        {poll.pollType === "Multichoice" && <Users size={14} />}
                                                        {poll.pollType === "Ranking" && <BarChart3 size={14} />}
                                                        {poll.pollType === "Rating" && <Star size={14} />}
                                                        {poll.pollType === "Numeric" && <Binary size={14} />}
                                                        {poll.pollType === "Text" && <Type size={14} />}
                                                    </div>
                                                    <span className="text-xs font-bold text-[#4D4D4D]">{poll.pollType}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-[#4D4D4D]">{poll.createdBy?.firstname}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "text-xs font-black",
                                                    totalVotes > 0 ? "text-[#FF6B35]" : "text-gray-300"
                                                )}>
                                                    {totalVotes}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4D4D4D]">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    {poll.dueDate ? new Date(poll.dueDate).toLocaleDateString() : "No Expiry"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    poll.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {poll.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {poll.status === "Active" && !hasVoted && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPoll(poll);
                                                                setVoteData({ optionIds: [], rating: 0, numericValue: "", text: "", ranking: poll.options.map(o => o._id) });
                                                                setIsVoteModalOpen(true);
                                                            }}
                                                            className="h-8 px-4 rounded-lg bg-[#FF6B35] text-white text-[11px] font-bold hover:bg-[#E85D2A] transition-all shadow-sm active:scale-95"
                                                        >
                                                            Vote
                                                        </button>
                                                    )}
                                                    {(isOwner || hasVoted || poll.status === "Closed" || currentUser?.role?.toLowerCase() === "admin") && (
                                                        <button
                                                            onClick={() => viewResults(poll)}
                                                            className="h-8 w-8 rounded-lg bg-blue-50 text-[#5678E9] flex items-center justify-center hover:bg-[#5678E9] hover:text-white transition-all shadow-sm"
                                                            title="View Results"
                                                        >
                                                            <BarChart3 size={16} />
                                                        </button>
                                                    )}
                                                    {(isOwner || currentUser?.role?.toLowerCase() === "admin") && poll.status === "Active" && (
                                                        <button
                                                            onClick={() => closePoll(poll._id)}
                                                            className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                            title="Close Poll"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Poll Modal */}
            <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Polls" overflowVisible>
                <div className="pt-2 border-t border-gray-100 mt-2">
                    <form onSubmit={handleCreatePoll} className="space-y-6 pt-4">
                        {/* Poll Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#202224]">Polls<span className="text-[#E74C3C]">*</span></label>
                            <div className="relative">
                                <div
                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    className="flex items-center justify-between border-2 border-black rounded-xl h-14 px-4 cursor-pointer bg-white transition-all hover:border-gray-700"
                                >
                                    <div className="flex items-center gap-3">
                                        {pollType === "Multichoice" && <Users size={18} className="text-[#202224]" />}
                                        {pollType === "Ranking" && <BarChart3 size={18} className="text-[#202224]" />}
                                        {pollType === "Rating" && <Star size={18} className="text-[#202224]" />}
                                        {pollType === "Numeric" && <Binary size={18} className="text-[#202224]" />}
                                        {pollType === "Text" && <Type size={18} className="text-[#202224]" />}
                                        {!pollType && <BarChart3 size={18} className="text-gray-400" />}
                                        <span className={cn("text-sm font-medium", !pollType ? "text-gray-400" : "text-[#202224]")}>
                                            {pollType ? `${pollType} polls` : "Select Polls"}
                                        </span>
                                    </div>
                                    <ChevronDown size={20} className={cn("transition-transform duration-200", isTypeDropdownOpen && "rotate-180")} />
                                </div>
                                {isTypeDropdownOpen && (
                                    <div className="absolute top-[60px] left-0 w-full bg-white border-2 border-black rounded-xl shadow-xl z-[150] p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        {pollTypes.map(t => (
                                            <div
                                                key={t.label}
                                                onClick={() => { setPollType(t.label); setIsTypeDropdownOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer text-sm font-medium"
                                            >
                                                <t.icon size={18} />
                                                {t.label} polls
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Fields based on Poll Type */}
                        {pollType && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

                                {pollType !== "Text" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#202224]">Question<span className="text-[#E74C3C]">*</span></label>
                                        <input
                                            value={pollForm.question}
                                            onChange={e => setPollForm(p => ({ ...p, question: e.target.value }))}
                                            placeholder="Ask a question"
                                            className="w-full border border-gray-300 rounded-xl h-12 px-4 text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none transition-all"
                                        />
                                    </div>
                                )}

                                {/* Multichoice Poll Layout */}
                                {pollType === "Multichoice" && (
                                    <div className="space-y-4">
                                        {pollForm.options.map((opt, i) => (
                                            <div key={i} className="space-y-2">
                                                <label className="text-sm font-bold text-[#202224]">Option {i + 1}<span className="text-[#E74C3C]">*</span></label>
                                                <div className="flex gap-3 items-center">
                                                    <input
                                                        value={opt}
                                                        onChange={e => {
                                                            const n = [...pollForm.options]; n[i] = e.target.value; setPollForm(p => ({ ...p, options: n }));
                                                        }}
                                                        className="flex-1 border border-gray-300 rounded-xl h-12 px-4 text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none transition-all"
                                                        placeholder="Ask a question"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const n = pollForm.options.filter((_, idx) => idx !== i); setPollForm(p => ({ ...p, options: n }));
                                                        }}
                                                        className="h-10 w-10 flex items-center justify-center bg-[#FFF1F1] rounded-xl group hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 size={18} className="text-[#E74C3C]" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setPollForm(p => ({ ...p, options: [...p.options, ""] }))}
                                            className="flex items-center gap-3 text-[#FF6B35] font-bold text-sm transition-transform active:scale-95"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center border-2 border-[#FF6B35]">
                                                <Plus size={16} strokeWidth={3} />
                                            </div>
                                            Add an option
                                        </button>
                                    </div>
                                )}

                                {/* Ranking Poll Layout */}
                                {pollType === "Ranking" && (
                                    <div className="space-y-4">
                                        {pollForm.options.map((opt, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
                                                    {i + 1}
                                                </div>
                                                <input
                                                    value={opt}
                                                    onChange={e => {
                                                        const n = [...pollForm.options]; n[i] = e.target.value; setPollForm(p => ({ ...p, options: n }));
                                                    }}
                                                    className="flex-1 border-b border-gray-100 h-10 px-1 text-sm outline-none focus:border-[#FF6B35] transition-all"
                                                    placeholder={`Ranking ${i + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const n = pollForm.options.filter((_, idx) => idx !== i); setPollForm(p => ({ ...p, options: n }));
                                                    }}
                                                    className="h-10 w-10 flex items-center justify-center bg-[#FFF1F1] rounded-xl group hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 size={18} className="text-[#E74C3C]" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setPollForm(p => ({ ...p, options: [...p.options, ""] }))}
                                            className="flex items-center gap-3 text-[#FF6B35] font-bold text-sm mt-2"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center border-2 border-[#FF6B35]">
                                                <Plus size={16} strokeWidth={3} />
                                            </div>
                                            Add an option
                                        </button>
                                    </div>
                                )}

                                {/* Rating Poll Layout */}
                                {pollType === "Rating" && (
                                    <div className="space-y-4">
                                        {pollForm.options.map((opt, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="w-6 h-6 rounded-full border border-gray-300" />
                                                <input
                                                    value={opt}
                                                    onChange={e => {
                                                        const n = [...pollForm.options]; n[i] = e.target.value; setPollForm(p => ({ ...p, options: n }));
                                                    }}
                                                    className="flex-1 border-b border-gray-100 h-10 px-1 text-sm outline-none focus:border-[#FF6B35] transition-all"
                                                    placeholder={`Rating ${i + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const n = pollForm.options.filter((_, idx) => idx !== i); setPollForm(p => ({ ...p, options: n }));
                                                    }}
                                                    className="h-10 w-10 flex items-center justify-center bg-[#FFF1F1] rounded-xl group hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 size={18} className="text-[#E74C3C]" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setPollForm(p => ({ ...p, options: [...p.options, ""] }))}
                                            className="flex items-center gap-3 text-[#FF6B35] font-bold text-sm mt-2"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center border-2 border-[#FF6B35]">
                                                <Plus size={16} strokeWidth={3} />
                                            </div>
                                            Add an option
                                        </button>
                                    </div>
                                )}

                                {/* Numeric Poll Layout */}
                                {pollType === "Numeric" && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#202224]">Min Values<span className="text-[#E74C3C]">*</span></label>
                                                <input
                                                    type="number"
                                                    value={pollForm.minValue}
                                                    onChange={e => setPollForm(p => ({ ...p, minValue: e.target.value }))}
                                                    placeholder="Enter Min Values"
                                                    className="w-full border border-gray-300 rounded-xl h-12 px-4 text-sm focus:border-[#FF6B35] outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#202224]">Max Values<span className="text-[#E74C3C]">*</span></label>
                                                <input
                                                    type="number"
                                                    value={pollForm.maxValue}
                                                    onChange={e => setPollForm(p => ({ ...p, maxValue: e.target.value }))}
                                                    placeholder="Enter Max Values"
                                                    className="w-full border border-gray-300 rounded-xl h-12 px-4 text-sm focus:border-[#FF6B35] outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#202224]">Decimal Places<span className="text-[#E74C3C]">*</span></label>
                                            <div className="relative">
                                                <select
                                                    value={pollForm.decimalPlaces}
                                                    onChange={e => setPollForm(p => ({ ...p, decimalPlaces: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-xl h-12 px-4 text-sm focus:border-[#FF6B35] outline-none appearance-none bg-white"
                                                >
                                                    <option value="" disabled>Select Decimal Places</option>
                                                    <option value="0">0</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Text Poll Layout */}
                                {pollType === "Text" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#202224]">Answer<span className="text-[#E74C3C]">*</span></label>
                                        <textarea
                                            value={pollForm.answer}
                                            onChange={e => setPollForm(p => ({ ...p, answer: e.target.value }))}
                                            placeholder="Enter Answer"
                                            className="w-full border border-gray-300 rounded-xl min-h-[120px] p-4 text-sm focus:border-[#FF6B35] outline-none resize-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Expiry Date for all types (from your existing schema, though screenshots don't show it as clearly, I'll keep it subtle or hidden if needed, but I'll add it back based on your earlier request) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#202224]">Expiry Date</label>
                            <input
                                type="date"
                                value={pollForm.dueDate}
                                onChange={e => setPollForm(p => ({ ...p, dueDate: e.target.value }))}
                                className="w-full border border-gray-300 rounded-xl h-12 px-4 text-sm focus:border-[#FF6B35] outline-none"
                            />
                        </div>

                        {/* Modal Footer Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 border border-gray-300 rounded-xl h-14 text-sm font-bold text-[#202224] hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!pollType || (pollType === "Text" ? !pollForm.answer : !pollForm.question)}
                                className={cn(
                                    "flex-1 rounded-xl h-14 text-sm font-bold transition-all shadow-md",
                                    !pollType || (pollType === "Text" ? !pollForm.answer : !pollForm.question)
                                        ? "bg-[#F1F4FF] text-[#202224] opacity-50 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white hover:shadow-lg active:scale-[0.98]"
                                )}
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Vote Modal */}
            <Modal open={isVoteModalOpen} onClose={() => setIsVoteModalOpen(false)} title="Cast Your Vote">
                {selectedPoll && (
                    <div className="space-y-6">
                        <h3 className="font-bold text-[#202224]">{selectedPoll.question}</h3>
                        <p className="text-sm text-gray-500">{selectedPoll.description}</p>

                        {selectedPoll.pollType === "Multichoice" && (
                            <div className="space-y-3">
                                {selectedPoll.options.map(opt => (
                                    <div
                                        key={opt._id}
                                        onClick={() => {
                                            const current = voteData.optionIds;
                                            if (selectedPoll.allowMultipleAnswers) {
                                                setVoteData((p: any) => ({ ...p, optionIds: current.includes(opt._id) ? current.filter((id: any) => id !== opt._id) : [...current, opt._id] }));
                                            } else {
                                                setVoteData((p: any) => ({ ...p, optionIds: [opt._id] }));
                                            }
                                        }}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between",
                                            voteData.optionIds.includes(opt._id) ? "border-[#FF6B35] bg-orange-50" : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <span className="text-sm font-bold">{opt.text}</span>
                                        {voteData.optionIds.includes(opt._id) && <CheckCircle2 size={18} className="text-[#FF6B35]" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedPoll.pollType === "Rating" && (
                            <div className="flex justify-center gap-2">
                                {[...Array(selectedPoll.ratingScale)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={32}
                                        onClick={() => setVoteData((p: any) => ({ ...p, rating: i + 1 }))}
                                        className={cn("cursor-pointer transition-colors", i < voteData.rating ? "fill-[#FF6B35] text-[#FF6B35]" : "text-gray-200")}
                                    />
                                ))}
                            </div>
                        )}

                        {selectedPoll.pollType === "Numeric" && (
                            <FormInput
                                label="Numeric Value"
                                type="number"
                                placeholder={`Enter value ${selectedPoll.unit ? `in ${selectedPoll.unit}` : ''}`}
                                value={voteData.numericValue}
                                onChange={v => setVoteData((p: any) => ({ ...p, numericValue: v }))}
                            />
                        )}

                        {selectedPoll.pollType === "Text" && (
                            <textarea
                                className="w-full border rounded-xl p-4 text-sm min-h-[120px] outline-none focus:border-[#FF6B35]"
                                placeholder="Write your response here..."
                                value={voteData.text}
                                onChange={e => setVoteData((p: any) => ({ ...p, text: e.target.value }))}
                            />
                        )}

                        {selectedPoll.pollType === "Ranking" && (
                            <div className="space-y-2">
                                {voteData.ranking.map((optId: string, idx: number) => {
                                    const opt = selectedPoll.options.find(o => o._id === optId);
                                    return (
                                        <div key={optId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="h-6 w-6 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-bold flex-1">{opt?.text}</span>
                                            <div className="flex flex-col gap-1">
                                                {idx > 0 && <button onClick={() => {
                                                    const n = [...voteData.ranking];[n[idx], n[idx - 1]] = [n[idx - 1], n[idx]]; setVoteData((p: any) => ({ ...p, ranking: n }));
                                                }}><ChevronUp size={16} /></button>}
                                                {idx < voteData.ranking.length - 1 && <button onClick={() => {
                                                    const n = [...voteData.ranking];[n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; setVoteData((p: any) => ({ ...p, ranking: n }));
                                                }}><ChevronDown size={16} /></button>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Button onClick={handleVoteSubmit} className="w-full h-11 bg-[#FF6B35] text-white font-bold rounded-xl mt-4">Submit Vote</Button>
                    </div>
                )}
            </Modal>

            {/* Results Modal */}
            <Modal open={isResultsModalOpen} onClose={() => setIsResultsModalOpen(false)} title="Poll Results" className="max-w-2xl">
                {selectedPoll && pollResults ? (
                    <div className="space-y-6">
                        {/* Poll Summary Header */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                    selectedPoll.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {selectedPoll.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Responses</p>
                                <h4 className="text-lg font-bold text-[#202224]">{pollResults.totalResponses}</h4>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Poll Type</p>
                                <h4 className="text-xs font-bold text-[#5678E9]">{selectedPoll.pollType}</h4>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Created At</p>
                                <h4 className="text-[11px] font-bold text-[#202224]">{new Date(selectedPoll.createdAt).toLocaleDateString()}</h4>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-[#202224] leading-tight">{selectedPoll.question}</h3>
                            {selectedPoll.description && <p className="text-sm text-gray-500">{selectedPoll.description}</p>}
                        </div>

                        {/* Result Content Based on Type */}
                        <div className="py-2">
                            {selectedPoll.pollType === "Multichoice" && (
                                <div className="space-y-5">
                                    {pollResults.options.map((opt: any) => (
                                        <div key={opt._id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-[#202224]">{opt.text}</span>
                                                <span className="text-[#FF6B35]">{opt.votes} votes ({opt.percentage}%)</span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#FE512E] to-[#F09633] rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${opt.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedPoll.pollType === "Rating" && (
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-[#FF6B35]">{pollResults.averageRating}</span>
                                            <span className="text-lg font-bold text-orange-300">/ {selectedPoll.ratingScale}</span>
                                        </div>
                                        <div className="flex gap-1.5 my-3">
                                            {[...Array(selectedPoll.ratingScale)].map((_, i) => (
                                                <Star key={i} size={24} className={cn(i < Math.round(pollResults.averageRating) ? "fill-[#FF6B35] text-[#FF6B35]" : "text-gray-200")} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Average Rating</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating Distribution</h4>
                                        {pollResults.ratingDistribution?.map((dist: any) => (
                                            <div key={dist.rating} className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 w-12 shrink-0">
                                                    <span className="text-sm font-bold text-[#202224]">{dist.rating}</span>
                                                    <Star size={14} className="fill-[#A7A7A7] text-[#A7A7A7]" />
                                                </div>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#FF6B35] rounded-full transition-all"
                                                        style={{ width: `${dist.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 w-16 text-right">
                                                    {dist.count} votes
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPoll.pollType === "Numeric" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Average</p>
                                            <h5 className="text-xl font-bold text-[#FF6B35]">{pollResults.average} <span className="text-[10px]">{selectedPoll.unit}</span></h5>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Min</p>
                                            <h5 className="text-xl font-bold text-[#202224]">{pollResults.min}</h5>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Max</p>
                                            <h5 className="text-xl font-bold text-[#202224]">{pollResults.max}</h5>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted Values</h4>
                                        <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                                            {pollResults.values?.map((v: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl text-sm">
                                                    <span className="font-bold text-[#202224]">{v.userName}</span>
                                                    <span className="font-black text-[#5678E9]">{v.value} {selectedPoll.unit}</span>
                                                </div>
                                            ))}
                                            {(!pollResults.values || pollResults.values.length === 0) && (
                                                <p className="text-center text-sm text-gray-400 py-4 italic">No numeric values submitted yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedPoll.pollType === "Text" && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Responses ({pollResults.responses?.length})</h4>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {pollResults.responses?.map((r: any, i: number) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                                <p className="text-sm text-[#202224] font-medium leading-relaxed italic">"{r.text}"</p>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar src={r.userAvatar} name={r.userName} size="xs" />
                                                        <span className="text-[11px] font-bold text-[#5678E9]">{r.userName}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {new Date(r.votedAt).toLocaleDateString()} at {new Date(r.votedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!pollResults.responses || pollResults.responses.length === 0) && (
                                            <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-2xl">
                                                No responses submitted yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedPoll.pollType === "Ranking" && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ranking Results (Leaderboard)</h4>
                                    <div className="space-y-3">
                                        {pollResults.rankedResults?.map((r: any, i: number) => (
                                            <div key={r._id} className="relative flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl overflow-hidden group">
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2",
                                                    i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-300" : i === 2 ? "bg-orange-400" : "bg-blue-100"
                                                )} />
                                                <div className={cn(
                                                    "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg",
                                                    i === 0 ? "bg-yellow-50 text-yellow-600" :
                                                        i === 1 ? "bg-gray-50 text-gray-600" :
                                                            i === 2 ? "bg-orange-50 text-orange-600" :
                                                                "bg-gray-50 text-gray-400"
                                                )}>
                                                    #{i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold text-[#202224] mb-1">{r.text}</h5>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.percentage}%` }} />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-[#5678E9] shrink-0">{r.score} pts</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={() => setIsResultsModalOpen(false)}
                            className="w-full h-12 bg-[#202224] hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-95"
                        >
                            Close Results
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                        <p className="text-sm font-bold text-gray-400">Loading poll analytics...</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
