import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { announcementApi } from "../../../services/api";
import toast from "react-hot-toast";
import { cn } from "../../../lib/cn";

type EventParticipation = {
    id: string;
    participatorName: string;
    participatorAvatar: string;
    description: string;
    eventTime: string;
    eventDate: string;
    eventName: string;
};

type ActivityParticipate = {
    id: string;
    participatorName: string;
    participatorAvatar: string;
    description: string;
    activityTime: string;
    activityDate: string;
    activityName: string;
};

export default function EventsParticipation() {
    const [activeTab, setActiveTab] = useState<"events" | "activities">("events");
    const [loading, setLoading] = useState(true);
    const [eventsData, setEventsData] = useState<EventParticipation[]>([]);
    const [activitiesData, setActivitiesData] = useState<ActivityParticipate[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch announcements
            const response = await announcementApi.getAll();
            const announcements = response.announcement || [];

            // Filter events (announcementType includes "Event")
            const events = announcements
                .filter((a: any) =>
                    Array.isArray(a.announcementType)
                        ? a.announcementType.includes("Event")
                        : a.announcementType === "Event"
                )
                .map((event: any) => ({
                    id: event._id,
                    participatorName: "Event Organizer", // Placeholder
                    participatorAvatar: "",
                    description: event.description,
                    eventTime: event.time || new Date(event.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    }),
                    eventDate: event.date
                        ? new Date(event.date).toLocaleDateString("en-GB")
                        : new Date(event.createdAt).toLocaleDateString("en-GB"),
                    eventName: event.title,
                }));

            // Filter activities (other announcement types)
            const activities = announcements
                .filter((a: any) => {
                    const types = Array.isArray(a.announcementType) ? a.announcementType : [a.announcementType];
                    return types.some((t: string) => ["Notice", "Community Initiatives", "Maintenance"].includes(t));
                })
                .map((activity: any) => ({
                    id: activity._id,
                    participatorName: "Activity Coordinator", // Placeholder
                    participatorAvatar: "",
                    description: activity.description,
                    activityTime: activity.time || new Date(activity.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    }),
                    activityDate: activity.date
                        ? new Date(activity.date).toLocaleDateString("en-GB")
                        : new Date(activity.createdAt).toLocaleDateString("en-GB"),
                    activityName: activity.title,
                }));

            setEventsData(events);
            setActivitiesData(activities);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error(error.message || "Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-0">
            {/* Tabs */}
            <div className="relative z-10 flex w-full items-end">
                <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className={cn(
                        "relative flex-1 sm:flex-none min-h-12 px-1 sm:px-10 py-3 text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center text-center leading-tight shrink-0",
                        activeTab === "events"
                            ? "z-10 rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white border-0"
                            : "z-0 rounded-t-xl border border-[#D9DCE5] border-b-0 bg-[#F6F8FB] text-[#6F7786] hover:bg-gray-50 hover:text-[#202224]"
                    )}
                >
                    Events Participation
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("activities")}
                    className={cn(
                        "relative flex-1 sm:flex-none -ml-[1px] min-h-12 px-1 sm:px-10 py-3 text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center text-center leading-tight shrink-0",
                        activeTab === "activities"
                            ? "z-10 rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white border-0"
                            : "z-0 rounded-t-xl border border-[#D9DCE5] border-b-0 bg-[#F6F8FB] text-[#6F7786] hover:bg-gray-50 hover:text-[#202224]"
                    )}
                >
                    Activity Participate
                </button>
            </div>

            {/* Content */}
            <div className={cn(
                "-mt-px rounded-2xl rounded-tl-none border border-[#D9DCE5] bg-white p-4 sm:p-5"
            )}>
                <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
                        <div className="max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 pr-1">
                            {/* Table Header */}
                            <div className="sticky top-0 z-10 grid grid-cols-[1.15fr_1.75fr_0.85fr_0.95fr_1fr] items-center rounded-t-[10px] bg-[#F1F4FF] px-4 py-4 text-sm font-bold leading-5 text-[#202224]">
                                <div>Participator Name</div>
                                <div>Description</div>
                                <div>{activeTab === "events" ? "Event Time" : "Activity Time"}</div>
                                <div>{activeTab === "events" ? "Event Date" : "Activity Date"}</div>
                                <div>{activeTab === "events" ? "Event Name" : "Activity Name"}</div>
                            </div>

                            {/* Table Body */}
                            <div>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                        <span className="ml-3 text-gray-600">Loading...</span>
                                    </div>
                                ) : activeTab === "events" ? (
                                    eventsData.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                                <svg
                                                    className="h-8 w-8 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">
                                                No Events Available
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                There are no upcoming events at the moment.
                                            </p>
                                        </div>
                                    ) : (
                                        eventsData.map((event) => (
                                            <div
                                                key={event.id}
                                                className="grid grid-cols-[1.15fr_1.75fr_0.85fr_0.95fr_1fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1E9] text-sm font-semibold text-[#FE512E]">
                                                        {event.participatorName.charAt(0)}
                                                    </div>
                                                    <span className="truncate">{event.participatorName}</span>
                                                </div>

                                                <div className="truncate pr-6">{event.description}</div>

                                                <div>{event.eventTime}</div>

                                                <div>{event.eventDate}</div>

                                                <div className="truncate">{event.eventName}</div>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    activitiesData.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                                <svg
                                                    className="h-8 w-8 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">
                                                No Activities Available
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                There are no activities at the moment.
                                            </p>
                                        </div>
                                    ) : (
                                        activitiesData.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="grid grid-cols-[1.15fr_1.75fr_0.85fr_0.95fr_1fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF3FF] text-sm font-semibold text-[#5678E9]">
                                                        {activity.participatorName.charAt(0)}
                                                    </div>
                                                    <span className="truncate">{activity.participatorName}</span>
                                                </div>

                                                <div className="truncate pr-6">{activity.description}</div>

                                                <div>{activity.activityTime}</div>

                                                <div>{activity.activityDate}</div>

                                                <div className="truncate">{activity.activityName}</div>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
