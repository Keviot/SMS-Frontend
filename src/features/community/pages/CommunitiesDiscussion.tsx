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
import { authApi, videoApi } from "../../../services/api";

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

// Mock data for questions
const questions = [
    {
        id: "1",
        title: "What is the capital of France?",
        description:
            "Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content! Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content.",
        votes: 0,
        answersCount: 0,
        views: 20,
    },
    {
        id: "2",
        title: "What is the capital of France?",
        description:
            "Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content! Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content.",
        votes: 0,
        answersCount: 1,
        views: 20,
        highlighted: true,
    },
    {
        id: "3",
        title: "What is the capital of France?",
        description:
            "Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content! Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content.",
        votes: 3,
        answersCount: 0,
        views: 20,
        color: "text-[#00B69B]",
    },
    {
        id: "4",
        title: "What is the capital of France?",
        description:
            "Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content! Feel free to let me know if you need more examples or if there's anything specific you'd like to include in your dummy content.",
        votes: 0,
        answersCount: 2,
        views: 20,
        color: "text-[#5678E9]",
    },
];

export default function CommunitiesDiscussion() {
    const [view, setView] = useState<"list" | "ask" | "detail">("list");
    const [activeContact, setActiveContact] = useState(contacts[2]);
    const [selectedQuestion, setSelectedQuestion] = useState(questions[0]);
    const [voteCount, setVoteCount] = useState(5);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

    useEffect(() => {
        const initVideo = async () => {
            try {
                const profileData = await authApi.getProfile();
                const user = profileData.user;
                if (!user) return;

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
        initVideo();

        return () => {
            if (videoClient) videoClient.disconnectUser();
        };
    }, []);

    const handleAskQuestion = () => setView("ask");
    const handleQuestionClick = (q: any) => {
        setSelectedQuestion(q);
        setView("detail");
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
                            {questions.map((q) => (
                                <div
                                    key={q.id}
                                    onClick={() => handleQuestionClick(q)}
                                    className="group cursor-pointer rounded-2xl bg-white p-5 border border-[#F4F4F4] hover:border-[#5678E9]/30 hover:shadow-md transition-all flex gap-8 items-start"
                                >
                                    <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">
                                                votes
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-sm font-bold",
                                                    q.color || "text-[#202224]",
                                                )}
                                            >
                                                {q.votes}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">
                                                answers
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-sm font-bold",
                                                    q.answersCount > 0
                                                        ? "text-[#5678E9]"
                                                        : "text-[#202224]",
                                                )}
                                            >
                                                {q.answersCount}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-bold text-[#202224] group-hover:text-[#5678E9] transition-colors">
                                                {q.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[#A7A7A7]">
                                                <Eye size={14} />
                                                <span className="text-[10px] font-bold">{q.views}</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-[#A7A7A7] line-clamp-2">
                                            {q.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                                        placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                                        className="w-full rounded-xl border-2 border-[#D3D3D3] px-4 py-3 text-sm outline-none focus:border-[#5678E9] transition-all"
                                    />
                                </div>
                                <Button
                                    onClick={() => {
                                        toast.success("Question posted!");
                                        setView("list");
                                    }}
                                    className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-11 px-8"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === "detail" && (
                        <div className="max-w-5xl mx-auto space-y-8 pb-12">
                            {/* Question Section */}
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <button
                                        onClick={() => setVoteCount((v) => v + 1)}
                                        className="p-2 rounded-full border border-[#D3D3D3] hover:bg-[#F1F4FF] transition-colors"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                    <span className="text-lg font-bold text-[#FF6B35]">
                                        {voteCount}
                                    </span>
                                    <button
                                        onClick={() => setVoteCount((v) => v - 1)}
                                        className="p-2 rounded-full border border-[#D3D3D3] hover:bg-[#F1F4FF] transition-colors"
                                    >
                                        <ArrowDown size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-[#202224]">
                                            {selectedQuestion.title}
                                        </h2>
                                        <div className="flex items-center gap-1.5 text-[#A7A7A7]">
                                            <Eye size={14} />
                                            <span className="text-[10px] font-bold">20</span>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#A7A7A7]">
                                        {selectedQuestion.description}
                                    </p>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-[#5678E9]">
                                            Answers
                                        </h4>
                                        <div className="space-y-6 pl-4 border-l-2 border-[#F4F4F4]">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="space-y-2">
                                                    <p className="text-[13px] leading-relaxed text-[#A7A7A7]">
                                                        {i}. Feel free to let me know if you need more
                                                        examples or if there's anything specific you'd like
                                                        to include in your dummy content! Feel free to let
                                                        me know if you need more examples or if there's
                                                        anything specific you'd like to include in your
                                                        dummy content!
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Box */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-[#202224]">
                                    Your Answer
                                </label>
                                <textarea
                                    placeholder="Type Here"
                                    className="w-full min-h-[180px] rounded-2xl border-2 border-[#D3D3D3] p-6 text-sm outline-none focus:border-[#5678E9] transition-all resize-none"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => toast.success("Answer posted!")}
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
