import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import { announcementApi, authApi, paymentApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { loadRazorpay } from "../../../utils/loadRazorpay";

interface EventInvoice {
  _id: string;
  title: string;
  date: string;
  time: string;
  amount: number;
  description: string;
  announcementType: string | string[];
}

export default function OtherInvoices() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<EventInvoice[]>([]);
  const [eventPayments, setEventPayments] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInvoice | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await authApi.getProfile();

      if (profileData.user) {
        setProfile(profileData.user);
        const societyId =
          profileData.user.society?._id || profileData.user.society;

        const [announcementData, eventPaymentData] = await Promise.all([
          societyId
            ? announcementApi.getAll(societyId)
            : Promise.resolve({ announcement: [] }),
          import("../../../services/api")
            .then((m) => m.eventPaymentApi.get())
            .catch(() => ({ data: [] })),
        ]);

        const events = (announcementData.announcement || []).filter(
          (a: any) => {
            const isEvent = Array.isArray(a.announcementType)
              ? a.announcementType[0] === "Event"
              : a.announcementType === "Event";

            return isEvent && a.amount > 0;
          }
        );

        setAnnouncements(events);
        setEventPayments(eventPaymentData.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasParticipated = (eventId: string) => {
    return eventPayments.some(
      (p) => p.event?._id === eventId || p.event === eventId
    );
  };

  const handleParticipate = async (event: EventInvoice) => {
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    try {
      const data = await paymentApi.createOrder(event.amount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "SMS Project",
        description: `Event Participation - ${event.title}`,
        order_id: data.order.id,
        handler: async function () {
          try {
            const societyId = profile.society?._id || profile.society;

            await import("../../../services/api").then((m) =>
              m.eventPaymentApi.create({
                event: event._id,
                resident: profile._id,
                amount: event.amount,
                payment: "Online",
                society: societyId,
                status: "Paid",
              })
            );

            toast.success("Participation Confirmed!");
            fetchData();
          } catch (err: any) {
            toast.error("Failed to record participation");
            console.error(err);
          }
        },
        prefill: {
          name: profile?.name || "Resident",
          email: profile?.email || "",
          contact: profile?.phoneNumber || "",
        },
        theme: {
          color: "#5678E9",
        },
      };

      await loadRazorpay();
      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Payment initialization failed");
    }
  };

  const handleViewInvoiceList = () => {
    navigate("/payment-portal/event-invoices");
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[15px] bg-white">
          <Loader2 className="h-10 w-10 animate-spin text-[#5678E9]" />
        </div>
      ) : announcements.length === 0 ? (
        <section className="rounded-[15px] bg-white px-[20px] py-[20px]">
          <div className="flex min-h-[220px] items-center justify-center">
            <p className="text-[14px] font-medium text-[#6F7786]">
              No upcoming events with participation fees
            </p>
          </div>
        </section>
      ) : (
        <section className="w-full rounded-[15px] bg-white px-[20px] py-[20px]">
          <div className="mb-[20px] flex items-center justify-between gap-[16px]">
            <h1 className="text-[16px] font-semibold leading-[22px] text-[#202224]">
              Due Event Payment
            </h1>

            <button
              type="button"
              onClick={handleViewInvoiceList}
              className="h-[40px] rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] px-[20px] text-[12px] font-semibold leading-[18px] text-white"
            >
              View Invoice
            </button>
          </div>

          <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
            {announcements.map((event) => {
              const participated = hasParticipated(event._id);

              return (
                <article
                  key={event._id}
                  className="overflow-hidden rounded-[10px] border border-[#D9DCE5] bg-white"
                >
                  <div className="flex h-[54px] items-center justify-between bg-[#5678E9] px-[12px]">
                    <h2 className="max-w-[210px] truncate text-[13px] font-semibold leading-[18px] text-white">
                      Due Event Payment
                    </h2>

                    <span className="rounded-[58px] bg-white/10 px-[12px] py-[5px] text-[11px] font-medium leading-[15px] text-white">
                      {participated ? "Paid" : "Pending"}
                    </span>
                  </div>

                  <div className="px-[12px] pb-[12px] pt-[12px]">
                    <div className="space-y-[10px]">
                      <div className="flex items-center justify-between gap-[12px]">
                        <span className="text-[11px] font-medium leading-[15px] text-[#6F7786]">
                          Event Name
                        </span>
                        <span className="max-w-[150px] truncate text-right text-[11px] font-medium leading-[15px] text-[#A7A7A7]">
                          {event.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-[12px]">
                        <span className="text-[11px] font-medium leading-[15px] text-[#6F7786]">
                          Event Due Date
                        </span>
                        <span className="text-[11px] font-medium leading-[15px] text-[#A7A7A7]">
                          {new Date(event.date).toLocaleDateString("en-GB")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-[12px]">
                        <span className="text-[11px] font-medium leading-[15px] text-[#6F7786]">
                          Amount
                        </span>
                        <span className="text-[11px] font-medium leading-[15px] text-[#FF0000]">
                          {event.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {participated ? (
                      <button
                        type="button"
                        disabled
                        className="mt-[14px] h-[40px] w-full cursor-not-allowed rounded-[8px] bg-[#39973D]/10 text-[12px] font-semibold leading-[18px] text-[#39973D]"
                      >
                        Participated
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleParticipate(event)}
                        className="mt-[14px] h-[40px] w-full rounded-[8px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[12px] font-semibold leading-[18px] text-white"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <InvoiceDetailsModal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedEvent(null);
        }}
        title="Event Invoices List"
        invoice={
          selectedEvent
            ? {
              _id: selectedEvent._id,
              invoiceId: selectedEvent._id.slice(-6).toUpperCase(),
              date: selectedEvent.date,
              paymentDate: hasParticipated(selectedEvent._id)
                ? new Date().toISOString()
                : undefined,
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
            }
            : null
        }
      />
    </div>
  );
}
