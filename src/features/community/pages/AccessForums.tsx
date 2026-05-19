import { useState, useEffect, useRef } from "react";
import {
    X,
    Search,
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
    MessageSquare,
    Check,
    CheckCheck,
    Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import ChatSidebar, { type Contact } from "../components/ChatSidebar";
import Avatar from "../../../components/Avatar";
import { chatApi, authApi, videoApi } from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
import EmojiPicker from 'emoji-picker-react';
import {
    StreamVideoClient,
    StreamVideo,
    StreamCall,
    SpeakerLayout,
    CallControls,
    Call,
    useCallStateHooks,
    useCall,
    useCalls,
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

function VideoCallUI({ onLeave, onMinimize }: { onLeave: () => void, onMinimize: () => void }) {
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

    // Show loader only if we are truly in a transient state
    const isJoined = callingState === CallingState.JOINED;
    const isBusy = callingState === CallingState.JOINING || callingState === CallingState.MIGRATING;
    const isRinging = callingState === CallingState.RINGING || (callingState === CallingState.JOINING && participants.length <= 1);

    if (!isJoined && !isRinging && isBusy) {
        return (
            <div className="flex h-full items-center justify-center bg-[#202124] text-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="h-20 w-20 rounded-full border-4 border-t-[#00A3FF] border-white/10 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Video size={32} className="text-[#00A3FF]" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-2xl font-bold tracking-tight">Initializing Meeting</p>
                        <p className="text-white/40 text-sm font-medium">Securing connection to the community hub...</p>
                    </div>
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
                    <button
                        onClick={onMinimize}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/5"
                        title="Minimize to chat"
                    >
                        <ChevronLeft size={20} />
                    </button>
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

// Helper component for Incoming Call Notification
const IncomingCallNotification = ({ call, onAccept, onReject }: { call: Call, onAccept: () => void, onReject: () => void }) => {
    const [callingState, setCallingState] = useState(call.state.callingState);
    const [caller, setCaller] = useState<any>(null);

    useEffect(() => {
        const subscription = call.state.callingState$.subscribe((state) => {
            setCallingState(state);
        });
        return () => subscription.unsubscribe();
    }, [call]);

    useEffect(() => {
        setCaller(call.state.createdBy);

        // Play ringing sound (using a public URL for simplicity)
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.loop = true;
        audio.play().catch(e => console.log("Audio play blocked", e));

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [call]);

    if (callingState !== CallingState.RINGING) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-20 px-4 pointer-events-none">
            <div className="w-full max-w-sm bg-[#1a1b1e]/90 backdrop-blur-2xl rounded-[32px] p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 animate-in slide-in-from-top-10 duration-500 pointer-events-auto">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5678E9]/20 p-1">
                        <Avatar src={caller?.image} name={caller?.name || "User"} className="w-full h-full rounded-full" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#5678E9] p-2 rounded-full shadow-lg animate-bounce">
                        <Video size={16} className="text-white" />
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{caller?.name || "Incoming Call"}</h3>
                    <p className="text-white/60 text-sm font-medium animate-pulse">Incoming video call...</p>
                </div>

                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={onReject}
                        className="flex-1 h-14 rounded-2xl bg-[#EA4335] flex items-center justify-center gap-2 text-white font-bold hover:bg-[#D93025] transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        <Phone size={20} className="rotate-[135deg]" />
                        Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 h-14 rounded-2xl bg-[#34A853] flex items-center justify-center gap-2 text-white font-bold hover:bg-[#2D9249] transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        <Video size={20} />
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component to discover and manage incoming calls within the StreamVideo context
const CallDiscovery = ({ client, currentUser, activeCall, onAccept, onReject }: any) => {
    const calls = useCalls();
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    const [manualCalls, setManualCalls] = useState<Call[]>([]);

    // 1. Listen for new calls directly from the client (more reliable than useCalls alone)
    useEffect(() => {
        if (!client || !currentUser) return;

        const handleCallEvent = async (event: any) => {
            const callId = event.call_id || (event.call && event.call.id);
            const callType = event.call_type || (event.call && event.call.type) || 'default';

            if (callId) {
                console.log("[CallDiscovery] Aggressive discovery for call:", callId);
                try {
                    const { calls: queriedCalls } = await client.queryCalls({
                        filter_conditions: { id: { $eq: callId } },
                        watch: true
                    });

                    if (queriedCalls.length > 0) {
                        setManualCalls(prev => {
                            if (prev.find(c => c.id === callId)) return prev;
                            return [...prev, queriedCalls[0]];
                        });
                    }
                } catch (err) {
                    console.error("[CallDiscovery] Query failed:", err);
                }
            }
        };

        const unsubscribeCreated = client.on('call.created', handleCallEvent);
        const unsubscribeRing = client.on('call.ring', handleCallEvent);
        const unsubscribeNotification = client.on('notification.message_new', handleCallEvent);

        return () => {
            unsubscribeCreated();
            unsubscribeRing();
            unsubscribeNotification();
        };
    }, [client, currentUser]);

    // 2. Monitor both useCalls() and manualCalls to find the one ringing for us
    useEffect(() => {
        const currentUserId = String(currentUser?._id || "").trim();
        const allAvailableCalls = [...calls, ...manualCalls];

        const ringingCall = allAvailableCalls.find(c => {
            const callingState = c.state.callingState;
            const createdById = String(c.state.createdBy?.id || "").trim();

            const isRinging = callingState === CallingState.RINGING;
            const isNotFromMe = createdById !== currentUserId;

            // Check membership
            const myMemberEntry = c.state.members.find(m =>
                String(m.user?.id || m.user_id || "").trim() === currentUserId
            );

            if (isRinging && isNotFromMe && !!myMemberEntry) {
                return true;
            }
            return false;
        });

        if (ringingCall) {
            setIncomingCall(ringingCall);
        } else if (incomingCall && incomingCall.state.callingState !== CallingState.RINGING) {
            setIncomingCall(null);
        }
    }, [calls, manualCalls, currentUser, incomingCall]);

    // If we are already in a call, don't show the incoming call popup
    if (!incomingCall || activeCall) return null;

    return (
        <IncomingCallNotification
            call={incomingCall}
            onAccept={() => {
                console.log("[CallDiscovery] Accepting call:", incomingCall.id);
                onAccept(incomingCall);
            }}
            onReject={() => {
                console.log("[CallDiscovery] Rejecting call:", incomingCall.id);
                onReject(incomingCall);
            }}
        />
    );
};

export default function AccessForums() {
    const { socket, setActiveChatId } = useSocket();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [societyMembers, setSocietyMembers] = useState<any[]>([]);
    const [activeContact, setActiveContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [isCallMinimized, setIsCallMinimized] = useState(false);
    const [isScreenShared, setIsScreenShared] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showCamera, setShowCamera] = useState(false);

    // States for message selection (Copy / Forward)
    const [isCopyMode, setIsCopyMode] = useState(false);
    const [isForwardMode, setIsForwardMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [forwardSearchQuery, setForwardSearchQuery] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<any>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleAcceptCall = async (call: Call) => {
        try {
            console.log("[AccessForums] Refreshing call state before accept:", call.id);
            // Force a refresh from server to ensure membership is synced
            await call.get();

            const myId = String(currentUser?._id || "").trim();
            const memberIds = call.state.members.map(m => String(m.user?.id || m.user_id || "").trim());
            console.log("[AccessForums] Refreshed members:", memberIds);
            console.log("[AccessForums] My ID:", myId);

            if (!memberIds.includes(myId)) {
                console.warn("[AccessForums] My ID not found in members list! Attempting to join anyway...");
            }

            // Accept and then explicitly JOIN to establish the media connection
            await call.accept();
            await call.join({ create: true });

            setActiveCall(call);
            setIsCallMinimized(false);
        } catch (error: any) {
            console.error("Failed to accept call:", error);
            toast.error(`Failed to accept call: ${error.message || "Unknown error"}`);
        }
    };

    const handleRejectCall = async (call: Call) => {
        try {
            console.log("[AccessForums] Rejecting call:", call.id);
            await call.reject();
        } catch (error) {
            console.error("Failed to reject call:", error);
        }
    };
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Video Client (Stable initialization)
    const videoClientRef = useRef<StreamVideoClient | null>(null);
    const videoClientIdRef = useRef<string | null>(null);

    useEffect(() => {
        const initVideo = async () => {
            try {
                const profile = await authApi.getProfile();
                const user = profile.user;
                if (!user) return;

                // Prevent duplicate initialization
                const currentUserIdStr = String(user._id);
                if (videoClientRef.current) {
                    if (videoClientIdRef.current === currentUserIdStr) {
                        return; // Already initialized for this user
                    }
                    await videoClientRef.current.disconnectUser();
                }

                const userName = `${user.firstname} ${user.lastname}`.trim();
                const tokenData = await videoApi.generateToken(user._id, userName, user.profileImage);

                if (!tokenData.token) {
                    throw new Error("Server returned an empty Stream token.");
                }

                const client = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: String(user._id),
                        name: userName,
                        image: user.profileImage,
                    },
                    token: tokenData.token,
                });

                videoClientRef.current = client;
                videoClientIdRef.current = currentUserIdStr;
                setVideoClient(client);
            } catch (error) {
                console.error("Video initialization failed:", error);
            }
        };

        initVideo();

        return () => {
            if (videoClientRef.current) {
                videoClientRef.current.disconnectUser().catch(console.error);
                videoClientRef.current = null;
                videoClientIdRef.current = null;
                setVideoClient(null);
            }
        };
    }, []);

    // Initial Data Fetch (Runs exactly once on mount)
    useEffect(() => {
        const initChat = async () => {
            try {
                setLoading(true);
                const profile = await authApi.getProfile();
                setCurrentUser(profile.user);
                const societyId = profile.user?.society || profile.user?.societies?.[0]?._id;

                if (!societyId) return;

                // Fetch Members
                const response = await chatApi.getMembers(societyId);
                setSocietyMembers(response.members);

                // Add Community Forum as a special contact
                let communityLastMsg = "Welcome to society forum";
                let communityTime = "";
                let communityStatus: "sending" | "sent" | "delivered" | "read" | undefined = undefined;

                try {
                    const commHistory = await chatApi.getHistory(societyId);
                    if (commHistory && commHistory.messages && commHistory.messages.length > 0) {
                        const lastMsg = commHistory.messages[commHistory.messages.length - 1];
                        communityLastMsg = lastMsg.message || (lastMsg.fileUrl ? "File" : "Voice Message");
                        communityTime = new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        if (lastMsg.sender._id === profile.user._id) {
                            communityStatus = lastMsg.status || "sent";
                        }
                    }
                } catch (e) {
                    console.error("Failed to load community last message", e);
                }

                const communityForum: Contact = {
                    id: "community",
                    name: "Community Forum",
                    lastMessage: communityLastMsg,
                    time: communityTime,
                    avatar: "https://ui-avatars.com/api/?name=Community+Forum&background=5678E9&color=fff",
                    status: "online",
                    unread: 0,
                    typing: false,
                    lastMessageStatus: communityStatus
                };

                const fetchedContacts = await Promise.all(response.members.map(async (m: any) => {
                    const firstName = m.firstname || "";
                    const lastName = m.lastname || "";
                    const fullName = `${firstName} ${lastName}`.trim();

                    let lastMessage = "";
                    let time = "";
                    let lastMessageStatus: "sending" | "sent" | "delivered" | "read" | undefined = undefined;

                    try {
                        const history = await chatApi.getPersonalHistory(m._id);
                        if (history && history.messages && history.messages.length > 0) {
                            const lastMsg = history.messages[history.messages.length - 1];
                            lastMessage = lastMsg.message || (lastMsg.fileUrl ? "File" : "Voice Message");
                            time = new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            if (lastMsg.sender._id === profile.user._id) {
                                lastMessageStatus = lastMsg.status || "sent";
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to load last message for ${fullName}`, e);
                    }

                    return {
                        id: m._id,
                        name: fullName.endsWith('-') ? fullName.slice(0, -1).trim() : fullName,
                        lastMessage,
                        time,
                        avatar: m.profileImage || "",
                        unit: m.unit ? `(${m.wing}/${m.unit})` : "",
                        status: m.status || "offline",
                        unread: 0,
                        typing: false,
                        lastMessageStatus
                    };
                }));

                const allContacts = [communityForum, ...fetchedContacts];
                setContacts(allContacts);
                
                // Determine which contact to auto-select (persistent across refreshes)
                const isDesktop = window.matchMedia("(min-width: 768px)").matches;
                const savedContactId = localStorage.getItem("active_chat_contact_id");
                
                if (savedContactId) {
                    const savedContact = allContacts.find(c => String(c.id) === String(savedContactId));
                    if (savedContact) {
                        setActiveContact(savedContact);
                    } else if (isDesktop) {
                        setActiveContact(communityForum);
                    }
                } else if (isDesktop) {
                    setActiveContact(communityForum);
                }
            } catch (error: any) {
                toast.error("Failed to load chat data");
            } finally {
                setLoading(false);
            }
        };

        initChat();
    }, []);

    // Handle room joining when socket or currentUser updates
    useEffect(() => {
        if (socket && currentUser) {
            const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
            if (societyId) {
                socket.emit("join-room", societyId);
                socket.emit("join-private", currentUser._id);
            }
        }
    }, [socket, currentUser]);

    // Use refs for the socket listener to avoid re-binding on every state change
    const activeContactRef = useRef(activeContact);
    const currentUserRef = useRef(currentUser);
    const isFirstRender = useRef(true);

    useEffect(() => {
        activeContactRef.current = activeContact;
        if (activeContact) {
            setActiveChatId(activeContact.id);
            localStorage.setItem("active_chat_contact_id", activeContact.id);
        } else if (!isFirstRender.current) {
            setActiveChatId(null);
            localStorage.removeItem("active_chat_contact_id");
        }
        isFirstRender.current = false;
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
                    senderAvatar: m.sender.profileImage,
                    status: m.sender._id === currentUser._id ? m.status : undefined
                }));

                setMessages(formattedMessages);

                // Dynamically mark all incoming unread messages as read when User opens the chat screen
                if (socket && activeContact.id !== "community") {
                    const unreadIds = response.messages
                        .filter((m: any) => m.sender._id !== currentUser._id && m.status !== "read")
                        .map((m: any) => m._id);

                    if (unreadIds.length > 0) {
                        socket.emit("mark-read", {
                            messageIds: unreadIds,
                            senderId: activeContact.id,
                            receiverId: currentUser._id
                        });
                    }
                }
            } catch (error: any) {
                console.error("History fetch error:", error);
            }
        };

        fetchHistory();
    }, [activeContact, currentUser, socket]);

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
                        return prev.map(m =>
                            (m.tempId && m.tempId === msg.tempId) ? { ...m, id: msg._id, tempId: undefined, status: msg.status || "sent" } : m
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
                        senderAvatar: msg.sender.profileImage,
                        status: msg.sender._id === currentU?._id ? (msg.status || "sent") : undefined
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
                    updatedContact.lastMessageStatus = undefined;

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
                } else if (isFromMe) {
                    updatedContact.lastMessageStatus = msg.status || "sent";
                } else {
                    updatedContact.lastMessageStatus = undefined;
                    // Immediately mark as read since it is active chat
                    if (socket && !isCommunity) {
                        socket.emit("mark-read", {
                            messageIds: [msg._id],
                            senderId: senderId,
                            receiverId: currentU?._id
                        });
                    }
                }

                const newContacts = [...prevContacts];
                newContacts.splice(contactIndex, 1);
                newContacts.unshift(updatedContact);
                return newContacts;
            });
        };

        const handleMessagesRead = (data: { messageIds: string[]; receiverId: string }) => {
            setMessages(prev => prev.map(m => data.messageIds.includes(m.id) ? { ...m, status: "read" } : m));
            setContacts(prev => prev.map(c => String(c.id) === String(data.receiverId) ? { ...c, lastMessageStatus: "read" } : c));
        };

        const handleTypingStart = (data: any) => {
            const contactId = data.isCommunity ? "community" : data.senderId;
            setContacts(prev => prev.map(c => String(c.id) === String(contactId) ? { ...c, typing: true } : c));
        };

        const handleTypingStop = (data: any) => {
            const contactId = data.isCommunity ? "community" : data.senderId;
            setContacts(prev => prev.map(c => String(c.id) === String(contactId) ? { ...c, typing: false } : c));
        };

        const handleStatusChange = (data: { userId: string; status: "online" | "offline" }) => {
            setContacts(prev => prev.map(c => String(c.id) === String(data.userId) ? { ...c, status: data.status } : c));
            if (activeContactRef.current && String(activeContactRef.current.id) === String(data.userId)) {
                setActiveContact(prev => prev ? { ...prev, status: data.status } : null);
            }
        };

        socket.on("new-message", handleNewMessage);
        socket.on("messages-read", handleMessagesRead);
        socket.on("user-typing", handleTypingStart);
        socket.on("user-stop-typing", handleTypingStop);
        socket.on("user-status-change", handleStatusChange);

        socket.on("call:incoming", async (data: any) => {
            console.log("[Socket] Incoming call signal received:", data.callId);
            if (videoClientRef.current) {
                try {
                    await videoClientRef.current.queryCalls({
                        filter_conditions: { id: { $eq: data.callId } },
                        watch: true
                    });
                    console.log("[Socket] Call queried and watched successfully after signal:", data.callId);
                } catch (err) {
                    console.error("[Socket] Failed to query call after signal:", err);
                }
            }
        });

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("messages-read", handleMessagesRead);
            socket.off("user-typing", handleTypingStart);
            socket.off("user-stop-typing", handleTypingStop);
            socket.off("user-status-change", handleStatusChange);
            socket.off("call:incoming");
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
            senderAvatar: currentUser.profileImage,
            status: "sending"
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

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `Voice_Message_${Date.now()}.webm`, { type: 'audio/webm' });

                stream.getTracks().forEach(track => track.stop());

                if (!socket || !currentUser || !activeContact) return;
                try {
                    const loadingToast = toast.loading("Sending voice message...");
                    const res = await chatApi.upload(audioFile);
                    toast.dismiss(loadingToast);

                    const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
                    const tempId = Date.now().toString();
                    const messageData = {
                        societyId,
                        senderId: currentUser._id,
                        message: "Voice Message",
                        fileUrl: res.fileUrl,
                        fileType: "audio",
                        receiverId: activeContact.id === "community" ? null : activeContact.id,
                        tempId
                    };

                    setMessages(prev => [...prev, {
                        id: tempId,
                        tempId,
                        sender: "me",
                        text: "Voice Message",
                        fileUrl: res.fileUrl,
                        fileType: "audio",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: "audio",
                        senderName: `${currentUser.firstname} ${currentUser.lastname}`,
                        senderAvatar: currentUser.profileImage,
                        status: "sending"
                    }]);

                    socket.emit("chat-message", messageData);
                    toast.success("Voice message sent!");
                } catch (error: any) {
                    toast.error("Failed to send voice message");
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Microphone access denied or error:", error);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
        }
    };

    const openCameraModal = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Camera not accessible");
            setShowCamera(false);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], `Photo_${Date.now()}.jpg`, { type: "image/jpeg" });
                    uploadFile(file);
                    closeCamera();
                }
            }, "image/jpeg");
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const handleIconClick = (action: string) => {
        if (action === 'Attach File') {
            fileInputRef.current?.click();
        } else if (action === 'Camera') {
            // Check if mobile. If mobile, use native picker. Otherwise open modal.
            if (/Mobi|Android/i.test(navigator.userAgent)) {
                cameraInputRef.current?.click();
            } else {
                openCameraModal();
            }
        } else {
            toast(`Action: ${action}`, { icon: '💬' });
        }
    };

    const uploadFile = async (file: File) => {
        if (!socket || !currentUser || !activeContact) return;

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
        }
        e.target.value = '';
    };

    const handleCopySelected = () => {
        const textToCopy = messages
            .filter(m => selectedMessageIds.includes(String(m.id)) && m.text)
            .map(m => m.text)
            .join("\n");
            
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            toast.success("Messages copied to clipboard!");
        } else {
            toast.error("No text messages selected to copy");
        }
        
        setIsCopyMode(false);
        setSelectedMessageIds([]);
    };

    const handleForwardSelected = async (targetContact: Contact) => {
        if (!currentUser || !socket) return;
        const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
        const selectedMsgs = messages.filter(m => selectedMessageIds.includes(m.id));
        
        for (const msg of selectedMsgs) {
            const tempId = `forward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const messageData = {
                societyId,
                senderId: currentUser._id,
                message: msg.text || (msg.fileUrl ? "File" : ""),
                fileUrl: msg.fileUrl || null,
                fileType: msg.fileType || null,
                receiverId: targetContact.id === "community" ? null : targetContact.id,
                tempId
            };
            
            // Emit socket message
            socket.emit("chat-message", messageData);
            
            // If forwarding to current active chat, add to messages list locally
            if (activeContact && activeContact.id === targetContact.id) {
                setMessages(prev => [...prev, {
                    id: tempId,
                    tempId,
                    sender: "me",
                    text: msg.text,
                    fileUrl: msg.fileUrl,
                    fileType: msg.fileType,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: msg.fileUrl ? msg.fileType : "text",
                    senderName: `${currentUser.firstname} ${currentUser.lastname}`,
                    senderAvatar: currentUser.profileImage
                }]);
            }
        }
        
        toast.success(`Messages forwarded to ${targetContact.name}`);
        setIsForwardModalOpen(false);
        setIsForwardMode(false);
        setSelectedMessageIds([]);
    };

    const startCall = async () => {
        if (!videoClient || !activeContact || !currentUser || !socket) {
            toast.error("Video client not ready or no contact selected");
            return;
        }

        try {
            const isCommunity = activeContact.id === "community";
            let callId: string;
            const currentUserId = String(currentUser._id).trim();
            const contactId = String(activeContact.id).trim();

            const members: { user_id: string; role?: string }[] = [
                { user_id: currentUserId, role: 'admin' }
            ];

            if (isCommunity) {
                const societyId = String(currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id || "").trim();
                callId = `society_${societyId}`;

                // Ring all society members for community calls
                societyMembers.forEach(member => {
                    const memberId = String(member._id).trim();
                    if (memberId !== currentUserId) {
                        members.push({ user_id: memberId, role: 'user' });
                    }
                });
            } else {
                const ids = [currentUserId, contactId].sort();
                callId = `personal_${ids[0]}_${ids[1]}`;
                members.push({ user_id: contactId, role: 'user' });
            }

            const call = videoClient.call("default", callId);
            setActiveCall(call);

            console.log("[AccessForums] Starting call:", callId, "with members count:", members.length);

            // Notify via socket for faster signaling
            if (!isCommunity) {
                socket.emit('call:incoming', {
                    to: contactId,
                    from: currentUserId,
                    callId,
                    type: 'video'
                });
            } else {
                const societyId = String(currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id || "").trim();
                socket.emit('call:community-incoming', {
                    societyId,
                    from: currentUserId,
                    callId,
                    type: 'video'
                });
            }

            // Use getOrCreate with ring:true
            await call.getOrCreate({
                ring: true, // Always ring for both personal and community
                data: { members },
            });

            if (!isCommunity) {
                await call.updateCallMembers({ update_members: members });
            }

            await call.join({ create: true });
        } catch (error: any) {
            console.error("Failed to start call:", error);
            setActiveCall(null);
            if (error.message?.includes("no users to ring")) {
                toast.error("The other user isn't online on Stream yet. They need to open the app first.");
            } else if (error.isWSFailure || error.message?.includes("WS connection")) {
                toast.error("Connection failed: Please check STREAM_SECRET in backend .env");
            } else {
                toast.error(`Failed to start video call: ${error.message || "Unknown error"}`);
            }
        }
    };

    const startAudioCall = async () => {
        if (!videoClient || !activeContact || !currentUser || !socket) {
            toast.error("Call client not ready or no contact selected");
            return;
        }

        try {
            const isCommunity = activeContact.id === "community";
            let callId: string;
            const currentUserId = String(currentUser._id).trim();
            const contactId = String(activeContact.id).trim();

            const members: { user_id: string; role?: string }[] = [
                { user_id: currentUserId, role: 'admin' }
            ];

            if (isCommunity) {
                const societyId = String(currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id || "").trim();
                callId = `society_audio_${societyId}`;

                // Ring all society members
                societyMembers.forEach(member => {
                    const memberId = String(member._id).trim();
                    if (memberId !== currentUserId) {
                        members.push({ user_id: memberId, role: 'user' });
                    }
                });
            } else {
                const ids = [currentUserId, contactId].sort();
                callId = `personal_audio_${ids[0]}_${ids[1]}`;
                members.push({ user_id: contactId, role: 'admin' });
            }

            const call = videoClient.call("default", callId);
            setActiveCall(call);

            console.log("[AccessForums] Starting audio call:", callId, "with members count:", members.length);

            // Notify via socket
            if (!isCommunity) {
                socket.emit('call:incoming', {
                    to: contactId,
                    from: currentUserId,
                    callId,
                    type: 'audio'
                });
            } else {
                const societyId = String(currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id || "").trim();
                socket.emit('call:community-incoming', {
                    societyId,
                    from: currentUserId,
                    callId,
                    type: 'audio'
                });
            }

            await call.getOrCreate({
                ring: true,
                data: { members },
            });

            if (!isCommunity) {
                await call.updateCallMembers({ update_members: members });
            }

            await call.join({ create: true });
            await call.camera.disable();
        } catch (error: any) {
            console.error("Failed to start audio call:", error);
            setActiveCall(null);
            if (error.message?.includes("no users to ring")) {
                toast.error("The other user isn't online on Stream yet. They need to open the app first.");
            } else {
                toast.error(`Failed to start audio call: ${error.message || "Unknown error"}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center rounded-2xl bg-white border border-[#F4F4F4]">
                <Loader2 className="h-10 w-10 animate-spin text-[#5678E9]" />
            </div>
        );
    }

    // ─── Chat-only UI (no video client yet, or video not in use) ────────────
    const chatUI = (
        <div className="flex h-[calc(100vh-160px)] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-[#F4F4F4] relative">
            {/* Sidebar wrapper - hide entirely on mobile if a contact is active */}
            <div className={cn("h-full shrink-0 w-full md:w-80", activeContact ? "hidden md:block" : "block")}>
                <ChatSidebar
                    contacts={contacts}
                    activeContactId={activeContact?.id || ""}
                    className="h-full w-full"
                    onContactSelect={(contact) => {
                        setActiveContact(contact);
                        setContacts(prev => prev.map(c =>
                            c.id === contact.id ? { ...c, unread: 0 } : c
                        ));
                    }}
                />
            </div>

            {/* Chat Area wrapper - hide entirely on mobile if NO contact is active */}
            <div className={cn("h-full flex-1 w-full", activeContact ? "block" : "hidden md:block")}>
                <div className="relative flex h-full w-full flex-col bg-white">
                {activeContact ? (
                    <>
                        {/* Header */}
                        {isCopyMode || isForwardMode ? (
                            <div className="flex items-center justify-between border-b border-[#F4F4F4] px-4 md:px-6 py-3 md:py-4 bg-[#F1F4FF] z-10 animate-in fade-in duration-200">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCopyMode(false);
                                            setIsForwardMode(false);
                                            setSelectedMessageIds([]);
                                        }}
                                        className="text-[#202224] hover:bg-gray-200 p-2 rounded-full cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                    <span className="text-sm font-bold text-[#5678E9]">
                                        {selectedMessageIds.length} message{selectedMessageIds.length !== 1 && 's'} selected
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setIsCopyMode(false);
                                            setIsForwardMode(false);
                                            setSelectedMessageIds([]);
                                        }}
                                        className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    {isCopyMode ? (
                                        <button
                                            onClick={handleCopySelected}
                                            disabled={selectedMessageIds.length === 0}
                                            className="px-4 py-1.5 rounded-lg bg-[#5678E9] text-white text-xs font-bold hover:bg-[#4361CD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Copy Selected
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsForwardModalOpen(true)}
                                            disabled={selectedMessageIds.length === 0}
                                            className="px-4 py-1.5 rounded-lg bg-[#5678E9] text-white text-xs font-bold hover:bg-[#4361CD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Forward Selected
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between border-b border-[#F4F4F4] px-4 md:px-6 py-3 md:py-4 bg-white z-10">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveContact(null);
                                        }}
                                        className="md:hidden text-[#202224] hover:bg-gray-100 p-2 -ml-2 shrink-0 rounded-full cursor-pointer"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="shrink-0">
                                        <Avatar
                                            src={activeContact.avatar}
                                            name={activeContact.name}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm md:text-md font-bold text-[#202224] truncate">
                                            {activeContact.name} {activeContact.unit}
                                        </h3>
                                        <p className={cn("text-xs md:text-sm truncate", activeContact.typing ? "text-[#5678E9] font-bold" : "text-[#A7A7A7]")}>
                                            {activeContact.typing 
                                                ? "Typing..." 
                                                : activeContact.id === "community" 
                                                    ? "Active Now" 
                                                    : activeContact.status === "online" 
                                                        ? "Active Now" 
                                                        : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                {/* Minimised call pill (show when call is active but minimised) */}
                                {activeCall && isCallMinimized && (
                                    <div
                                        onClick={() => setIsCallMinimized(false)}
                                        className="flex items-center gap-3 px-4 py-2 bg-[#1a1b1e] rounded-2xl border border-white/10 shadow-2xl cursor-pointer hover:scale-105 transition-all animate-in slide-in-from-top-2"
                                    >
                                        <div className="relative">
                                            <div className="h-2 w-2 rounded-full bg-[#34A853] animate-pulse" />
                                        </div>
                                        <span className="text-xs font-semibold text-white/90">Call in progress · Tap to return</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                activeCall.leave().catch(console.warn);
                                                setActiveCall(null);
                                                setIsCallMinimized(false);
                                            }}
                                            className="h-7 w-7 rounded-full bg-[#EA4335] flex items-center justify-center hover:bg-[#D93025] transition-all shadow-lg"
                                        >
                                            <Phone size={12} className="text-white rotate-[135deg]" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                                    <button
                                        onClick={startCall}
                                        disabled={!videoClient}
                                        className="rounded-full flex justify-center items-center shrink-0 h-9 w-9 sm:h-10 sm:w-10 text-[#202224] bg-[#F6F8FB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Video call"
                                    >
                                        <img src="/chaticons/video.svg" alt="Video call" className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button
                                        onClick={startAudioCall}
                                        disabled={!videoClient}
                                        className="rounded-full flex justify-center items-center shrink-0 h-9 w-9 sm:h-10 sm:w-10 text-[#202224] bg-[#F6F8FB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Voice call"
                                    >
                                        <img src="/chaticons/call.svg" alt="Voice call" className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="rounded-full flex justify-center items-center shrink-0 h-9 w-9 sm:h-10 sm:w-10 text-[#202224] bg-[#F6F8FB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <img src="/chaticons/more.svg" alt="More" className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        
                                        {isMenuOpen && (
                                            <>
                                                {/* Backdrop to close menu */}
                                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#F4F4F4] py-1 z-50 overflow-hidden">
                                                    <button 
                                                        className="w-full text-left px-4 py-2 hover:bg-[#F6F8FB] text-[#202224] font-medium text-sm transition-colors"
                                                        onClick={() => {
                                                            setIsMenuOpen(false);
                                                            setIsCopyMode(true);
                                                            setIsForwardMode(false);
                                                            setSelectedMessageIds([]);
                                                        }}
                                                    >
                                                        Copy
                                                    </button>
                                                    <button 
                                                        className="w-full text-left px-4 py-2 hover:bg-[#F6F8FB] text-[#202224] font-medium text-sm transition-colors"
                                                        onClick={() => {
                                                            setIsMenuOpen(false);
                                                            setIsForwardMode(true);
                                                            setIsCopyMode(false);
                                                            setSelectedMessageIds([]);
                                                        }}
                                                    >
                                                        Forward
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F9FBFF]/30">
                            {messages.map((msg) => {
                                const isSelected = selectedMessageIds.includes(String(msg.id));
                                const isSelecting = isCopyMode || isForwardMode;
                                return (
                                    <div
                                        key={msg.id}
                                        onClick={() => {
                                            if (isSelecting && msg.id) {
                                                const msgIdStr = String(msg.id);
                                                setSelectedMessageIds(prev => 
                                                    prev.includes(msgIdStr) 
                                                        ? prev.filter(id => id !== msgIdStr) 
                                                        : [...prev, msgIdStr]
                                                );
                                            }
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-4 p-1.5 rounded-2xl transition-all",
                                            isSelecting && "cursor-pointer hover:bg-gray-50/50",
                                            isSelected && "bg-[#F1F4FF]/70 shadow-sm",
                                            msg.sender === "me" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {isSelecting && msg.sender !== "me" && (
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                readOnly
                                                className="h-4.5 w-4.5 rounded border-gray-300 text-[#5678E9] focus:ring-[#5678E9] shrink-0 pointer-events-none"
                                            />
                                        )}
                                        <div
                                            className={cn(
                                                "flex flex-col max-w-[70%]",
                                                isSelecting && "pointer-events-none",
                                                msg.sender === "me" ? "items-end" : "items-start"
                                            )}
                                        >
                                            {activeContact.id === "community" && msg.sender !== "me" && (
                                                <span className="mb-1 text-[10px] font-bold text-[#5678E9] px-2">{msg.senderName}</span>
                                            )}
                                            <div
                                                className={cn(
                                                    "rounded-xl px-4 py-2.5 text-sm shadow-sm",
                                                    msg.sender === "me"
                                                        ? "bg-[#5678E9] text-white "
                                                        : "bg-[#ECEEF3] text-[#202224]"
                                                )}
                                            >
                                                {msg.type === "text" && <p>{msg.text}</p>}
                                                {msg.type === "audio" && (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <p className="text-xs font-bold opacity-80">Voice Message</p>
                                                        <audio controls src={msg.fileUrl} className="h-10 w-full" />
                                                    </div>
                                                )}
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
                                            <div className={cn("mt-1 flex items-center gap-1", msg.sender === "me" ? "justify-end" : "justify-start")}>
                                                <span className="text-xs text-[#A7A7A7]">{msg.time}</span>
                                                {msg.sender === "me" && (
                                                    <span className="flex items-center">
                                                        {msg.status === "sending" && <Clock size={12} className="text-[#A7A7A7]" />}
                                                        {msg.status === "sent" && <Check size={14} className="text-[#A7A7A7]" />}
                                                        {msg.status === "delivered" && <CheckCheck size={14} className="text-[#A7A7A7]" />}
                                                        {msg.status === "read" && <CheckCheck size={14} className="text-[#34B7F1]" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isSelecting && msg.sender === "me" && (
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                readOnly
                                                className="h-4.5 w-4.5 rounded border-gray-300 text-[#5678E9] focus:ring-[#5678E9] shrink-0"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer Input */}
                        <div className="bg-white p-2 sm:p-3 md:p-4 z-10 border-t border-[#F4F4F4]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                                {/* The Pill Container */}
                                <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-[#F6F8FB] rounded-full px-3 sm:px-4 py-2 sm:py-3">
                                    <div className="relative shrink-0">
                                        <button type="button" onClick={() => setShowEmojiPicker(prev => !prev)} className="text-[#4E4E4E] hover:text-[#5678E9] transition-colors flex items-center justify-center">
                                            <Smile size={22} className="sm:w-6 sm:h-6" />
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 -left-2 sm:left-0 z-50 shadow-2xl rounded-lg w-[280px] sm:w-[320px] md:w-[350px]">
                                                <EmojiPicker 
                                                    width="100%"
                                                    onEmojiClick={(emojiData) => {
                                                        setNewMessage(prev => prev + emojiData.emoji);
                                                        setShowEmojiPicker(false);
                                                    }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {isRecording ? (
                                        <div className="flex-1 bg-transparent text-xs sm:text-sm text-[#E74C3C] font-bold flex items-center animate-pulse">
                                            Recording: {formatTime(recordingTime)}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            placeholder="Type a message"
                                            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-[#202224] placeholder:text-[#4E4E4E] min-w-0"
                                        />
                                    )}
                                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            capture="environment"
                                            ref={cameraInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <button type="button" onClick={() => handleIconClick('Attach File')} className="text-[#4E4E4E] hover:text-[#5678E9] transition-colors flex items-center justify-center">
                                            <img src="/chaticons/attech.svg" alt="Attach File" className="h-4 w-4 sm:h-5 sm:w-5 opacity-70" />
                                        </button>
                                        <button type="button" onClick={() => handleIconClick('Camera')} className="text-[#4E4E4E] hover:text-[#5678E9] transition-colors flex items-center justify-center">
                                            <img src="/chaticons/camera.svg" alt="Camera" className="h-4 w-4 sm:h-5 sm:w-5 opacity-70" />
                                        </button>
                                    </div>
                                </div>
                                {/* Mic / Send Button outside */}
                                {newMessage.trim() ? (
                                    <button
                                        type="submit"
                                        className="flex h-10 w-10 sm:h-[46px] sm:w-[46px] shrink-0 items-center justify-center rounded-full bg-[#5678E9] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <Send size={18} className="sm:w-5 sm:h-5" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={cn(
                                            "flex h-10 w-10 sm:h-[46px] sm:w-[46px] shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform active:scale-95",
                                            isRecording ? "bg-[#E74C3C] animate-pulse" : "bg-[#5678E9] hover:scale-105"
                                        )}
                                    >
                                        {isRecording ? <div className="h-3 w-3 sm:h-4 sm:w-4 bg-white rounded-sm" /> : <img src="/chaticons/microphone.svg" alt="Mic" className="h-4 w-4 sm:h-5 sm:w-5 brightness-0 invert" />}
                                    </button>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center text-gray-400">
                        Select a contact to start chatting
                    </div>
                )}
                </div>
            </div>
        </div>
    );

    // ─── If video client is not ready yet, render chat-only (no Stream context) ─
    if (!videoClient) {
        return chatUI;
    }

    // ─── Full render with Stream Video context ────────────────────────────────
    return (
        <StreamVideo client={videoClient}>
            {/* ── Incoming call discovery (must be inside StreamVideo) ── */}
            <CallDiscovery
                client={videoClient}
                currentUser={currentUser}
                activeCall={activeCall}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
            />

            {/* ── Full-screen video call (Google Meet style) ── */}
            {activeCall && !isCallMinimized && (
                <div className="fixed inset-0 z-[500]">
                    <StreamCall call={activeCall}>
                        <VideoCallUI
                            onMinimize={() => setIsCallMinimized(true)}
                            onLeave={() => {
                                activeCall.leave().catch(console.warn);
                                setActiveCall(null);
                                setIsCallMinimized(false);
                            }}
                        />
                    </StreamCall>
                </div>
            )}

            {/* ── Camera Modal for Desktop ── */}
            {showCamera && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-w-2xl w-full mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg text-[#202224]">Take a Photo</h3>
                            <button onClick={closeCamera} className="text-[#A7A7A7] hover:text-[#E74C3C] transition-colors bg-[#F6F8FB] p-2 rounded-full">
                                <VideoOff size={20} />
                            </button>
                        </div>
                        <div className="bg-black aspect-video relative flex justify-center items-center">
                            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-contain" />
                        </div>
                        <div className="p-4 flex justify-center bg-gray-50 border-t">
                            <button
                                onClick={capturePhoto}
                                className="h-16 w-16 rounded-full bg-white border-4 border-[#5678E9] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                            >
                                <div className="h-12 w-12 rounded-full bg-[#5678E9]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Forward Modal ── */}
            {isForwardModalOpen && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#F4F4F4] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[#F4F4F4]">
                            <h3 className="font-bold text-[#202224] text-lg">Forward message to</h3>
                            <button
                                onClick={() => setIsForwardModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Search */}
                        <div className="p-4 border-b border-[#F4F4F4]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7A7A7]" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search contact..."
                                    value={forwardSearchQuery}
                                    onChange={(e) => setForwardSearchQuery(e.target.value)}
                                    className="w-full rounded-xl bg-[#F6F8FB] py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#5678E9]/30 transition-all"
                                />
                            </div>
                        </div>
                        
                        {/* Contacts List */}
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {contacts
                                .filter(c => c.name.toLowerCase().includes(forwardSearchQuery.toLowerCase()))
                                .map(c => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-2 hover:bg-[#F9FAFB] rounded-xl transition-all"
                                    >
                                        <div className="flex items-center gap-3 font-bold text-[#202224]">
                                            <Avatar src={c.avatar} name={c.name} />
                                            <span className="text-sm font-bold text-[#202224]">{c.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleForwardSelected(c)}
                                            className="px-3 py-1.5 rounded-lg bg-[#5678E9] text-white text-xs font-bold hover:bg-[#4361CD] transition-colors"
                                        >
                                            Send
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Chat UI (always visible, call minimises over it) ── */}
            {chatUI}
        </StreamVideo>
    );
}