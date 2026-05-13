import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { announcementApi } from "../../../services/api";
import toast from "react-hot-toast";

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
        <div className="w-full">
            <section className="rounded-[15px] bg-white p-5 shadow-sm">
                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-xl font-bold leading-6 text-[#202224]">
                        Events Participation
                    </h1>
                </div>

                {/* Tabs */}
                <div className="mb-5 flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`relative px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "events"
                            ? "text-[#FE512E]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Events Participation
                        {activeTab === "events" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE512E]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("activities")}
                        className={`relative px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "activities"
                            ? "text-[#FE512E]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Activity Participate
                        {activeTab === "activities" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE512E]" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-hidden rounded-[10px] bg-white">
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.5fr] items-center rounded-t-[10px] bg-[#F1F4FF] px-4 py-4 text-sm font-bold leading-5 text-[#202224]">
                                <div>Participator Name</div>
                                <div>Description</div>
                                <div>{activeTab === "events" ? "Event Time" : "Activity Time"}</div>
                                <div>{activeTab === "events" ? "Event Date" : "Activity Date"}</div>
                                <div>{activeTab === "events" ? "Event Name" : "Activity Name"}</div>
                            </div>

                            {/* Table Body */}
                            <div className="max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
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
                                                className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.5fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0"
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
                                                className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.5fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0"
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
            </section>
        </div>
    );
}
