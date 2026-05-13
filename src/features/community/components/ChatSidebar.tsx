import { Search, CheckCheck } from "lucide-react";
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
}

interface ChatSidebarProps {
    contacts: Contact[];
    activeContactId: string;
    onContactSelect: (contact: Contact) => void;
    title?: string;
}

export default function ChatSidebar({ contacts, activeContactId, onContactSelect, title = "Chat" }: ChatSidebarProps) {
    return (
        <div className="flex w-full flex-col border-r border-[#F4F4F4] md:w-80 bg-white">
            <div className="p-6">
                <h2 className="mb-4 text-xl font-bold text-[#202224]">{title}</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A7A7A7]" size={18} />
                    <input
                        type="text"
                        placeholder="Search Here"
                        className="w-full rounded-xl bg-[#F6F8FB] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#5678E9]/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {contacts.map((contact) => (
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
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[#202224] truncate">{contact.name}</span>
                                <span className="text-[10px] text-[#A7A7A7] shrink-0 ml-2">{contact.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className={cn(
                                    "truncate text-xs",
                                    contact.typing ? "text-[#5678E9] font-medium" : "text-[#A7A7A7]"
                                )}>
                                    {contact.typing ? "Typing..." : contact.lastMessage}
                                </p>
                                {contact.unread > 0 && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#5678E9] text-[10px] font-bold text-white shrink-0 ml-2">
                                        {contact.unread}
                                    </span>
                                )}
                                {contact.delivered && !contact.unread && (
                                    <CheckCheck size={14} className="text-[#5678E9] shrink-0 ml-2" />
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
