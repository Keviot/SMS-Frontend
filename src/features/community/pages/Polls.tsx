import { useState, useEffect } from "react";
import {
    Users,
    Eye,
    Plus,
    BarChart3,
    CheckCircle2,
    Clock,
    ChevronDown,
    Loader2
} from "lucide-react";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import FormInput from "../../../ui/FormInput";
import { pollApi, authApi } from "../../../services/api";

interface Option {
    _id: string;
    text: string;
    votes: number;
}

interface Poll {
    _id: string;
    question: string;
    pollType: string;
    options: Option[];
    society: string;
    createdAt: string;
    views?: number;
    author?: string;
    avatar?: string;
}

export default function Polls() {
    const [activeTab, setActiveTab] = useState("Own Poll");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [pollType, setPollType] = useState("Multichoice polls");
    const [pollForm, setPollForm] = useState({
        question: "",
        option1: "",
        option2: "",
        option3: ""
    });

    const tabs = ["Own Poll", "New Poll", "Previous Poll"];

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const profile = await authApi.getProfile();
            const societyId = profile.user?.society || (profile.user?.societies?.[0]?._id);
            
            const response = await pollApi.getAll(societyId);
            // Assuming response is the array of polls
            setPolls(response || []);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch polls");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleFormChange = (field: string, value: string) => {
        setPollForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = [pollForm.option1, pollForm.option2, pollForm.option3]
            .filter(opt => opt.trim() !== "");

        if (!pollForm.question.trim() || options.length < 2) {
            toast.error("Please provide a question and at least 2 options");
            return;
        }

        try {
            const profile = await authApi.getProfile();
            const societyId = profile.user?.society || (profile.user?.societies?.[0]?._id);

            await pollApi.create({
                question: pollForm.question,
                pollType: pollType,
                options: options.map(text => ({ text })),
                society: societyId
            });

            toast.success("Poll created successfully");
            setPollForm({ question: "", option1: "", option2: "", option3: "" });
            setIsCreateModalOpen(false);
            fetchPolls();
        } catch (error: any) {
            toast.error(error.message || "Failed to create poll");
        }
    };

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            await pollApi.answer({
                pollId,
                optionIds: [optionId]
            });
            toast.success("Vote cast successfully");
            fetchPolls(); // Refresh to show updated counts
        } catch (error: any) {
            toast.error(error.message || "Failed to cast vote");
        }
    };

    const calculatePercentage = (votes: number, totalVotes: number) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    const getPollTypeIcon = (type: string) => {
        switch (type) {
            case "Multichoice polls": return <Users size={16} />;
            case "Ranking polls": return <BarChart3 size={16} />;
            case "Rating polls": return <CheckCircle2 size={16} />;
            case "Numeric polls": return <Clock size={16} />;
            default: return <Plus size={16} />;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex w-fit overflow-hidden rounded-xl bg-white shadow-sm border border-[#F4F4F4]">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "h-12 px-8 text-sm font-bold transition-all",
                            activeTab === tab
                                ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white"
                                : "text-[#202224] hover:bg-gray-50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Polls Content */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-[#F4F4F4] min-h-[400px]">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#202224]">Polls</h2>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-11"
                    >
                        Create Polls
                    </Button>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                    </div>
                ) : polls.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-gray-400">
                        No polls found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {polls.map((poll) => {
                            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                            return (
                                <div key={poll._id} className="group relative rounded-2xl border border-[#F4F4F4] p-5 transition-all hover:shadow-md hover:border-[#5678E9]/20">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={poll.avatar || `https://ui-avatars.com/api/?name=User&background=E5E7EB&color=202224`} alt="Author" className="h-8 w-8 rounded-full border border-[#F1F1F1]" />
                                            <div>
                                                <h3 className="text-xs font-bold text-[#202224] truncate max-w-[100px]">{poll.author || "Resident"}</h3>
                                                <p className="text-[10px] text-[#A7A7A7]">{poll.pollType}</p>
                                            </div>
                                        </div>
                                        <div className="flex h-6 items-center gap-1.5 rounded-full bg-[#F1F4FF] px-2.5 text-[#5678E9]">
                                            <Eye size={12} />
                                            <span className="text-[10px] font-bold">{poll.views || 0}</span>
                                        </div>
                                    </div>

                                    <p className="mb-2 text-xs font-bold leading-relaxed text-[#202224] line-clamp-2 min-h-[32px]">
                                        {poll.question}
                                    </p>

                                    <div className="mb-4 flex items-center gap-1.5">
                                        <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#FF6B35] p-0.5">
                                            <div className="h-full w-full rounded-full bg-[#FF6B35]" />
                                        </div>
                                        <span className="text-[10px] text-[#A7A7A7]">Select one</span>
                                    </div>

                                    <div className="space-y-3">
                                        {poll.options.map((option) => {
                                            const percentage = calculatePercentage(option.votes, totalVotes);
                                            return (
                                                <div key={option._id} className="space-y-1.5 cursor-pointer" onClick={() => handleVote(poll._id, option._id)}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-4 w-4 rounded-full border-2 border-[#D3D3D3]" />
                                                            <span className="text-xs font-medium text-[#202224]">{option.text}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[#A7A7A7]">
                                                            <Users size={12} />
                                                            <span className="text-[10px] font-bold">{option.votes}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F6F8FB]">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all duration-500 bg-[#5678E9]")}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <span className="text-[10px] font-medium text-[#A7A7A7]">{new Date(poll.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Poll Modal */}
            <Modal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Polls"
                className="max-w-md"
            >
                <form onSubmit={handleCreatePoll} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#202224]">Polls<span className="text-[#E74C3C]">*</span></label>
                        <div className="relative group">
                            <div className="flex items-center gap-2 rounded-xl border border-[#D3D3D3] px-3 py-2.5 bg-white cursor-pointer hover:border-[#5678E9]">
                                {getPollTypeIcon(pollType)}
                                <span className="flex-1 text-sm font-medium text-[#202224]">{pollType}</span>
                                <ChevronDown size={18} className="text-[#A7A7A7]" />
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute top-12 left-0 z-20 w-full rounded-xl border border-[#F4F4F4] bg-white p-1 shadow-lg hidden group-hover:block">
                                {[
                                    { label: "Multichoice polls", icon: Users },
                                    { label: "Ranking polls", icon: BarChart3 },
                                    { label: "Rating polls", icon: CheckCircle2 },
                                    { label: "Numeric polls", icon: Clock },
                                    { label: "Text polls", icon: Plus }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setPollType(item.label)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer",
                                            pollType === item.label ? "bg-[#F1F4FF] text-[#5678E9]" : "hover:bg-[#F6F8FB] text-[#202224]"
                                        )}
                                    >
                                        <item.icon size={16} />
                                        <span className="font-medium">{item.label}</span>
                                        {pollType === item.label && <div className="ml-auto h-4 w-4 rounded-full border-2 border-[#FF6B35] flex items-center justify-center p-0.5"><div className="h-full w-full rounded-full bg-[#FF6B35]" /></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <FormInput
                        label="Question"
                        required
                        value={pollForm.question}
                        onChange={(val) => handleFormChange("question", val)}
                        placeholder="Type your question here"
                        className="h-11 rounded-xl"
                    />

                    <div className="space-y-3">
                        <FormInput 
                            label="Option 1" 
                            required 
                            value={pollForm.option1}
                            onChange={(val) => handleFormChange("option1", val)}
                            placeholder="Option 1" 
                            className="h-11 rounded-xl" 
                        />
                        <FormInput 
                            label="Option 2" 
                            required 
                            value={pollForm.option2}
                            onChange={(val) => handleFormChange("option2", val)}
                            placeholder="Option 2" 
                            className="h-11 rounded-xl" 
                        />
                        <FormInput 
                            label="Option 3" 
                            required 
                            value={pollForm.option3}
                            onChange={(val) => handleFormChange("option3", val)}
                            placeholder="Option 3 (Optional)" 
                            className="h-11 rounded-xl" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="h-11 rounded-xl font-bold border-[#D3D3D3] text-[#202224]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 rounded-xl font-bold bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none"
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
