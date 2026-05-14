import { useState, useEffect } from "react";
import {
    MoreVertical,
    Eye,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import Button from "../../../ui/Button";
import ChatSidebar, { type Contact } from "../components/ChatSidebar";
import Avatar from "../../../components/Avatar";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { authApi, videoApi, discussionApi } from "../../../services/api";
import { Loader2, Plus, ThumbsUp, MessageSquare } from "lucide-react";

const apiKey = import.meta.env.VITE_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

// Mock data for contacts
const contacts: Contact[] = [
    {
        id: "1",
        name: "Michael John",
        lastMessage: "Hi, John! how are you doing?",
        time: "10:27",
        avatar:
            "https://ui-avatars.com/api/?name=Michael+John&background=E5E7EB&color=202224",
        status: "offline",
        unread: 0,
        typing: false,
        delivered: true,
    },
    {
        id: "2",
        name: "Jenny Wilson",
        lastMessage: "Hello, Jenny",
        time: "7:00",
        avatar:
            "https://ui-avatars.com/api/?name=Jenny+Wilson&background=E5E7EB&color=202224",
        status: "offline",
        unread: 7,
        typing: false,
    },
    {
        id: "3",
        name: "Community",
        lastMessage: "Typing...",
        time: "9:20",
        avatar:
            "https://ui-avatars.com/api/?name=Community&background=F3F4F6&color=A7A7A7",
        status: "online",
        unread: 0,
        typing: true,
    },
    {
        id: "4",
        name: "Esther Howard",
        lastMessage: "Hello, Esther",
        time: "10:27",
        avatar:
            "https://ui-avatars.com/api/?name=Esther+Howard&background=E5E7EB&color=202224",
        status: "offline",
        unread: 0,
        typing: false,
        delivered: true,
    },
    {
        id: "5",
        name: "Cody Fisher",
        lastMessage: "Thank you for your order!",
        time: "7:00",
        avatar:
            "https://ui-avatars.com/api/?name=Cody+Fisher&background=E5E7EB&color=202224",
        status: "offline",
        unread: 0,
        typing: false,
        delivered: true,
    },
];

export default function CommunitiesDiscussion() {
    const [view, setView] = useState<"list" | "ask" | "detail">("list");
    const [activeContact, setActiveContact] = useState(contacts[2]);
    const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

    // Form states
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
        setSelectedDiscussion(discussion);
        setView("detail");
        setLoading(true);
        try {
            const res = await discussionApi.getById(discussion._id);
            setSelectedDiscussion(res.discussion);
            setAnswers(res.answers || []);
        } catch (error) {
            console.error("Failed to load details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteDiscussion = async (id: string) => {
        try {
            const res = await discussionApi.voteDiscussion(id);
            if (selectedDiscussion?._id === id) {
                setSelectedDiscussion((p: any) => ({ ...p, upvotes: res.upvotes }));
            }
            setDiscussions(prev => prev.map(d => d._id === id ? { ...d, upvotes: res.upvotes } : d));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleVoteAnswer = async (id: string) => {
        try {
            const res = await discussionApi.voteAnswer(id);
            setAnswers(prev => prev.map(a => a._id === id ? { ...a, upvotes: res.upvotes } : a));
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

    const handleAskQuestion = () => {
        setNewQuestion({ title: "", description: "" });
        setView("ask");
    };

    const submitQuestion = async () => {
        if (!newQuestion.title.trim() || !newQuestion.description.trim()) {
            return toast.error("Please fill all fields");
        }

        try {
            const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
            await discussionApi.create({
                title: newQuestion.title,
                content: newQuestion.description,
                society: societyId
            });
            toast.success("Discussion posted!");
            setView("list");
            fetchDiscussions(currentUser);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handlePostAnswer = async () => {
        if (!answerText.trim()) return toast.error("Please type an answer");

        try {
            await discussionApi.createAnswer({
                discussionId: selectedDiscussion._id,
                content: answerText
            });
            toast.success("Answer posted!");
            setAnswerText("");
            loadDiscussionDetail(selectedDiscussion); // Refresh answers
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const renderContent = () => (
        <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-[#F4F4F4]">
            <ChatSidebar
                contacts={contacts}
                activeContactId={activeContact.id}
                onContactSelect={setActiveContact}
                title="Chat"
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F4F4F4] px-6 py-4 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {view !== "list" && (
                            <button
                                onClick={() => setView("list")}
                                className="mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <Avatar src={contacts[2].avatar} name="Community" />
                        <div>
                            <h3 className="text-sm font-bold text-[#202224]">Community</h3>
                            <p className="text-[10px] text-[#A7A7A7]">9:00 Pm</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {view === "list" && (
                            <Button
                                onClick={handleAskQuestion}
                                className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-10 px-6"
                            >
                                Ask Question
                            </Button>
                        )}
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <MoreVertical size={20} className="text-[#202224]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F9FBFF]/30">
                    {view === "list" && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex h-64 items-center justify-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                                </div>
                            ) : discussions.length === 0 ? (
                                <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                                    <p>No community questions yet. Be the first to ask!</p>
                                </div>
                            ) : (
                                discussions.map((d) => (
                                    <div
                                        key={d._id}
                                        onClick={() => loadDiscussionDetail(d)}
                                        className="group cursor-pointer rounded-2xl bg-white p-5 border border-[#F4F4F4] hover:border-[#5678E9]/30 hover:shadow-md transition-all flex gap-8 items-start"
                                    >
                                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                            <div className="text-center">
                                                <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">
                                                    votes
                                                </p>
                                                <p className="text-sm font-bold text-[#202224]">
                                                    {d.upvotes?.length || 0}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">
                                                    views
                                                </p>
                                                <p className="text-sm font-bold text-[#5678E9]">
                                                    {d.views || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-bold text-[#202224] group-hover:text-[#5678E9] transition-colors">
                                                    {d.title}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-[#A7A7A7]">
                                                    <Avatar src={d.createdBy?.profileImage} name={`${d.createdBy?.firstname} ${d.createdBy?.lastname}`} size="xs" />
                                                    <span className="text-[10px] font-bold">{d.createdBy?.firstname}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-[#A7A7A7] line-clamp-2 mb-4">
                                                {d.content}
                                            </p>
                                            <div className="flex justify-end">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        loadDiscussionDetail(d);
                                                    }}
                                                    className="flex items-center gap-2 text-[11px] font-bold text-[#5678E9] hover:bg-[#5678E9]/10 px-3 py-1.5 rounded-lg transition-colors"
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
                    )}

                    {view === "ask" && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="rounded-2xl border-2 border-[#D3D3D3] border-dashed p-8 bg-[#F1F4FF]/50">
                                <h4 className="text-lg font-bold text-[#202224] mb-4">
                                    Writing a good question
                                </h4>
                                <p className="text-sm text-[#202224] mb-4">
                                    You're ready to{" "}
                                    <span className="text-[#5678E9] cursor-pointer">
                                        ask a programming-related question
                                    </span>{" "}
                                    and this form will help guide you through the process.
                                    <br />
                                    Looking to ask a non-programming question? See{" "}
                                    <span className="text-[#5678E9] cursor-pointer">
                                        the topics here
                                    </span>{" "}
                                    to find a relevant site.
                                </p>
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-[#202224]">Steps</p>
                                    <ul className="text-sm text-[#202224] space-y-2 list-disc list-inside">
                                        <li>Summarize your problem in a one-line title.</li>
                                        <li>Describe your problem in more detail.</li>
                                        <li>
                                            Describe what you tried and what you expected to happen.
                                        </li>
                                        <li>
                                            Add "tags" which help surface your question to members of
                                            the community.
                                        </li>
                                        <li>Review your question and post it to the site.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-8 border border-[#F4F4F4] shadow-sm space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#202224]">
                                        Title
                                    </label>
                                    <p className="text-[11px] text-[#A7A7A7]">
                                        Be specific and imagine you're asking a question to another
                                        person.
                                    </p>
                                    <input
                                        type="text"
                                        value={newQuestion.title}
                                        onChange={(e) => setNewQuestion(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                                        className="w-full rounded-xl border-2 border-[#D3D3D3] px-4 py-3 text-sm outline-none focus:border-[#5678E9] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#202224]">
                                        Description
                                    </label>
                                    <p className="text-[11px] text-[#A7A7A7]">
                                        Include all the information someone would need to answer your question.
                                    </p>
                                    <textarea
                                        value={newQuestion.description}
                                        onChange={(e) => setNewQuestion(p => ({ ...p, description: e.target.value }))}
                                        placeholder="What are the details of your problem?"
                                        className="w-full min-h-[150px] rounded-xl border-2 border-[#D3D3D3] px-4 py-3 text-sm outline-none focus:border-[#5678E9] transition-all resize-none"
                                    />
                                </div>
                                <Button
                                    onClick={submitQuestion}
                                    className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-11 px-8"
                                >
                                    Post Your Question
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === "detail" && selectedDiscussion && (
                        <div className="max-w-5xl mx-auto space-y-8 pb-12">
                            {/* Question Section */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <button 
                                        onClick={() => handleVoteDiscussion(selectedDiscussion._id)}
                                        className={cn(
                                            "p-2 rounded-full border transition-all",
                                            selectedDiscussion.upvotes?.includes(currentUser?._id) 
                                                ? "bg-[#FF6B35] border-[#FF6B35] text-white" 
                                                : "bg-gray-50 border-[#D3D3D3] text-gray-400 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                                        )}
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                    <span className="text-lg font-bold text-[#FF6B35]">
                                        {selectedDiscussion.upvotes?.length || 0}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-[#202224]">
                                            {selectedDiscussion.title}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <Avatar src={selectedDiscussion.createdBy?.profileImage} name={`${selectedDiscussion.createdBy?.firstname} ${selectedDiscussion.createdBy?.lastname}`} size="sm" />
                                            <span className="text-xs font-bold text-gray-500">{selectedDiscussion.createdBy?.firstname}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#202224]">
                                        {selectedDiscussion.content}
                                    </p>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-[#5678E9]">
                                            Answers ({answers.length || 0})
                                        </h4>
                                        <div className="space-y-6 pl-4 border-l-2 border-[#F4F4F4]">
                                            {answers.map((a: any) => (
                                                <div key={a._id} className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100 relative">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar src={a.createdBy?.profileImage} name={`${a.createdBy?.firstname} ${a.createdBy?.lastname}`} size="sm" />
                                                            <span className="text-[10px] font-bold text-[#5678E9]">{a.createdBy?.firstname} {a.createdBy?.lastname}</span>
                                                            <span className="text-[10px] text-gray-400">• {new Date(a.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleVoteAnswer(a._id)}
                                                            className={cn(
                                                                "flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all",
                                                                a.upvotes?.includes(currentUser?._id)
                                                                    ? "bg-[#FF6B35] border-[#FF6B35] text-white"
                                                                    : "bg-white border-gray-200 text-gray-400 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                                                            )}
                                                        >
                                                            <ThumbsUp size={12} />
                                                            {a.upvotes?.length || 0}
                                                        </button>
                                                    </div>
                                                    <p className="text-[13px] leading-relaxed text-[#202224]">
                                                        {a.content}
                                                    </p>
                                                </div>
                                            ))}
                                            {answers.length === 0 && (
                                                <p className="text-xs text-gray-400 italic">No answers yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Box */}
                            <div className="space-y-4 pt-8 border-t border-gray-100">
                                <label className="text-sm font-bold text-[#202224]">
                                    Your Answer
                                </label>
                                <textarea
                                    value={answerText}
                                    autoFocus
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full min-h-[140px] rounded-2xl border-2 border-[#D3D3D3] p-6 text-sm outline-none focus:border-[#5678E9] transition-all resize-none shadow-inner"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handlePostAnswer}
                                        className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-12 px-10 shadow-lg"
                                    >
                                        Post Your Answer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (!videoClient) {
        return <div className="flex items-center justify-center h-full">Loading Video...</div>;
    }

    return (
        <StreamVideo client={videoClient}>
            {renderContent()}
        </StreamVideo>
    );
}