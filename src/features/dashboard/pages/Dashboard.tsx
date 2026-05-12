import StatCard from "../components/StatCard";
import BalanceChart from "../components/BalanceChart";
import ComplaintTable from "../components/ComplaintTable";
import UpcomingActivityCard from "../components/UpcomingActivityCard";
import PendingMaintenanceCard from "../components/PendingMaintenanceCard";
import ImportantNumbersCard from "../components/ImportantNumbersCard";
import { statCards } from "../../../data/dashboard.data";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi, complaintApi, importantNumberApi, financialApi, announcementApi } from "../../../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    complaints: [],
    importantNumbers: [],
    pendingMaintenances: [],
    upcomingActivities: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const profileData = await authApi.getProfile();

        if (profileData.user) {
          const userRole = profileData.user.role?.toLowerCase();
          setRole(userRole);

          const societyId = profileData.user.society?._id || profileData.user.society;

          // Fetch all dashboard data in parallel
          const [complaintsData, numbersData, maintenanceData, announcementsData] = await Promise.all([
            complaintApi.getAllComplaints(societyId),
            importantNumberApi.getAll(),
            financialApi.getMaintenanceRecords(),
            announcementApi.getAll(societyId)
          ]);

          // Map Complaints
          const mappedComplaints = (complaintsData || []).map((c: any) => ({
            id: c._id,
            compainerName: c.compainerName,
            complainName: c.complainName,
            date: new Date(c.createdAt).toLocaleDateString("en-GB"),
            priority: c.priority,
            status: c.status
          }));

          // Map Important Numbers
          const mappedNumbers = (numbersData || []).map((n: any) => ({
            id: n._id,
            name: n.name,
            phone: n.phoneNumber || n.phone,
            work: n.work
          }));

          // Map Pending Maintenances
          const allMaintenance = maintenanceData.data || maintenanceData || [];
          const mappedMaintenance = allMaintenance
            .filter((m: any) => m.status === "Pending")
            .map((m: any) => ({
              id: m._id,
              name: m.name || (m.resident?.name || "Resident"),
              pending: "Pending",
              amount: m.amount?.toString() || "0"
            }));

          // Map Upcoming Activities (Announcements)
          const announcements = announcementsData.announcement || announcementsData || [];
          const mappedActivities = announcements.map((a: any) => ({
            id: a._id,
            letter: (a.title || "A").charAt(0).toUpperCase(),
            title: a.title,
            time: a.time || "Event Time",
            date: new Date(a.date).toLocaleDateString("en-GB")
          }));

          setData({
            complaints: mappedComplaints,
            importantNumbers: mappedNumbers,
            pendingMaintenances: mappedMaintenance,
            upcomingActivities: mappedActivities
          });
        }
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Security View Landing
  if (role === "guard" || role === "security") {
    return (
      <section className="grid min-h-[60vh] place-items-center rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-gray-900">
            Security Dashboard
          </h2>

          <p className="mt-2 text-sm font-medium text-gray-500">
            Access visitor tracking and security protocols.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/security-guard")}
              className="rounded-xl bg-[#FE512E] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:opacity-90"
            >
              Visitor Tracking
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="animate-in fade-in flex flex-col gap-5 duration-500">
      {/* Row 1: Stat Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            type={card.type}
          />
        ))}
      </section>

      {/* Row 2: Balance Chart | Important Numbers | Pending Maintenances */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)_minmax(16rem,1fr)]">
        <BalanceChart />
        <ImportantNumbersCard data={data.importantNumbers} role={role} />
        <PendingMaintenanceCard data={data.pendingMaintenances} />
      </section>

      {/* Row 3: Complaint List | Upcoming Activity */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(16rem,1fr)]">
        <ComplaintTable data={data.complaints} role={role} />
        <UpcomingActivityCard data={data.upcomingActivities} />
      </section>
    </div>
  );
}