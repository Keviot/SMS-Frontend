import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, Video, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID || "0");
const SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

// --- ZEGO CLOUD UI INTEGRATION ---
const IncomingCallNotification = ({ callData, onAccept, onReject }: { callData: any, onAccept: () => void, onReject: (isTimeout: boolean) => void }) => {
    useEffect(() => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.loop = true;
        audio.play().catch(e => console.log("Audio play blocked", e));

        const timeout = setTimeout(() => {
            onReject(true);
        }, 30000);

        return () => {
            audio.pause();
            audio.currentTime = 0;
            clearTimeout(timeout);
        };
    }, [onReject]);

    if (!callData) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-20 px-4 pointer-events-none">
            <div className="w-full max-w-sm bg-[#1a1b1e]/90 backdrop-blur-2xl rounded-[32px] p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 animate-in slide-in-from-top-10 duration-500 pointer-events-auto">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5678E9]/20 p-1">
                        <Avatar src={callData.callerImage} name={callData.callerName || "User"} className="w-full h-full rounded-full" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#5678E9] p-2 rounded-full shadow-lg animate-bounce">
                        {callData.type === 'video' ? <Video size={16} className="text-white" /> : <Phone size={16} className="text-white" />}
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{callData.isCommunity ? "Community Group Call" : (callData.callerName || "Incoming Call")}</h3>
                    <p className="text-white/60 text-sm font-medium animate-pulse">{callData.isCommunity ? `Started by ${callData.callerName}` : `Incoming ${callData.type} call...`}</p>
                </div>
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={() => onReject(false)}
                        className="flex-1 h-14 rounded-2xl bg-[#EA4335] flex items-center justify-center gap-2 text-white font-bold hover:bg-[#D93025] transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        <Phone size={20} className="rotate-[135deg]" />
                        {callData.isCommunity ? "Ignore" : "Reject"}
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 h-14 rounded-2xl bg-[#34A853] flex items-center justify-center gap-2 text-white font-bold hover:bg-[#2D9249] transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        {callData.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                        {callData.isCommunity ? "Join" : "Accept"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ZegoCallUI = ({ roomId, user, isCommunity, isVideo, onLeave }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !user || !roomId) return;
        let zp: any;
        const initCall = async () => {
            const currentUserId = String(user._id).trim();
            const userName = `${user.firstname} ${user.lastname}`.trim();
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(APP_ID, SERVER_SECRET, roomId, currentUserId, userName);
            zp = ZegoUIKitPrebuilt.create(kitToken);
            zp.joinRoom({
                container: containerRef.current,
                scenario: { mode: isCommunity ? ZegoUIKitPrebuilt.GroupCall : ZegoUIKitPrebuilt.OneONoneCall },
                turnOnCameraWhenJoining: isVideo,
                showPreJoinView: false,
                onLeaveRoom: () => { onLeave(); }
            });
        };
        if (APP_ID && SERVER_SECRET) initCall();
        return () => { if (zp) zp.destroy(); };
    }, [roomId, user, isCommunity, isVideo]);

    return (
        <div className="fixed inset-0 z-[500] bg-[#1a1b1e]">
            <button onClick={onLeave} className="absolute top-6 left-[60px] z-[600] bg-black/50 p-3 rounded-full text-white hover:bg-black/70 border border-white/10 backdrop-blur-md">
                <ChevronLeft size={24} />
            </button>
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};

export default function GlobalCallHandler() {
    const { socket } = useSocket();
    const { user: currentUser } = useAuth();

    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [incomingCallData, setIncomingCallData] = useState<any>(null);
    const [callIsVideo, setCallIsVideo] = useState(true);
    const [isCommunityCall, setIsCommunityCall] = useState(false);

    // Outgoing caller request from anywhere
    useEffect(() => {
        const handleStartGlobalCall = (e: any) => {
            setCallIsVideo(e.detail.type === 'video');
            setIsCommunityCall(e.detail.isCommunity);
            setActiveRoomId(e.detail.callId);
        };
        window.addEventListener('start-global-call', handleStartGlobalCall);
        return () => window.removeEventListener('start-global-call', handleStartGlobalCall);
    }, []);

    useEffect(() => {
        if (!socket || !currentUser) return;

        const handleIncoming = (data: any) => {
            const currentUserId = String(currentUser?._id).trim();
            if (data.from !== currentUserId) setIncomingCallData(data);
        };

        const handleRejected = (data: any) => {
            setActiveRoomId((prev: any) => {
                if (prev === data.callId) {
                    toast.error("Call was rejected");
                    return null;
                }
                return prev;
            });
        };

        const handleEnded = (data: any) => {
            setIncomingCallData((prev: any) => {
                if (prev?.callId === data.callId) return null;
                return prev;
            });
            setActiveRoomId((prev: any) => {
                if (prev === data.callId && !data.isCommunity) {
                    toast("Call ended", { icon: "ℹ️" });
                    return null;
                }
                return prev;
            });
        };

        socket.on("call:incoming", handleIncoming);
        socket.on("call:community-incoming", handleIncoming);
        socket.on("call:rejected", handleRejected);
        socket.on("call:ended", handleEnded);

        return () => {
            socket.off("call:incoming", handleIncoming);
            socket.off("call:community-incoming", handleIncoming);
            socket.off("call:rejected", handleRejected);
            socket.off("call:ended", handleEnded);
        };
    }, [socket, currentUser]);

    const handleAcceptCall = useCallback(() => {
        if (incomingCallData) {
            setCallIsVideo(incomingCallData.type === 'video');
            setIsCommunityCall(incomingCallData.isCommunity);
            setActiveRoomId(incomingCallData.callId);
            setIncomingCallData(null);
        }
    }, [incomingCallData]);

    const handleRejectCall = useCallback(() => {
        setIncomingCallData((prev: any) => {
            if (prev && !prev.isCommunity && socket && currentUser) {
                socket.emit("call:rejected", {
                    to: prev.from,
                    from: currentUser?._id,
                    callId: prev.callId
                });
            }
            return null;
        });
    }, [socket, currentUser]);

    return (
        <>
            {incomingCallData && (
                <IncomingCallNotification
                    callData={incomingCallData}
                    onAccept={handleAcceptCall}
                    onReject={handleRejectCall}
                />
            )}
            {activeRoomId && (
                <ZegoCallUI
                    roomId={activeRoomId}
                    user={currentUser}
                    isCommunity={isCommunityCall}
                    isVideo={callIsVideo}
                    onLeave={() => {
                        if (!isCommunityCall && activeRoomId) {
                            const toUserId = incomingCallData ? incomingCallData.from : activeRoomId.replace("personal_", "").replace(String(currentUser?._id), "").replace("_", "");
                            socket?.emit("call:ended", {
                                to: toUserId,
                                callId: activeRoomId,
                                isCommunity: false
                            });
                        }
                        setActiveRoomId(null);
                    }}
                />
            )}
        </>
    );
}
