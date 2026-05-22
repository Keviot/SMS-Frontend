import { useState, useEffect, useRef, useCallback } from "react";
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
    Clock,
    Play,
    Pause
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import ChatSidebar, { type Contact } from "../components/ChatSidebar";
import Avatar from "../../../components/Avatar";
import { chatApi, authApi, videoApi } from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
import EmojiPicker from 'emoji-picker-react';

import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID || "0");
const SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

const VoicePlayer = ({ src, isMe }: { src: string; isMe: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number | null>(null);

    const updateProgress = useCallback(() => {
        if (audioRef.current && !audioRef.current.paused) {
            setCurrentTime(audioRef.current.currentTime);
            rafRef.current = requestAnimationFrame(updateProgress);
        }
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
            } else {
                audioRef.current.play().catch(err => console.error("Playback error", err));
                rafRef.current = requestAnimationFrame(updateProgress);
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => {
            setIsPlaying(false);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setCurrentTime(0); // Reset to start
        };
        if (audio) {
            audio.addEventListener("ended", handleEnded);
        }
        return () => {
            if (audio) {
                audio.removeEventListener("ended", handleEnded);
            }
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            if (audioRef.current.duration === Infinity) {
                audioRef.current.currentTime = 1e101;
                audioRef.current.ontimeupdate = () => {
                    audioRef.current!.ontimeupdate = null;
                    setDuration(audioRef.current!.duration);
                    audioRef.current!.currentTime = 0;
                };
            }
        }
    };

    const formatTime = (time: number | undefined) => {
        if (time === undefined || isNaN(time) || !isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const progressColor = isMe ? "white" : "#5678E9";
    const trackColor = isMe ? "rgba(255, 255, 255, 0.2)" : "#E5E7EB";

    return (
        <div className={cn("flex items-center gap-3 min-w-[200px] sm:min-w-[240px] py-1 select-none", isMe ? "text-white" : "text-[#202224]")}>
            <audio
                ref={audioRef}
                src={src}
                onLoadedMetadata={onLoadedMetadata}
                preload="metadata"
            />
            <button
                type="button"
                onClick={togglePlay}
                className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full transition-all hover:scale-110 active:scale-90 shrink-0 shadow-sm",
                    isMe ? "bg-white text-[#5678E9]" : "bg-[#5678E9] text-white"
                )}
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex-1 flex items-center gap-3">
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    step="0.01"
                    onChange={handleScrub}
                    className={cn(
                        "flex-1 h-1 appearance-none cursor-pointer rounded-full outline-none",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.15)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white",
                        "[&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.15)]",
                        isMe 
                            ? "[&::-webkit-slider-thumb]:bg-[#5678E9] [&::-moz-range-thumb]:bg-[#5678E9]" 
                            : "[&::-webkit-slider-thumb]:bg-[#5678E9] [&::-moz-range-thumb]:bg-[#5678E9]"
                    )}
                    style={{
                        background: `linear-gradient(to right, ${progressColor} ${progressPercent}%, ${trackColor} ${progressPercent}%)`
                    }}
                />
                <span className="text-[11px] font-bold opacity-80 whitespace-nowrap min-w-[28px] text-right">
                    {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                </span>
            </div>
        </div>
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


    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);



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
                        type: msg.fileUrl ? msg.fileType || "text" : "text",
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
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.${extension}`, { type: mimeType });

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
                    type: msg.fileUrl ? msg.fileType || "text" : "text",
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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            toast.error("Camera/Microphone permissions required for video calls");
            return;
        }
        if (!activeContact || !currentUser || !socket) {
            toast.error("No contact selected");
            return;
        }

        const isCommunity = activeContact.id === "community";
        let callId = '';
        const currentUserId = String(currentUser._id).trim();
        const contactId = String(activeContact.id).trim();

        if (isCommunity) {
            const societyId = String(currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id || "").trim();
            callId = 'society_' + societyId;
        } else {
            const ids = [currentUserId, contactId].sort();
            callId = 'personal_' + ids[0] + '_' + ids[1];
        }

        // Notify via socket
        const callerName = `${currentUser.firstname} ${currentUser.lastname}`;
        const callData: any = {
            callId,
            to: contactId,
            from: currentUserId,
            type: 'video',
            isCommunity,
            callerName,
            callerImage: currentUser.profileImage
        };

        if (!isCommunity) {
            socket.emit('call:incoming', callData);
        } else {
            callData.societyId = isCommunity ? (currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id) : '';
            socket.emit('call:community-incoming', callData);
        }

        window.dispatchEvent(new CustomEvent('start-global-call', { detail: { callId, isCommunity, type: 'video' } }));
    };

    const startAudioCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            toast.error("Microphone permissions required for voice calls");
            return;
        }
        if (!activeContact || !currentUser || !socket) {
            toast.error("No contact selected");
            return;
        }

        const isCommunity = activeContact.id === "community";
        let callId = '';
        const currentUserId = String(currentUser._id).trim();
        const contactId = String(activeContact.id).trim();

        if (isCommunity) {
            const societyId = String(currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id || "").trim();
            callId = 'society_audio_' + societyId;
        } else {
            const ids = [currentUserId, contactId].sort();
            callId = 'personal_audio_' + ids[0] + '_' + ids[1];
        }

        // Notify via socket
        const callerName = `${currentUser.firstname} ${currentUser.lastname}`;
        const callData: any = {
            callId,
            to: contactId,
            from: currentUserId,
            type: 'audio',
            isCommunity,
            callerName,
            callerImage: currentUser.profileImage
        };

        if (!isCommunity) {
            socket.emit('call:incoming', callData);
        } else {
            callData.societyId = isCommunity ? (currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id) : '';
            socket.emit('call:community-incoming', callData);
        }

        window.dispatchEvent(new CustomEvent('start-global-call', { detail: { callId, isCommunity, type: 'audio' } }));
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



                                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                                        <button
                                            onClick={startCall}

                                            className="rounded-full flex justify-center items-center shrink-0 h-9 w-9 sm:h-10 sm:w-10 text-[#202224] bg-[#F6F8FB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            title="Video call"
                                        >
                                            <img src="/chaticons/video.svg" alt="Video call" className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <button
                                            onClick={startAudioCall}

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
                                                    {(() => {
                                                        const isVoiceMessage =
                                                            msg.type === "audio" ||
                                                            msg.fileType === "audio" ||
                                                            (msg.text && msg.text.toLowerCase().trim() === "voice message") ||
                                                            (msg.fileUrl && (msg.fileUrl.includes(".webm") || msg.fileUrl.includes(".mp3") || msg.fileUrl.includes(".wav") || msg.fileUrl.includes(".ogg") || msg.fileUrl.includes(".m4a")));

                                                        if (isVoiceMessage) {
                                                            return (
                                                                <VoicePlayer src={msg.fileUrl} isMe={msg.sender === "me"} />
                                                            );
                                                        }

                                                        if (msg.type === "image") {
                                                            return (
                                                                <div className="overflow-hidden rounded-xl border border-[#F1F1F1] bg-white p-1">
                                                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                        <img src={msg.fileUrl} alt="Sent" className="max-h-60 w-full rounded-lg object-cover cursor-pointer" />
                                                                    </a>
                                                                </div>
                                                            );
                                                        }

                                                        if (msg.type === "pdf" || msg.type === "file") {
                                                            return (
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
                                                            );
                                                        }

                                                        // Default to text
                                                        return msg.text ? <p>{msg.text}</p> : null;
                                                    })()}
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

    return (
        <>
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

            {chatUI}
        </>
    );
}





