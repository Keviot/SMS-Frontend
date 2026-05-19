import { useState } from "react";
import { Search, Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "../../../lib/cn";
import Avatar from "../../../components/Avatar";

export interface Contact {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatar: string;
    status: string;
    unread: number;
    typing: boolean;
    delivered?: boolean;
    unit?: string;
    lastMessageStatus?: "sending" | "sent" | "delivered" | "read";
}

interface ChatSidebarProps {
    contacts: Contact[];
    activeContactId: string;
    onContactSelect: (contact: Contact) => void;
    title?: string;
    className?: string;
}

export default function ChatSidebar({ contacts, activeContactId, onContactSelect, title = "Chat", className }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={cn("flex-col border-r border-[#F4F4F4] bg-white shrink-0", className)}>
            <div className="p-6">
                <h2 className="mb-4 text-xl font-bold text-[#202224]">{title}</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7A7A7]" size={18} />
                    <input
                        type="text"
                        placeholder="Search Here"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl bg-[#F6F8FB] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#5678E9]/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredContacts.map((contact) => (
                    <button
                        key={contact.id}
                        onClick={() => onContactSelect(contact)}
                        className={cn(
                            "flex w-full items-center gap-3 px-6 py-4 transition-all hover:bg-[#F9FAFB]",
                            activeContactId === contact.id && "bg-[#F1F4FF] border-r-4 border-[#5678E9]"
                        )}
                    >
                        <div className="relative shrink-0">
                            <Avatar
                                src={contact.avatar}
                                name={contact.name}
                            />
                            {contact.status === "online" && (
                                <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#5678E9]" />
                            )}
                        </div>
                        <div className="flex-grow flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0 text-left">
                                <span className="text-sm font-bold text-[#202224] truncate block">{contact.name}</span>
                                <p className={cn(
                                    "truncate text-xs mt-1",
                                    contact.typing ? "text-[#5678E9] font-medium" : "text-[#A7A7A7]"
                                )}>
                                    {contact.typing ? "Typing..." : contact.lastMessage}
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-end shrink-0 ml-3 gap-1">
                                <span className="text-[10px] text-[#A7A7A7]">{contact.time}</span>
                                {contact.unread > 0 ? (
                                    <span className="flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-[#5678E9] text-[10px] font-bold text-white shrink-0">
                                        {contact.unread}
                                    </span>
                                ) : (
                                    contact.lastMessageStatus && (
                                        <span className="shrink-0">
                                            {contact.lastMessageStatus === "sending" && <Check size={14} className="text-[#A7A7A7]" />}
                                            {contact.lastMessageStatus === "sent" && <CheckCheck size={14} className="text-[#A7A7A7]" />}
                                            {contact.lastMessageStatus === "delivered" && <CheckCheck size={14} className="text-[#A7A7A7]" />}
                                            {contact.lastMessageStatus === "read" && <CheckCheck size={14} className="text-[#5678E9]" />}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
