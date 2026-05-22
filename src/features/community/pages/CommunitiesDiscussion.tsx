import { useState, useEffect } from "react";
import {
    MoreVertical,
    Eye,
    ArrowUp,
    ChevronLeft,
    ThumbsUp,
    MessageSquare,
    Loader2,
    X,
    Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import Button from "../../../ui/Button";
import Avatar from "../../../components/Avatar";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { authApi, videoApi, discussionApi } from "../../../services/api";

const apiKey = import.meta.env.VITE_STREAM_API_KEY || "YOUR_STREAM_API_KEY";


export default function CommunitiesDiscussion() {
    const [view, setView] = useState<"list" | "detail">("list");
    const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

    // Modal states
    const [showAskModal, setShowAskModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: "", description: "" });
    const [answerText, setAnswerText] = useState("");

    const fetchCurrentUser = async () => {
        try {
            const profile = await authApi.getProfile();
            setCurrentUser(profile.user);
            return profile.user;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            return null;
        }
    };

    const fetchDiscussions = async (user: any) => {
        if (!user) return;
        setLoading(true);
        try {
            const societyId = user.society?._id || user.society || user.societies?.[0]?._id;
            const res = await discussionApi.getAll(societyId);
            setDiscussions(res.discussions || []);
        } catch (error) {
            console.error("Failed to fetch discussions:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDiscussionDetail = async (discussion: any) => {
        setLoading(true);
        try {
            const res = await discussionApi.getById(discussion._id);
            setSelectedDiscussion(res.discussion);
            setAnswers(res.answers || []);
            setView("detail");
        } catch (error) {
            console.error("Failed to load details:", error);
            toast.error("Failed to load discussion details");
        } finally {
            setLoading(false);
        }
    };

    const handleVoteDiscussion = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await discussionApi.voteDiscussion(id);
            if (selectedDiscussion?._id === id) {
                setSelectedDiscussion((p: any) => ({ ...p, votes: Array(res.votesCount).fill(null) }));
            }
            setDiscussions(prev => prev.map(d => d._id === id ? { ...d, votes: Array(res.votesCount).fill(null) } : d));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleVoteAnswer = async (id: string) => {
        try {
            const res = await discussionApi.voteAnswer(id);
            setAnswers(prev => prev.map(a => a._id === id ? { ...a, votes: Array(res.votesCount).fill(null) } : a));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        const init = async () => {
            const user = await fetchCurrentUser();
            if (user) {
                fetchDiscussions(user);
                initVideo(user);
            }
        };

        const initVideo = async (user: any) => {
            try {
                const tokenData = await videoApi.generateToken(user._id);
                const client = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: user._id,
                        name: `${user.firstname} ${user.lastname}`,
                        image: user.profileImage,
                    },
                    token: tokenData.token,
                });
                setVideoClient(client);
            } catch (error) {
                console.error("Video initialization failed:", error);
            }
        };
        init();

        return () => {
            if (videoClient) videoClient.disconnectUser();
        };
    }, []);

    const submitQuestion = async () => {
        if (!newQuestion.title.trim() || !newQuestion.description.trim()) {
            return toast.error("Please fill all fields");
        }

        setSubmitting(true);
        try {
            const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
            await discussionApi.create({
                title: newQuestion.title,
                content: newQuestion.description,
                society: societyId
            });
            toast.success("Discussion posted!");
            setShowAskModal(false);
            setNewQuestion({ title: "", description: "" });
            fetchDiscussions(currentUser);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePostAnswer = async () => {
        if (!answerText.trim()) return toast.error("Please type an answer");

        setSubmitting(true);
        try {
            await discussionApi.createAnswer({
                discussionId: selectedDiscussion._id,
                content: answerText
            });
            toast.success("Answer posted!");
            setAnswerText("");
            const res = await discussionApi.getById(selectedDiscussion._id);
            setAnswers(res.answers || []);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderAskModal = () => (
        <div 
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAskModal(false); }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all scale-100">
                <div className="flex items-center justify-between border-b border-[#F4F4F4] px-8 py-6">
                    <h2 className="text-xl font-bold text-[#202224]">Ask a Question</h2>
                    <button onClick={() => setShowAskModal(false)} className="rounded-full p-2 text-[#A7A7A7] hover:bg-gray-100 hover:text-[#FE512E] transition-all">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#202224]">Title</label>
                        <input
                            type="text"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion(p => ({ ...p, title: e.target.value }))}
                            placeholder="Summarize your problem in a one-line title"
                            className="w-full rounded-xl border border-[#D9D9D9] px-4 py-3 text-sm outline-none focus:border-secondary transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#202224]">Description</label>
                        <textarea
                            value={newQuestion.description}
                            onChange={(e) => setNewQuestion(p => ({ ...p, description: e.target.value }))}
                            placeholder="Include all the information someone would need to answer your question"
                            className="w-full min-h-38 rounded-xl border border-[#D9D9D9] px-4 py-3 text-sm outline-none focus:border-secondary transition-all resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowAskModal(false)}
                            className="h-12 px-8 rounded-xl border-[#D9D9D9] text-[#202224] font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitQuestion}
                            disabled={submitting}
                            className="bg-primary-light hover:bg-primary-hover text-white border-none rounded-xl font-bold h-12 px-10 shadow-lg shadow-primary-light/20"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : "Post Question"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-[#F4F4F4]">
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F4F4F4] px-6 py-4 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {view !== "list" && (
                            <button
                                onClick={() => setView("list")}
                                className="mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F8FB]">
                            <MessageSquare className="text-secondary" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#202224]">Community Discussion</h3>
                            <p className="text-[10px] text-[#A7A7A7]">9:00 Pm</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {view === "list" && (
                            <Button
                                onClick={() => setShowAskModal(true)}
                                className="bg-primary-light hover:bg-primary-hover text-white border-none rounded-xl font-bold h-10 px-6 transition-all active:scale-95"
                            >
                                Ask Question
                            </Button>
                        )}
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <MoreVertical size={20} className="text-[#202224]" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F9FBFF]/30">
                    {loading && view === "list" ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary-light" />
                        </div>
                    ) : view === "list" ? (
                        <div className="space-y-4 max-w-5xl mx-auto">
                            {discussions.length === 0 ? (
                                <div className="flex h-64 flex-col items-center justify-center text-[#A7A7A7] space-y-4">
                                    <MessageSquare size={48} className="opacity-20" />
                                    <p className="font-medium text-lg italic">No community questions yet. Be the first to ask!</p>
                                </div>
                            ) : (
                                discussions.map((d) => (
                                    <div
                                        key={d._id}
                                        onClick={() => loadDiscussionDetail(d)}
                                        className="group cursor-pointer rounded-2xl bg-white p-5 border border-[#F4F4F4] hover:border-secondary/30 hover:shadow-xl transition-all flex gap-8 items-start duration-300"
                                    >
                                        {/* Metrics Column */}
                                        <div className="flex flex-col items-center gap-4 min-w-18 pt-1">
                                            <div className="text-center group-hover:transform group-hover:scale-110 transition-transform">
                                                <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">votes</p>
                                                <p className={cn("text-sm font-bold", (d.votes?.length || 0) > 0 ? "text-primary-light" : "text-[#202224]")}>
                                                    {d.votes?.length || 0}
                                                </p>
                                            </div>
                                            <div className="text-center group-hover:transform group-hover:scale-110 transition-transform delay-75">
                                                <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">answers</p>
                                                <p className={cn("text-sm font-bold", d.answersCount > 0 ? "text-secondary" : "text-[#A7A7A7]")}>
                                                    {d.answersCount || 0}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">views</p>
                                                <p className="text-sm font-bold text-[#A7A7A7]">{d.views || 0}</p>
                                            </div>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <h4 className="text-base font-bold text-[#202224] group-hover:text-secondary transition-colors line-clamp-1 leading-tight">
                                                    {d.question}
                                                </h4>
                                                <div className="flex items-center gap-2 bg-[#F6F8FB] px-3 py-1 rounded-full shrink-0">
                                                    <Clock size={12} className="text-[#A7A7A7]" />
                                                    <span className="text-[10px] font-bold text-[#A7A7A7]">{new Date(d.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs leading-relaxed text-[#A7A7A7] line-clamp-2 min-h-8">
                                                {d.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar src={d.user?.profileImage} name={`${d.user?.firstname} ${d.user?.lastname}`} size="xs" />
                                                    <span className="text-[11px] font-bold text-[#202224]">{d.user?.firstname} {d.user?.lastname}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); loadDiscussionDetail(d); }}
                                                    className="flex items-center gap-2 text-[11px] font-bold text-secondary hover:bg-secondary/10 px-4 py-2 rounded-xl transition-colors"
                                                >
                                                    <MessageSquare size={14} />
                                                    Reply to Topic
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Detail View */
                        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Question Section */}
                            <div className="flex gap-8">
                                <div className="flex flex-col items-center gap-4 py-2">
                                    <button
                                        onClick={(e) => handleVoteDiscussion(selectedDiscussion._id, e)}
                                        className={cn(
                                            "group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300",
                                            selectedDiscussion.votes?.includes(currentUser?._id)
                                                ? "bg-primary-light border-primary-light text-white shadow-lg shadow-[#FF6B35]/30"
                                                : "bg-white border-[#D9D9D9] text-[#A7A7A7] hover:border-primary-light hover:text-primary-light"
                                        )}
                                    >
                                        <ArrowUp size={20} className="transition-transform group-active:-translate-y-1" />
                                        <span className="mt-1 text-sm font-bold">{selectedDiscussion.votes?.length || 0}</span>
                                    </button>
                                    <div className="flex flex-col items-center gap-1 text-[#A7A7A7]">
                                        <Eye size={18} />
                                        <span className="text-[10px] font-bold uppercase">{selectedDiscussion.views || 0} views</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#A7A7A7] uppercase tracking-widest">
                                            <span>Discussion Topic</span>
                                            <span>•</span>
                                            <span className="text-secondary">General</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-[#202224] leading-tight">
                                            {selectedDiscussion.question}
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-4 py-3 border-y border-[#F4F4F4]">
                                        <Avatar src={selectedDiscussion.user?.profileImage} name={`${selectedDiscussion.user?.firstname} ${selectedDiscussion.user?.lastname}`} size="sm" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[#202224]">{selectedDiscussion.user?.firstname} {selectedDiscussion.user?.lastname}</p>
                                            <p className="text-[10px] text-[#A7A7A7]">{new Date(selectedDiscussion.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-[#F6F8FB] rounded-xl">
                                            <MessageSquare size={16} className="text-secondary" />
                                            <span className="text-xs font-bold text-secondary">{answers.length} Answers</span>
                                        </div>
                                    </div>

                                    <div className="prose prose-sm max-w-none text-[#4B5563] leading-relaxed">
                                        {selectedDiscussion.description}
                                    </div>

                                    {/* Answers List */}
                                    <div className="space-y-6 pt-10">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-base font-bold text-[#202224]">Discussion Threads</h4>
                                            <div className="h-0.5 flex-1 mx-6 bg-[#F4F4F4]" />
                                        </div>

                                        <div className="space-y-6">
                                            {answers.length > 0 ? (
                                                answers.map((a: any) => (
                                                    <div key={a._id} className="relative pl-12 group">
                                                        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-[#F4F4F4] group-last:bottom-auto group-last:h-4" />
                                                        <div className="absolute left-3.5 top-4 size-1.5 rounded-full bg-secondary border-2 border-white ring-4 ring-white" />

                                                        <div className="bg-[#F9FBFF] rounded-2xl p-5 border border-[#F4F4F4] transition-all hover:border-secondary/20">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar src={a.author?.profileImage} name={`${a.author?.firstname} ${a.author?.lastname}`} size="xs" />
                                                                    <div>
                                                                        <span className="text-[11px] font-bold text-[#202224]">{a.author?.firstname} {a.author?.lastname}</span>
                                                                        <p className="text-[10px] text-[#A7A7A7]">{new Date(a.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleVoteAnswer(a._id)}
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
                                                                        a.votes?.includes(currentUser?._id)
                                                                            ? "bg-primary-light border-primary-light text-white"
                                                                            : "bg-white border-[#D9D9D9] text-[#A7A7A7] hover:border-primary-light hover:text-primary-light"
                                                                    )}
                                                                >
                                                                    <ThumbsUp size={12} />
                                                                    {a.votes?.length || 0}
                                                                </button>
                                                            </div>
                                                            <p className="text-xs leading-relaxed text-[#4B5563]">
                                                                {a.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 text-[#A7A7A7]">
                                                    <p className="text-xs italic">No replies yet. Be the first to share your thoughts!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Answer Input */}
                                    <div className="space-y-4 pt-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="size-2 rounded-full bg-primary-light" />
                                            <label className="text-sm font-bold text-[#202224]">Your Perspective</label>
                                        </div>
                                        <div className="relative group">
                                            <textarea
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                placeholder="Write your answer here..."
                                                className="w-full min-h-[160px] rounded-3xl border-2 border-[#F4F4F4] p-6 text-sm outline-none focus:border-secondary focus:bg-white bg-white transition-all resize-none shadow-sm group-hover:border-[#D9D9D9]"
                                            />
                                            <div className="absolute bottom-6 right-6">
                                                <Button
                                                    onClick={handlePostAnswer}
                                                    disabled={submitting || !answerText.trim()}
                                                    className="bg-primary-light hover:bg-primary-light/80 text-white border-none rounded-2xl font-bold h-12 px-10 shadow-xl shadow-primary-light/30 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                                >
                                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "Post Answer"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showAskModal && renderAskModal()}
        </div>
    );

    if (!videoClient) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-[#A7A7A7]">
                <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                <p className="font-medium animate-pulse">Initializing Community Discussions...</p>
            </div>
        );
    }

    return (
        <StreamVideo client={videoClient}>
            {renderContent()}
        </StreamVideo>
    );
}
