import { useState, useEffect, useRef } from "react";
import {
    MoreVertical,
    Phone,
    Video,
    Smile,
    Paperclip,
    Camera,
    Mic,
    Send,
    FileText,
    ChevronLeft,
    Loader2,
    AlertCircle,
    Users,
    MonitorUp,
    Hand,
    MicOff,
    VideoOff,
    Maximize,
    MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import ChatSidebar, { type Contact } from "../components/ChatSidebar";
import Avatar from "../../../components/Avatar";
import { chatApi, authApi, videoApi } from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
import {
    StreamVideoClient,
    StreamVideo,
    StreamCall,
    SpeakerLayout,
    CallControls,
    Call,
    useCallStateHooks,
    useCall,
    CallingState,
    ParticipantView
} from "@stream-io/video-react-sdk";

const apiKey = import.meta.env.VITE_STREAM_API_KEY || "YOUR_STREAM_API_KEY";

// Dedicated Video Call UI Component (Google Meet Style)
// Helper component for Responsive Layout (Moved outside to prevent infinite re-renders)
const ResponsiveVideoLayout = ({
    participants,
    localParticipant,
    isMicMuted,
    pinnedParticipantId,
    onParticipantClick
}: {
    participants: any[],
    localParticipant: any,
    isMicMuted: boolean,
    pinnedParticipantId: string | null,
    onParticipantClick: (id: string) => void
}) => {
    const remoteParticipants = participants.filter(p => p.sessionId !== localParticipant?.sessionId);
    
    // Determine the main participant for Spotlight mode
    const pinnedParticipant = participants.find(p => p.sessionId === pinnedParticipantId);
    const handRaisedParticipant = participants.find(p => p.reaction?.type === 'raised-hand' && p.sessionId !== localParticipant?.sessionId);
    const speaker = participants.find(p => p.isSpeaking && !p.isLocal);

    // 1-on-1 Layout (PiP style like the image)
    if (participants.length <= 2 && !pinnedParticipantId) {
        const otherParticipant = remoteParticipants[0];

        return (
            <div className="relative h-full w-full bg-[#1a1b1e] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 transition-all duration-500">
                {/* Remote Participant (Main Screen) */}
                {otherParticipant ? (
                    <div className="h-full w-full">
                        <ParticipantView
                            participant={otherParticipant}
                            className="h-full w-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                        />
                        <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl text-white font-medium flex items-center gap-3 border border-white/10 shadow-xl">
                            {otherParticipant.isSpeaking && (
                                <div className="flex gap-0.5 items-end h-4 mb-0.5">
                                    <div className="w-1 bg-[#00A3FF] animate-pulse" style={{ height: '60%', animationDuration: '0.5s' }} />
                                    <div className="w-1 bg-[#00A3FF] animate-pulse" style={{ height: '100%', animationDuration: '0.7s' }} />
                                    <div className="w-1 bg-[#00A3FF] animate-pulse" style={{ height: '80%', animationDuration: '0.4s' }} />
                                </div>
                            )}
                            <span className="text-sm font-semibold tracking-wide">{otherParticipant.name}</span>
                            {otherParticipant.reaction?.type === 'raised-hand' && (
                                <div className="ml-2 bg-yellow-500 p-1 rounded-full animate-bounce">
                                    <Hand size={14} className="text-black" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-white/20 gap-8">
                        <div className="w-40 h-40 rounded-full bg-white/5 flex items-center justify-center border border-white/5 animate-pulse">
                            <Users size={80} className="opacity-10" />
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-2xl font-bold text-white/40 tracking-tight">Waiting for others to join</p>
                            <p className="text-sm text-white/20 font-medium bg-white/5 px-4 py-1.5 rounded-full border border-white/5">The community meeting will begin shortly</p>
                        </div>
                    </div>
                )}

                {/* Local Participant (PiP Overlay) */}
                {localParticipant && (
                    <div 
                        onClick={() => onParticipantClick(localParticipant.sessionId)}
                        className="absolute bottom-8 right-8 w-72 aspect-video rounded-3xl overflow-hidden border-[3px] border-[#00A3FF] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-20 group transition-all duration-500 hover:scale-[1.05] cursor-pointer"
                    >
                        <ParticipantView
                            participant={localParticipant}
                            className="h-full w-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                        />

                        {/* Mic status indicator on PiP (Matches image style) */}
                        <div className="absolute bottom-4 right-4 bg-white rounded-full p-2.5 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            {isMicMuted ? (
                                <MicOff size={18} className="text-[#EA4335]" />
                            ) : (
                                <Mic size={18} className="text-[#00A3FF]" />
                            )}
                        </div>

                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
                            You
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Spotlight/Pinned Layout
    const mainParticipant = pinnedParticipant || handRaisedParticipant || speaker;

    if (mainParticipant && (participants.length > 2 || pinnedParticipantId)) {
        const others = participants.filter(p => p.sessionId !== mainParticipant.sessionId);
        const isHandRaised = mainParticipant.reaction?.type === 'raised-hand';

        return (
            <div className="flex flex-col lg:flex-row h-full w-full gap-6 p-2">
                {/* Spotlight: Main Screen */}
                <div className="flex-[3] relative rounded-[40px] overflow-hidden bg-[#2d2e31] border-4 border-[#00A3FF] shadow-[0_0_40px_rgba(0,163,255,0.2)] transition-all duration-700">
                    <ParticipantView
                        participant={mainParticipant}
                        className="h-full w-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                    />
                    <div className={cn(
                        "absolute bottom-8 left-8 px-5 py-2.5 rounded-2xl text-white font-bold flex items-center gap-3 shadow-2xl animate-in slide-in-from-left-4",
                        isHandRaised ? "bg-yellow-500 text-black" : "bg-[#00A3FF]"
                    )}>
                        {isHandRaised ? (
                            <Hand size={18} className="animate-bounce" />
                        ) : (
                            <div className="flex gap-1 items-end h-4 mb-0.5">
                                <div className="w-1.5 bg-white animate-pulse" style={{ height: '60%', animationDuration: '0.4s' }} />
                                <div className="w-1.5 bg-white animate-pulse" style={{ height: '100%', animationDuration: '0.6s' }} />
                                <div className="w-1.5 bg-white animate-pulse" style={{ height: '80%', animationDuration: '0.3s' }} />
                            </div>
                        )}
                        <span className="text-sm tracking-wide">
                            {mainParticipant.name} {isHandRaised ? "has raised hand" : pinnedParticipantId === mainParticipant.sessionId ? "is pinned" : "is speaking..."}
                        </span>
                    </div>
                    {pinnedParticipantId === mainParticipant.sessionId && (
                        <button 
                            onClick={() => onParticipantClick("")}
                            className="absolute top-8 right-8 bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/60 transition-colors border border-white/10"
                            title="Unpin"
                        >
                            <Maximize size={20} />
                        </button>
                    )}
                </div>

                {/* Sidebar: Other Participants */}
                <div className="flex-1 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto custom-scrollbar pr-2 min-h-[160px] pb-2">
                    {others.map(p => (
                        <div 
                            key={p.sessionId} 
                            onClick={() => onParticipantClick(p.sessionId)}
                            className={cn(
                                "relative rounded-3xl overflow-hidden bg-[#2d2e31] border-2 aspect-video shrink-0 shadow-xl transition-all hover:scale-105 cursor-pointer group",
                                p.sessionId === pinnedParticipantId ? "border-[#00A3FF]" : "border-white/5"
                            )}
                        >
                            <ParticipantView
                                participant={p}
                                className="h-full w-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                            />
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-bold border border-white/10">
                                {p.name} {p.sessionId === localParticipant?.sessionId && "(You)"}
                            </div>
                            {p.reaction?.type === 'raised-hand' && (
                                <div className="absolute top-3 left-3 bg-yellow-500 p-1.5 rounded-full shadow-lg border border-white/20 animate-bounce">
                                    <Hand size={12} className="text-black" />
                                </div>
                            )}
                            {p.isMuted && (
                                <div className="absolute top-3 right-3 bg-black/40 p-1.5 rounded-full border border-white/5">
                                    <MicOff size={12} className="text-white/60" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default: Adaptive Grid (Google Meet style)
    return (
        <div className={cn(
            "h-full w-full grid gap-6 p-2 transition-all duration-700",
            participants.length === 3 ? "grid-cols-1 md:grid-cols-2" :
                participants.length === 4 ? "grid-cols-2" :
                    participants.length <= 6 ? "grid-cols-2 lg:grid-cols-3" :
                        "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
            {participants.map((p) => {
                const isLocal = p.sessionId === localParticipant?.sessionId;
                return (
                    <div
                        key={p.sessionId}
                        onClick={() => onParticipantClick(p.sessionId)}
                        className={cn(
                            "relative rounded-[32px] overflow-hidden bg-[#2d2e31] border-2 transition-all duration-700 shadow-2xl cursor-pointer hover:scale-[1.02]",
                            p.isSpeaking ? "border-[#00A3FF] ring-8 ring-[#00A3FF]/10 z-10" : "border-white/5",
                            p.sessionId === pinnedParticipantId && "border-[#00A3FF]"
                        )}
                    >
                        <ParticipantView
                            participant={p}
                            className="h-full w-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                        />

                        <div className="absolute bottom-5 left-5 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-3 border border-white/10 shadow-2xl">
                            {p.isSpeaking && (
                                <div className="flex gap-0.5 items-end h-3.5 mb-0.5">
                                    <div className="w-1 bg-[#00A3FF] animate-bounce" style={{ height: '60%', animationDuration: '0.5s' }} />
                                    <div className="w-1 bg-[#00A3FF] animate-bounce" style={{ height: '100%', animationDuration: '0.7s' }} />
                                    <div className="w-1 bg-[#00A3FF] animate-bounce" style={{ height: '80%', animationDuration: '0.4s' }} />
                                </div>
                            )}
                            <span className="tracking-wide">{p.name} {isLocal && "(You)"}</span>
                        </div>
                        
                        {p.reaction?.type === 'raised-hand' && (
                            <div className="absolute top-5 left-5 bg-yellow-500 p-2 rounded-2xl shadow-2xl border border-white/20 animate-bounce">
                                <Hand size={18} className="text-black" />
                            </div>
                        )}

                        {p.isMuted && !p.isSpeaking && (
                            <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-md p-2.5 rounded-full text-white/60 border border-white/5 shadow-xl">
                                <MicOff size={16} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

function VideoCallUI({ onLeave }: { onLeave: () => void }) {
    const call = useCall();
    const {
        useMicrophoneState,
        useCameraState,
        useLocalParticipant,
        useCallCallingState,
        useParticipants
    } = useCallStateHooks();

    const { isMute: isMicMuted } = useMicrophoneState();
    const { isMute: isCamMuted } = useCameraState();
    const localParticipant = useLocalParticipant();
    const callingState = useCallCallingState();
    const participants = useParticipants();

    const [isHandRaised, setIsHandRaised] = useState(false);
    const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
    const [startTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const isRinging = callingState === CallingState.RINGING || (callingState === CallingState.JOINING && participants.length <= 1);

    if (callingState !== CallingState.JOINED && !isRinging) {
        return (
            <div className="flex h-full items-center justify-center bg-[#202124] text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#8AB4F8]" />
                    <p className="text-lg font-medium">Joining meeting...</p>
                </div>
            </div>
        );
    }

    const toggleMute = async () => {
        await call?.microphone.toggle();
    };

    const toggleCamera = async () => {
        await call?.camera.toggle();
    };

    const toggleScreenShare = async () => {
        try {
            await call?.screenShare.toggle();
        } catch (err) {
            toast.error("Screen sharing failed");
        }
    };

    const toggleHandRaise = async () => {
        try {
            const newHandRaised = !isHandRaised;
            setIsHandRaised(newHandRaised);

            if (newHandRaised) {
                await call?.sendReaction({ type: "raised-hand" });
                toast.success("You raised your hand", { position: "bottom-left" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#202124]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-6 text-white bg-gradient-to-b from-black/40 to-transparent">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,67,53,0.5)]",
                            isRinging ? "bg-yellow-500 shadow-yellow-500/50" : "bg-[#EA4335]"
                        )} />
                        <span className="text-base font-semibold tracking-tight">
                            {isRinging ? "Calling members..." : "Meeting in progress"}
                        </span>
                    </div>
                    {!isRinging && <span className="text-[11px] text-white/50 font-medium ml-5">Meeting started at {startTime}</span>}
                </div>
                
                <div className="flex items-center gap-6">
                    {isRinging && (
                        <div className="flex items-center gap-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="relative">
                                <AlertCircle size={16} className="text-[#8AB4F8]" />
                                <div className="absolute inset-0 bg-[#8AB4F8]/20 rounded-full animate-ping" />
                            </div>
                            <span className="text-xs font-semibold text-white/90">Ringing {participants.length - 1 || 1} member</span>
                            <button 
                                onClick={onLeave}
                                className="h-8 w-8 rounded-full bg-[#EA4335] flex items-center justify-center hover:bg-[#D93025] transition-all hover:scale-110 shadow-lg"
                            >
                                <Phone size={14} className="text-white rotate-[135deg]" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                        <Users size={14} className="text-[#8AB4F8]" />
                        <span className="text-xs font-medium text-white/80">{participants.length} participants</span>
                    </div>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative overflow-hidden">
                <ResponsiveVideoLayout
                    participants={participants}
                    localParticipant={localParticipant}
                    isMicMuted={isMicMuted}
                    pinnedParticipantId={pinnedParticipantId}
                    onParticipantClick={(id) => setPinnedParticipantId(id === pinnedParticipantId ? null : id)}
                />
            </div>

            {/* Bottom Control Bar (Google Meet Style) */}
            <div className="h-24 bg-[#202124] flex items-center justify-between px-12 border-t border-white/5">
                {/* Left side: Time/Code */}
                <div className="hidden lg:flex items-center text-white/80 text-sm font-medium tracking-wide">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Community Meeting
                </div>

                {/* Center: Controls */}
                <div className="flex items-center gap-5">
                    {/* Mute */}
                    <button
                        onClick={toggleMute}
                        className={cn(
                            "group flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 shadow-xl",
                            isMicMuted ? "bg-[#EA4335] hover:bg-[#D93025] scale-110" : "bg-[#3C4043] hover:bg-[#4c4f52]"
                        )}
                        title={isMicMuted ? "Unmute" : "Mute"}
                    >
                        {isMicMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
                    </button>

                    {/* Camera */}
                    <button
                        onClick={toggleCamera}
                        className={cn(
                            "group flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 shadow-xl",
                            isCamMuted ? "bg-[#EA4335] hover:bg-[#D93025] scale-110" : "bg-[#3C4043] hover:bg-[#4c4f52]"
                        )}
                        title={isCamMuted ? "Turn on camera" : "Turn off camera"}
                    >
                        {isCamMuted ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
                    </button>

                    {/* Hand Raise */}
                    <button
                        onClick={toggleHandRaise}
                        className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 bg-[#3C4043] hover:bg-[#4c4f52] shadow-xl",
                            isHandRaised && "bg-white hover:bg-white text-black"
                        )}
                        title="Raise hand"
                    >
                        <Hand size={22} className={cn(isHandRaised ? "text-yellow-500" : "text-white")} />
                    </button>

                    {/* Screen Share */}
                    <button
                        onClick={toggleScreenShare}
                        className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 bg-[#3C4043] hover:bg-[#4c4f52] shadow-xl"
                        title="Present now"
                    >
                        <MonitorUp size={22} className="text-white" />
                    </button>

                    {/* End Call */}
                    <button
                        onClick={onLeave}
                        className="flex h-14 w-20 items-center justify-center rounded-[28px] bg-[#EA4335] hover:bg-[#D93025] transition-all duration-300 ml-4 shadow-[0_10px_25px_rgba(234,67,53,0.4)]"
                        title="Leave call"
                    >
                        <Phone size={26} className="text-white rotate-[135deg]" />
                    </button>
                </div>

                {/* Right side: Meeting Info */}
                <div className="hidden lg:flex items-center gap-8 text-white/70">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
                        <div className="p-2 rounded-lg group-hover:bg-white/5">
                            <AlertCircle size={22} />
                        </div>
                        <span className="text-[10px] font-bold">Info</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
                        <div className="p-2 rounded-lg group-hover:bg-white/5 relative">
                            <Users size={22} />
                            <div className="absolute top-1 right-1 w-2 h-2 bg-[#00A3FF] rounded-full border-2 border-[#202124]" />
                        </div>
                        <span className="text-[10px] font-bold">People</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
                        <div className="p-2 rounded-lg group-hover:bg-white/5">
                            <MessageSquare size={22} />
                        </div>
                        <span className="text-[10px] font-bold">Chat</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AccessForums() {
    const { socket, setActiveChatId } = useSocket();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeContact, setActiveContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [isScreenShared, setIsScreenShared] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Video Client
    useEffect(() => {
        let client: StreamVideoClient | null = null;
        const initVideo = async () => {
            try {
                const profile = await authApi.getProfile();
                const user = profile.user;
                if (!user) return;

                const tokenData = await videoApi.generateToken(user._id);
                client = new StreamVideoClient({
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
                toast.error("Video calling initialization failed. Please check your API credentials.");
            }
        };

        initVideo();

        return () => {
            if (client) client.disconnectUser();
        };
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        const initChat = async () => {
            try {
                setLoading(true);
                const profile = await authApi.getProfile();
                setCurrentUser(profile.user);
                const societyId = profile.user?.society || profile.user?.societies?.[0]?._id;

                if (!societyId) return;

                // Join Rooms
                if (socket) {
                    socket.emit("join-room", societyId);
                    socket.emit("join-private", profile.user._id);
                }

                // Fetch Members
                const response = await chatApi.getMembers(societyId);

                // Add Community Forum as a special contact
                const communityForum: Contact = {
                    id: "community",
                    name: "Community Forum",
                    lastMessage: "Welcome to society forum",
                    time: "",
                    avatar: "https://ui-avatars.com/api/?name=Community+Forum&background=5678E9&color=fff",
                    status: "online",
                    unread: 0,
                    typing: false
                };

                const fetchedContacts = response.members.map((m: any) => {
                    const firstName = m.firstname || "";
                    const lastName = m.lastname || "";
                    const fullName = `${firstName} ${lastName}`.trim();

                    return {
                        id: m._id,
                        name: fullName.endsWith('-') ? fullName.slice(0, -1).trim() : fullName,
                        lastMessage: "",
                        time: "",
                        avatar: m.profileImage || "",
                        unit: m.unit ? `(${m.wing}/${m.unit})` : "",
                        status: "offline",
                        unread: 0,
                        typing: false
                    };
                });

                const allContacts = [communityForum, ...fetchedContacts];
                setContacts(allContacts);
                setActiveContact(communityForum);
            } catch (error: any) {
                toast.error("Failed to load chat data");
            } finally {
                setLoading(false);
            }
        };

        initChat();
    }, [socket]);

    // Use refs for the socket listener to avoid re-binding on every state change
    const activeContactRef = useRef(activeContact);
    const currentUserRef = useRef(currentUser);

    useEffect(() => {
        activeContactRef.current = activeContact;
        if (activeContact) {
            setActiveChatId(activeContact.id);
        }
        return () => setActiveChatId(null);
    }, [activeContact, setActiveChatId]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // Fetch History when contact changes
    useEffect(() => {
        const fetchHistory = async () => {
            if (!activeContact || !currentUser) return;

            try {
                let response;
                if (activeContact.id === "community") {
                    const societyId = currentUser.society || currentUser.societies?.[0]?._id;
                    response = await chatApi.getHistory(societyId);
                } else {
                    response = await chatApi.getPersonalHistory(activeContact.id);
                }

                const formattedMessages = response.messages.map((m: any) => ({
                    id: m._id,
                    tempId: m.tempId,
                    sender: m.sender._id === currentUser._id ? "me" : "them",
                    text: m.message,
                    fileUrl: m.fileUrl,
                    fileType: m.fileType,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: m.fileUrl ? m.fileType : "text",
                    senderName: `${m.sender.firstname} ${m.sender.lastname}`,
                    senderAvatar: m.sender.profileImage
                }));

                setMessages(formattedMessages);
            } catch (error: any) {
                console.error("History fetch error:", error);
            }
        };

        fetchHistory();
    }, [activeContact, currentUser]);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: any) => {
            const currentContact = activeContactRef.current;
            const currentU = currentUserRef.current;

            const senderId = msg.sender._id;
            const isCommunity = !msg.receiver;
            const contactId = isCommunity ? "community" : senderId;

            // 1. Update Messages if it belongs to the active chat
            const isMsgForActiveChat = isCommunity
                ? currentContact?.id === "community"
                : (senderId === currentContact?.id || senderId === currentU?._id);

            if (isMsgForActiveChat) {
                setMessages(prev => {
                    // Check if message already exists (deduplication for optimistic updates)
                    const isDuplicate = prev.some(m =>
                        (m.id === msg._id) ||
                        (msg.tempId && m.tempId === msg.tempId) ||
                        (!msg.tempId && m.text === msg.message && m.sender === (msg.sender._id === currentU?._id ? "me" : "them"))
                    );

                    if (isDuplicate) {
                        // Update the optimistic message with the real ID from server if needed
                        return prev.map(m =>
                            (m.tempId && m.tempId === msg.tempId) ? { ...m, id: msg._id, tempId: undefined } : m
                        );
                    }

                    return [...prev, {
                        id: msg._id,
                        tempId: msg.tempId,
                        sender: msg.sender._id === currentU?._id ? "me" : "them",
                        text: msg.message,
                        fileUrl: msg.fileUrl,
                        fileType: msg.fileType,
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: msg.fileUrl ? msg.fileType : "text",
                        senderName: `${msg.sender.firstname} ${msg.sender.lastname}`,
                        senderAvatar: msg.sender.profileImage
                    }];
                });
            }

            // 2. Update Contacts list
            setContacts(prevContacts => {
                const contactIndex = prevContacts.findIndex(c => String(c.id) === String(contactId));
                if (contactIndex === -1) return prevContacts;

                const updatedContact = { ...prevContacts[contactIndex] };
                updatedContact.lastMessage = msg.message;
                updatedContact.time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                updatedContact.typing = false; // Reset typing when message arrives

                // Increment unread if message is not for active chat and not from me
                const isCurrentActive = String(contactId) === String(currentContact?.id);
                const isFromMe = String(senderId) === String(currentU?._id);

                if (!isCurrentActive && !isFromMe) {
                    updatedContact.unread = (updatedContact.unread || 0) + 1;

                    // Show Notification
                    toast(`${updatedContact.name}: ${msg.message}`, {
                        icon: '💬',
                        position: 'top-right',
                        duration: 4000,
                        style: {
                            borderRadius: '12px',
                            background: '#fff',
                            color: '#202224',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            borderLeft: '4px solid #5678E9',
                            padding: '16px',
                        }
                    });

                    // Sound
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                        audio.play().catch(() => { });
                    } catch (e) { }
                }

                const newContacts = [...prevContacts];
                newContacts.splice(contactIndex, 1);
                newContacts.unshift(updatedContact);
                return newContacts;
            });
        };

        const handleTypingStart = (data: any) => {
            const contactId = data.isCommunity ? "community" : data.senderId;
            setContacts(prev => prev.map(c => String(c.id) === String(contactId) ? { ...c, typing: true } : c));
        };

        const handleTypingStop = (data: any) => {
            const contactId = data.isCommunity ? "community" : data.senderId;
            setContacts(prev => prev.map(c => String(c.id) === String(contactId) ? { ...c, typing: false } : c));
        };

        socket.on("new-message", handleNewMessage);
        socket.on("user-typing", handleTypingStart);
        socket.on("user-stop-typing", handleTypingStop);

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("user-typing", handleTypingStart);
            socket.off("user-stop-typing", handleTypingStop);
        };
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !currentUser || !activeContact) return;

        const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
        const tempId = Date.now().toString();
        const messageData = {
            societyId,
            senderId: currentUser._id,
            message: newMessage,
            receiverId: activeContact.id === "community" ? null : activeContact.id,
            tempId
        };

        // 1. Optimistic Messages Update
        const optimisticMsg = {
            id: tempId,
            tempId: tempId,
            sender: "me",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "text",
            senderName: `${currentUser.firstname} ${currentUser.lastname}`,
            senderAvatar: currentUser.profileImage
        };
        setMessages(prev => [...prev, optimisticMsg]);

        socket.emit("chat-message", messageData);
        socket.emit("stop-typing", { societyId, senderId: currentUser._id, receiverId: activeContact.id === "community" ? null : activeContact.id });

        // 2. Optimistically update contacts list
        setContacts(prev => {
            const contactIndex = prev.findIndex(c => String(c.id) === String(activeContact.id));
            if (contactIndex === -1) return prev;

            const updatedContact = { ...prev[contactIndex] };
            updatedContact.lastMessage = newMessage;
            updatedContact.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            updatedContact.typing = false;

            const newContacts = [...prev];
            newContacts.splice(contactIndex, 1);
            newContacts.unshift(updatedContact);
            return newContacts;
        });

        setNewMessage("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (!socket || !currentUser || !activeContact) return;

        const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
        const data = {
            societyId,
            senderId: currentUser._id,
            receiverId: activeContact.id === "community" ? null : activeContact.id
        };

        socket.emit("typing", data);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop-typing", data);
        }, 3000);
    };

    const handleIconClick = (action: string) => {
        if (action === 'Attach File' || action === 'Camera') {
            fileInputRef.current?.click();
        } else {
            toast(`Action: ${action}`, { icon: '💬' });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socket || !currentUser || !activeContact) return;

        try {
            const loadingToast = toast.loading("Uploading file...");
            const res = await chatApi.upload(file);
            toast.dismiss(loadingToast);

            const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
            const tempId = Date.now().toString();
            const messageData = {
                societyId,
                senderId: currentUser._id,
                message: file.name,
                fileUrl: res.fileUrl,
                fileType: res.fileType,
                receiverId: activeContact.id === "community" ? null : activeContact.id,
                tempId
            };

            // Optimistic Update
            setMessages(prev => [...prev, {
                id: tempId,
                tempId,
                sender: "me",
                text: file.name,
                fileUrl: res.fileUrl,
                fileType: res.fileType,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: res.fileType,
                senderName: `${currentUser.firstname} ${currentUser.lastname}`,
                senderAvatar: currentUser.profileImage
            }]);

            socket.emit("chat-message", messageData);
            toast.success("File sent!");
        } catch (error: any) {
            toast.error("Failed to upload file");
        }
    };

    const startCall = async () => {
        if (!videoClient || !activeContact || !currentUser) {
            toast.error("Video client not ready or no contact selected");
            return;
        }

        try {
            let callId;
            if (activeContact.id === "community") {
                const societyId = currentUser.society || currentUser.societies?.[0]?._id;
                callId = `society_${societyId}`;
            } else {
                const ids = [currentUser._id, activeContact.id].sort();
                callId = `personal_${ids[0]}_${ids[1]}`;
            }

            const call = videoClient.call("default", callId);
            await call.join({ create: true });
            setActiveCall(call);
        } catch (error: any) {
            console.error("Failed to start call:", error);
            if (error.isWSFailure || error.message?.includes("WS connection")) {
                toast.error("Connection failed: Please check if STREAM_SECRET is correct in backend .env");
            } else {
                toast.error("Failed to start video call");
            }
        }
    };

    const startAudioCall = async () => {
        if (!videoClient || !activeContact || !currentUser) {
            toast.error("Call client not ready or no contact selected");
            return;
        }

        try {
            let callId;
            if (activeContact.id === "community") {
                const societyId = currentUser.society || currentUser.societies?.[0]?._id;
                callId = `society_audio_${societyId}`;
            } else {
                const ids = [currentUser._id, activeContact.id].sort();
                callId = `personal_audio_${ids[0]}_${ids[1]}`;
            }

            const call = videoClient.call("default", callId);
            // Join with camera disabled for audio call
            await call.getOrCreate({
                data: {
                    members: [
                        { user_id: currentUser._id },
                        ...(activeContact.id !== "community" ? [{ user_id: activeContact.id }] : [])
                    ]
                }
            });

            await call.join({ create: true });
            await call.camera.disable();
            setActiveCall(call);
        } catch (error: any) {
            console.error("Failed to start audio call:", error);
            toast.error("Failed to start audio call");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center rounded-2xl bg-white border border-[#F4F4F4]">
                <Loader2 className="h-10 w-10 animate-spin text-[#5678E9]" />
            </div>
        );
    }

    return (
        <StreamVideo client={videoClient || new StreamVideoClient({ apiKey: "placeholder", user: { id: "placeholder" }, token: "" })}>
            {activeCall ? (
                <StreamCall call={activeCall}>
                    <VideoCallUI onLeave={() => setActiveCall(null)} />
                </StreamCall>
            ) : (
                <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-[#F4F4F4]">
                    <ChatSidebar
                        contacts={contacts}
                        activeContactId={activeContact?.id || ""}
                        onContactSelect={(contact) => {
                            setActiveContact(contact);
                            setContacts(prev => prev.map(c =>
                                c.id === contact.id ? { ...c, unread: 0 } : c
                            ));
                        }}
                    />

                    {/* Chat Area */}
                    <div className="hidden flex-1 flex-col md:flex">
                        {activeContact ? (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-[#F4F4F4] px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={activeContact.avatar}
                                            name={activeContact.name}
                                        />
                                        <div>
                                            <h3 className="text-sm font-bold text-[#202224]">
                                                {activeContact.name} {activeContact.unit}
                                            </h3>
                                            <p className={cn("text-[10px]", activeContact.typing ? "text-[#5678E9] font-bold" : "text-[#A7A7A7]")}>
                                                {activeContact.typing ? "Typing..." : "Active Now"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={startCall} className="rounded-full p-2 text-[#202224] hover:bg-[#F6F8FB] transition-colors">
                                            <Video size={20} />
                                        </button>
                                        <button onClick={() => startAudioCall()} className="rounded-full p-2 text-[#202224] hover:bg-[#F6F8FB] transition-colors">
                                            <Phone size={18} />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                className="rounded-full p-2 text-[#202224] hover:bg-[#F6F8FB] transition-colors"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {isMenuOpen && (
                                                <div className="absolute right-0 top-10 z-10 w-32 rounded-xl bg-white p-1 shadow-lg border border-[#F4F4F4] animate-in fade-in zoom-in duration-200">
                                                    <button onClick={() => { setIsMenuOpen(false); toast.success("Copied"); }} className="w-full px-4 py-2 text-left text-sm font-medium text-[#202224] hover:bg-[#F6F8FB] rounded-lg transition-colors">Copy</button>
                                                    <button onClick={() => { setIsMenuOpen(false); toast.success("Forwarded"); }} className="w-full px-4 py-2 text-left text-sm font-medium text-[#202224] hover:bg-[#F6F8FB] rounded-lg transition-colors">Forward</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F9FBFF]/30">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col max-w-[70%]",
                                                msg.sender === "me" ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            {activeContact.id === "community" && msg.sender !== "me" && (
                                                <span className="mb-1 text-[10px] font-bold text-[#5678E9] px-2">{msg.senderName}</span>
                                            )}
                                            <div
                                                className={cn(
                                                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                    msg.sender === "me"
                                                        ? "bg-[#5678E9] text-white rounded-tr-none"
                                                        : "bg-[#F1F4FF] text-[#202224] rounded-tl-none"
                                                )}
                                            >
                                                {msg.type === "text" && <p>{msg.text}</p>}
                                                {msg.type === "image" && (
                                                    <div className="overflow-hidden rounded-xl border border-[#F1F1F1] bg-white p-1">
                                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <img src={msg.fileUrl} alt="Sent" className="max-h-60 w-full rounded-lg object-cover cursor-pointer" />
                                                        </a>
                                                    </div>
                                                )}
                                                {(msg.type === "pdf" || msg.type === "file") && (
                                                    <a
                                                        href={msg.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-xl p-2 hover:opacity-80 transition-opacity",
                                                            msg.sender === "me" ? "bg-white/10" : "bg-white"
                                                        )}
                                                    >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEECEC] text-[#E74C3C]">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden pr-4">
                                                            <p className={cn("truncate font-bold text-sm", msg.sender === "me" ? "text-white" : "text-[#202224]")}>{msg.text || "Document"}</p>
                                                            <p className={cn("text-[10px]", msg.sender === "me" ? "text-white/70" : "text-[#A7A7A7]")}>Click to view</p>
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                            <span className="mt-1 text-[10px] text-[#A7A7A7]">{msg.time}</span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Footer Input */}
                                <div className="border-t border-[#F4F4F4] p-4">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                        <button type="button" onClick={() => handleIconClick('Emoji')} className="text-[#202224] hover:text-[#5678E9] transition-colors">
                                            <Smile size={24} />
                                        </button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            placeholder="Type a message"
                                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#A7A7A7]"
                                        />
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            <button type="button" onClick={() => handleIconClick('Attach File')} className="text-[#202224] hover:text-[#5678E9] transition-colors">
                                                <Paperclip size={20} />
                                            </button>
                                            <button type="button" onClick={() => handleIconClick('Camera')} className="text-[#202224] hover:text-[#5678E9] transition-colors">
                                                <Camera size={20} />
                                            </button>
                                            <button
                                                type="submit"
                                                className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                                                    newMessage.trim() ? "bg-[#5678E9] text-white shadow-lg" : "bg-[#F1F4FF] text-[#5678E9]"
                                                )}
                                            >
                                                {newMessage.trim() ? <Send size={18} /> : <Mic size={20} />}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-gray-400">
                                Select a contact to start chatting
                            </div>
                        )}
                    </div>

                    {/* Mobile Back Button */}
                    <div className="md:hidden absolute top-4 left-4 z-20">
                        <button className="p-2 rounded-full bg-white shadow-md">
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                </div>
            )}
        </StreamVideo>
    );
}