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
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import ChatSidebar, { type Contact } from "../components/ChatSidebar";
import Avatar from "../../../components/Avatar";
import { chatApi, authApi } from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";

export default function AccessForums() {
    const { socket } = useSocket();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeContact, setActiveContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    sender: m.sender._id === currentUser._id ? "me" : "them",
                    text: m.message,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: "text",
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
            const senderId = msg.sender._id;
            const isCommunity = !msg.receiver;
            const contactId = isCommunity ? "community" : senderId;

            // 1. Update Messages if it belongs to the active chat
            const isMsgForActiveChat = isCommunity 
                ? activeContact?.id === "community" 
                : (senderId === activeContact?.id || senderId === currentUser?._id);

            if (isMsgForActiveChat) {
                setMessages(prev => [...prev, {
                    id: msg._id,
                    sender: msg.sender._id === currentUser?._id ? "me" : "them",
                    text: msg.message,
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: "text",
                    senderName: `${msg.sender.firstname} ${msg.sender.lastname}`,
                    senderAvatar: msg.sender.profileImage
                }]);
            }

            // 2. Update Contacts list (move to top, update last message, increment unread)
            setContacts(prevContacts => {
                const contactIndex = prevContacts.findIndex(c => String(c.id) === String(contactId));
                if (contactIndex === -1) return prevContacts;

                const updatedContact = { ...prevContacts[contactIndex] };
                updatedContact.lastMessage = msg.message;
                updatedContact.time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Increment unread if message is not for active chat and not from me
                const isCurrentActive = String(contactId) === String(activeContact?.id);
                const isFromMe = String(senderId) === String(currentUser?._id);

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

                    // Optional: Play sound
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                        audio.play().catch(() => {}); // Ignore if browser blocks autoplay
                    } catch (e) {}
                }

                const newContacts = [...prevContacts];
                newContacts.splice(contactIndex, 1);
                newContacts.unshift(updatedContact);
                return newContacts;
            });
        };

        socket.on("new-message", handleNewMessage);
        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [socket, activeContact, currentUser]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !currentUser || !activeContact) return;

        const societyId = currentUser.society || currentUser.societies?.[0]?._id;
        
        const messageData = {
            societyId,
            senderId: currentUser._id,
            message: newMessage,
            receiverId: activeContact.id === "community" ? null : activeContact.id
        };

        socket.emit("chat-message", messageData);

        // Optimistically update contacts list to move current to top and update last message
        setContacts(prev => {
            const contactIndex = prev.findIndex(c => String(c.id) === String(activeContact.id));
            if (contactIndex === -1) return prev;

            const updatedContact = { ...prev[contactIndex] };
            updatedContact.lastMessage = newMessage;
            updatedContact.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newContacts = [...prev];
            newContacts.splice(contactIndex, 1);
            newContacts.unshift(updatedContact);
            return newContacts;
        });

        setNewMessage("");
    };

    const handleIconClick = (action: string) => {
        toast(`Action: ${action}`, { icon: '💬' });
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center rounded-2xl bg-white border border-[#F4F4F4]">
                <Loader2 className="h-10 w-10 animate-spin text-[#5678E9]" />
            </div>
        );
    }

    return (
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
                                    <p className="text-[10px] text-[#A7A7A7]">Active Now</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleIconClick('Video Call')} className="rounded-full p-2 text-[#202224] hover:bg-[#F6F8FB] transition-colors">
                                    <Video size={20} />
                                </button>
                                <button onClick={() => handleIconClick('Voice Call')} className="rounded-full p-2 text-[#202224] hover:bg-[#F6F8FB] transition-colors">
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
                                                <img src={msg.image} alt="Sent" className="max-h-60 w-full rounded-lg object-cover" />
                                            </div>
                                        )}
                                        {msg.type === "file" && (
                                            <div className={cn(
                                                "flex items-center gap-3 rounded-xl p-2",
                                                msg.sender === "me" ? "bg-white/10" : "bg-white"
                                            )}>
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEECEC] text-[#E74C3C]">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 overflow-hidden pr-4">
                                                    <p className={cn("truncate font-bold text-sm", msg.sender === "me" ? "text-white" : "text-[#202224]")}>{msg.fileName}</p>
                                                    <p className={cn("text-[10px]", msg.sender === "me" ? "text-white/70" : "text-[#A7A7A7]")}>{msg.fileSize}</p>
                                                </div>
                                            </div>
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
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message"
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#A7A7A7]"
                                />
                                <div className="flex items-center gap-3">
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
    );
}
