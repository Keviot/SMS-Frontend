// SMS-Frontend/src/features/paymentPortal/pages/EventInvoices.tsx
import { useState, useEffect } from "react";
import { Eye, Loader2 } from "lucide-react";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import { announcementApi, authApi, eventPaymentApi } from "../../../services/api";
import toast from "react-hot-toast";

interface EventInvoice {
    _id: string;
    title: string;
    date: string;
    time: string;
    amount: number;
    description: string;
    announcementType: string | string[];
}

interface EventPayment {
    _id: string;
    event: string | { _id: string };
    resident: string;
    amount: number;
    payment: string;
    society: string;
    status: string;
    createdAt: string;
}

export default function EventInvoices() {
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventInvoice | null>(null);
    const [events, setEvents] = useState<EventInvoice[]>([]);
    const [eventPayments, setEventPayments] = useState<EventPayment[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventInvoices = async () => {
            try {
                setLoading(true);

                // Fetch profile
                const profileData = await authApi.getProfile();
                if (profileData.user) {
                    setProfile(profileData.user);
                    const societyId = profileData.user.society?._id || profileData.user.society;

                    // Fetch announcements (events)
                    const announcementData = societyId
                        ? await announcementApi.getAll(societyId)
                        : { announcement: [] };

                    // Filter only events with amount > 0
                    const eventList = (announcementData.announcement || []).filter(
                        (a: any) => {
                            const isEvent = Array.isArray(a.announcementType)
                                ? a.announcementType[0] === "Event"
                                : a.announcementType === "Event";
                            return isEvent && a.amount > 0;
                        }
                    );

                    // Fetch event payments
                    const eventPaymentData = await eventPaymentApi.get();

                    setEvents(eventList);
                    setEventPayments(eventPaymentData.data || []);
                }
            } catch (error: any) {
                console.error("Error fetching event invoices:", error);
                toast.error(error.message || "Failed to load event invoices");
                setEvents([]);
                setEventPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEventInvoices();
    }, []);

    const handleViewInvoice = (event: EventInvoice) => {
        setSelectedEvent(event);
        setShowInvoiceModal(true);
    };

    const hasParticipated = (eventId: string) => {
        return eventPayments.some(
            (p) => {
                const pEventId = typeof p.event === 'string' ? p.event : p.event._id;
                return pEventId === eventId;
            }
        );
    };

    const getPaymentDate = (eventId: string) => {
        const payment = eventPayments.find(
            (p) => {
                const pEventId = typeof p.event === 'string' ? p.event : p.event._id;
                return pEventId === eventId;
            }
        );
        return payment?.createdAt;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    return (
        <div className="flex flex-col gap-[16px]">
            <div className="rounded-[15px] bg-white px-[20px] py-[22px]">
                <div className="flex min-h-[60px] items-center justify-between gap-[16px]">
                    <h1 className="text-[20px] font-semibold leading-[28px] text-[#202224]">
                        Event Invoices
                    </h1>
                </div>
            </div>

            <div className="rounded-[15px] border border-[#D9DCE5] bg-white px-[16px] py-[16px]">
                {loading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#5678E9]" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <p className="text-[14px] text-[#6F7786]">No event invoices found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[980px]">
                            <div className="grid h-[42px] grid-cols-[1fr_1.25fr_1.25fr_1.35fr_1.25fr_0.55fr] items-center rounded-t-[8px] bg-[#F1F4FF] px-[14px] text-[12px] font-semibold text-[#202224]">
                                <div>Invoice ID</div>
                                <div>Event Date</div>
                                <div>Payment Date</div>
                                <div>Event Name</div>
                                <div>Amount</div>
                                <div className="text-center">Action</div>
                            </div>

                            {events.map((event) => {
                                const paymentDate = getPaymentDate(event._id);

                                return (
                                    <div
                                        key={event._id}
                                        className="grid h-[68px] grid-cols-[1fr_1.25fr_1.25fr_1.35fr_1.25fr_0.55fr] items-center border-b border-[#E8ECEF] px-[14px] text-[12px] font-medium text-[#202224] last:border-b-0"
                                    >
                                        <div>{event._id.slice(-6).toUpperCase()}</div>
                                        <div>{formatDate(event.date)}</div>
                                        <div>{paymentDate ? formatDate(paymentDate) : "N/A"}</div>
                                        <div className="truncate pr-2">{event.title}</div>
                                        <div className="font-semibold text-[#39973D]">₹ {event.amount.toLocaleString()}</div>

                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleViewInvoice(event)}
                                                className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#F6F8FB] text-[#5678E9] hover:bg-[#5678E9] hover:text-white transition-colors"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {selectedEvent && (
                <InvoiceDetailsModal
                    open={showInvoiceModal}
                    onClose={() => {
                        setShowInvoiceModal(false);
                        setSelectedEvent(null);
                    }}
                    title="Event Invoices List"
                    invoice={{
                        _id: selectedEvent._id,
                        invoiceId: selectedEvent._id.slice(-6).toUpperCase(),
                        date: selectedEvent.date,
                        paymentDate: getPaymentDate(selectedEvent._id),
                        amount: selectedEvent.amount,
                        penalty: 0,
                        status: hasParticipated(selectedEvent._id) ? "Paid" : "Pending",
                        resident: {
                            _id: profile?._id || "",
                            name: profile?.name || profile?.firstName || "Resident",
                            phoneNumber: profile?.phoneNumber || "",
                            email: profile?.email || "",
                            wing: profile?.wing || "",
                            unit: profile?.unit || "",
                        },
                        eventTitle: selectedEvent.title,
                        eventDescription: selectedEvent.description,
                    }}
                />
            )}
        </div>
    );
}
