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
    Binary
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
    pollType: string;
    options: Option[];
    society: string;
    createdAt: string;
    views?: number;
    avatar?: string;
    createdBy?: {
        name: string;
        firstname: string;
        lastname: string;
        profileImage: string;
    };
}

export default function Polls() {
    const [activeTab, setActiveTab] = useState("Own Poll");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create Poll State
    const [pollType, setPollType] = useState<string | null>(null);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [pollForm, setPollForm] = useState({
        question: "",
        options: ["", ""],
        minValues: "",
        maxValues: "",
        decimalPlaces: "0",
        answerPlaceholder: ""
    });

    const tabs = ["Own Poll", "New Poll", "Previous Poll"];

    const pollTypes = [
        { label: "Multichoice", icon: Users },
        { label: "Ranking", icon: BarChart3 },
        { label: "Rating", icon: CheckCircle2 },
        { label: "Numeric", icon: Binary },
        { label: "Text", icon: Type }
    ];

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const profile = await authApi.getProfile();
            const societyId = profile.user?.society || (profile.user?.societies?.[0]?._id);
            
            const response = await pollApi.getAll(societyId);
            setPolls(response.polls || []);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch polls");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleAddOption = () => {
        setPollForm(prev => ({
            ...prev,
            options: [...prev.options, ""]
        }));
    };

    const handleRemoveOption = (index: number) => {
        if (pollForm.options.length <= 2) {
            toast.error("At least 2 options are required");
            return;
        }
        setPollForm(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...pollForm.options];
        newOptions[index] = value;
        setPollForm(prev => ({ ...prev, options: newOptions }));
    };

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let data: any = {
            question: pollForm.question,
            pollType: pollType,
        };

        if (pollType === "Numeric") {
            if (!pollForm.minValues || !pollForm.maxValues) {
                toast.error("Please fill in numeric range");
                return;
            }
            data.numericRange = { min: pollForm.minValues, max: pollForm.maxValues, decimals: pollForm.decimalPlaces };
        } else if (pollType === "Text") {
            // Text polls usually just need the question
        } else {
            const filteredOptions = pollForm.options.filter(opt => opt.trim() !== "");
            if (filteredOptions.length < 2) {
                toast.error("Please provide at least 2 options");
                return;
            }
            data.options = filteredOptions.map(text => ({ text }));
        }

        if (!pollForm.question.trim()) {
            toast.error("Please provide a question");
            return;
        }

        try {
            const profile = await authApi.getProfile();
            const societyId = profile.user?.society || (profile.user?.societies?.[0]?._id);
            data.society = societyId;

            await pollApi.create(data);

            toast.success("Poll created successfully");
            setPollForm({ question: "", options: ["", ""], minValues: "", maxValues: "", decimalPlaces: "0", answerPlaceholder: "" });
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
            fetchPolls();
        } catch (error: any) {
            toast.error(error.message || "Failed to cast vote");
        }
    };

    const calculatePercentage = (votes: number, totalVotes: number) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    const getPollTypeIcon = (type: string) => {
        const found = pollTypes.find(t => t.label === type);
        const Icon = found ? found.icon : Plus;
        return <Icon size={18} className="text-[#202224]" />;
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
                            const authorName = poll.createdBy 
                                ? `${poll.createdBy.firstname} ${poll.createdBy.lastname}`
                                : "Resident";
                            
                            return (
                                <div key={poll._id} className="group relative rounded-2xl border border-[#F4F4F4] p-5 transition-all hover:shadow-md hover:border-[#5678E9]/20">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                src={poll.createdBy?.profileImage || ""}
                                                name={authorName}
                                                size="sm"
                                            />
                                            <div>
                                                <h3 className="text-xs font-bold text-[#202224] truncate max-w-[100px]">{authorName}</h3>
                                                <p className="text-[10px] text-[#A7A7A7]">{poll.pollType} polls</p>
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
                                        <span className="text-[10px] text-[#A7A7A7]">Select one or more</span>
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
                                                            className={cn("h-full rounded-full transition-all duration-500", 
                                                                percentage > 50 ? "bg-[#00B69B]" : "bg-[#E74C3C]"
                                                            )}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <span className="text-[10px] font-medium text-[#A7A7A7]">{new Date(poll.createdAt).toLocaleDateString()}, {new Date(poll.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                    {/* Poll Type Dropdown */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#202224]">Polls<span className="text-[#E74C3C]">*</span></label>
                        <div className="relative">
                            <div 
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 bg-white cursor-pointer transition-all",
                                    isTypeDropdownOpen ? "border-[#5678E9] ring-1 ring-[#5678E9]/10" : "border-[#D3D3D3]"
                                )}
                            >
                                {pollType ? getPollTypeIcon(pollType) : <BarChart3 size={18} className="text-[#A7A7A7]" />}
                                <span className={cn("flex-1 text-sm font-medium", pollType ? "text-[#202224]" : "text-[#A7A7A7]")}>
                                    {pollType ? `${pollType} polls` : "Select Polls"}
                                </span>
                                <ChevronDown className={cn("text-[#A7A7A7] transition-transform", isTypeDropdownOpen && "rotate-180")} size={18} />
                            </div>

                            {isTypeDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsTypeDropdownOpen(false)} />
                                    <div className="absolute top-12 left-0 z-20 w-full rounded-xl border border-[#F4F4F4] bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2">
                                        {pollTypes.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => {
                                                    setPollType(item.label);
                                                    setIsTypeDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer",
                                                    pollType === item.label ? "bg-[#F1F4FF] text-[#5678E9]" : "hover:bg-[#F6F8FB] text-[#202224]"
                                                )}
                                            >
                                                <item.icon size={16} />
                                                <span className="font-medium">{item.label} polls</span>
                                                <div className="ml-auto">
                                                    <div className={cn(
                                                        "h-4 w-4 rounded-full border-2 flex items-center justify-center p-0.5 transition-all",
                                                        pollType === item.label ? "border-[#FF6B35]" : "border-[#D3D3D3]"
                                                    )}>
                                                        {pollType === item.label && <div className="h-full w-full rounded-full bg-[#FF6B35]" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {pollType && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <FormInput
                                label="Question"
                                required
                                value={pollForm.question}
                                onChange={(val) => setPollForm(prev => ({ ...prev, question: val }))}
                                placeholder="Ask a question"
                                className="h-11 rounded-xl"
                            />

                            {/* Dynamic Layout Based on Type */}
                            {pollType === "Numeric" ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput
                                            label="Min Values"
                                            required
                                            value={pollForm.minValues}
                                            onChange={(val) => setPollForm(prev => ({ ...prev, minValues: val }))}
                                            placeholder="Enter Min Values"
                                            className="h-11 rounded-xl"
                                        />
                                        <FormInput
                                            label="Max Values"
                                            required
                                            value={pollForm.maxValues}
                                            onChange={(val) => setPollForm(prev => ({ ...prev, maxValues: val }))}
                                            placeholder="Enter Max Values"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#202224]">Decimal Places<span className="text-[#E74C3C]">*</span></label>
                                        <div className="relative">
                                            <select 
                                                value={pollForm.decimalPlaces}
                                                onChange={(e) => setPollForm(prev => ({ ...prev, decimalPlaces: e.target.value }))}
                                                className="w-full h-11 rounded-xl border border-[#D3D3D3] px-3 text-sm font-medium outline-none focus:border-[#5678E9] appearance-none bg-white"
                                            >
                                                <option value="0">Select Decimal Places</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7A7A7] pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                </div>
                            ) : pollType === "Text" ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#202224]">Answer<span className="text-[#E74C3C]">*</span></label>
                                    <textarea 
                                        placeholder="Enter Answer"
                                        className="w-full h-32 rounded-xl border border-[#D3D3D3] p-4 text-sm font-medium outline-none focus:border-[#5678E9] resize-none"
                                        value={pollForm.answerPlaceholder}
                                        onChange={(e) => setPollForm(prev => ({ ...prev, answerPlaceholder: e.target.value }))}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pollForm.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="flex-1 relative">
                                                {(pollType === "Ranking" || pollType === "Rating") && (
                                                    <div className="absolute left-3 top-[38px] -translate-y-1/2 h-5 w-5 rounded-full border border-[#D3D3D3] flex items-center justify-center text-[10px] font-bold text-[#A7A7A7] z-10">
                                                        {index + 1}
                                                    </div>
                                                )}
                                                <FormInput
                                                    label={pollType === "Multichoice" ? `Option ${index + 1}` : `Rank ${index + 1}`}
                                                    required
                                                    value={option}
                                                    onChange={(val) => handleOptionChange(index, val)}
                                                    placeholder="Ask a question"
                                                    className={cn("h-fit rounded-xl")}
                                                    inputClassName={cn((pollType === "Ranking" || pollType === "Rating") && "pl-10")}
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF4F4] text-[#E74C3C] hover:bg-[#FFE8E8] transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] hover:text-[#E85D2A] transition-colors"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#FF6B35]">
                                            <Plus size={14} strokeWidth={3} />
                                        </div>
                                        Add an option
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="h-11 rounded-xl font-bold border-[#D3D3D3] text-[#202224] hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 rounded-xl font-bold bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white border-none shadow-md shadow-[#FE512E]/20"
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
