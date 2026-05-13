import { useState } from "react";
import {
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
    CheckCheck,
    ChevronLeft
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";
import ChatSidebar, { type Contact } from "../components/ChatSidebar";

// Mock data for contacts
const contacts: Contact[] = [
    {
        id: "1",
        name: "Michael John",
        lastMessage: "Hi, John! how are you doing?",
        time: "10:27",
        avatar: "https://ui-avatars.com/api/?name=Michael+John&background=E5E7EB&color=202224",
        status: "offline",
        unread: 0,
        typing: false
    },
    {
        id: "2",
        name: "Elizabeth Sarah",
        lastMessage: "Thank you for your order!",
        time: "9:20",
        avatar: "https://ui-avatars.com/api/?name=Elizabeth+Sarah&background=E5E7EB&color=202224",
        status: "online",
        unread: 0,
        typing: false,
        delivered: true
    },
    {
        id: "3",
        name: "Jenny Wilson",
        lastMessage: "Hello, Jenny",
        time: "7:00",
        avatar: "https://ui-avatars.com/api/?name=Jenny+Wilson&background=E5E7EB&color=202224",
        status: "offline",
        unread: 7,
        typing: false
    },
    {
        id: "4",
        name: "Arlene McCoy",
        lastMessage: "Typing...",
        time: "9:20",
        avatar: "https://ui-avatars.com/api/?name=Arlene+McCoy&background=E5E7EB&color=202224",
        unit: "(A/1001)",
        status: "online",
        unread: 0,
        typing: true
    },
    {
        id: "5",
        name: "Esther Howard",
        lastMessage: "Hello, Esther",
        time: "10:27",
        avatar: "https://ui-avatars.com/api/?name=Esther+Howard&background=E5E7EB&color=202224",
        status: "offline",
        unread: 0,
        typing: false,
        delivered: true
    },
    {
        id: "6",
        name: "Cody Fisher",
        lastMessage: "Thank you for your order!",
        time: "7:00",
        avatar: "https://ui-avatars.com/api/?name=Cody+Fisher&background=E5E7EB&color=202224",
        status: "offline",
        unread: 0,
        typing: false,
        delivered: true
    }
];

// Mock data for messages
const initialMessages = [
    {
        id: "1",
        sender: "them",
        text: "Hi there, How are you?",
        time: "9:20",
        type: "text"
    },
    {
        id: "2",
        sender: "them",
        text: "Waiting for your reply. As I have to go back soon. I have to travel long distance.",
        time: "9:22",
        type: "text"
    },
    {
        id: "3",
        sender: "me",
        text: "Hi, I am coming there in few minutes. Please wait!! I am in taxi right now.",
        time: "9:30",
        type: "text"
    },
    {
        id: "4",
        sender: "them",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
        time: "9:45",
        type: "image"
    },
    {
        id: "5",
        sender: "me",
        fileName: "PDF",
        fileSize: "2.3 MB",
        time: "10:00",
        type: "file"
    }
];

export default function AccessForums() {
    const [activeContact, setActiveContact] = useState<Contact>(contacts[3]);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now().toString(),
            sender: "me",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "text"
        };

        setMessages([...messages, msg]);
        setNewMessage("");
        toast.success("Message sent");
    };

    const handleIconClick = (action: string) => {
        toast(`Action: ${action}`, {
            icon: '💬',
        });
    };

    return (
        <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-[#F4F4F4]">
            <ChatSidebar
                contacts={contacts}
                activeContactId={activeContact.id}
                onContactSelect={setActiveContact}
            />

            {/* Chat Area */}
            <div className="hidden flex-1 flex-col md:flex">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F4F4F4] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={activeContact.avatar}
                            alt={activeContact.name}
                            className="h-10 w-10 rounded-full object-cover border border-[#F1F1F1]"
                        />
                        <div>
                            <h3 className="text-sm font-bold text-[#202224]">
                                {activeContact.name} {activeContact.unit}
                            </h3>
                            <p className="text-[10px] text-[#A7A7A7]">9:00 Pm</p>
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
            </div>

            {/* Mobile Back Button (only visible on small screens if needed) */}
            <div className="md:hidden absolute top-4 left-4 z-20">
                <button className="p-2 rounded-full bg-white shadow-md">
                    <ChevronLeft size={24} />
                </button>
            </div>
        </div>
    );
}
