import StatCard from "../components/StatCard";
import BalanceChart from "../components/BalanceChart";
import ComplaintTable from "../components/ComplaintTable";
import UpcomingActivityCard from "../components/UpcomingActivityCard";
import PendingMaintenanceCard from "../components/PendingMaintenanceCard";
import ImportantNumbersCard from "../components/ImportantNumbersCard";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi, complaintApi, importantNumberApi, financialApi, announcementApi, dashboardApi } from "../../../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    complaints: [],
    importantNumbers: [],
    pendingMaintenances: [],
    upcomingActivities: [],
    monthlyBalance: [],
    stats: {
      totalBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalUnit: 0
    }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const profileData = await authApi.getProfile();

      if (profileData.user) {
        const userRole = profileData.user.role?.toLowerCase();
        setRole(userRole);

        let societyId = profileData.user.society?._id || profileData.user.society;
        if (!societyId && profileData.user.societies && profileData.user.societies.length > 0) {
          societyId = profileData.user.societies[0]._id;
        }

        const fetchWithFallback = async (apiCall: Promise<any>, fallback: any = []) => {
          try {
            const res = await apiCall;
            return res;
          } catch (err) {
            console.error("API Call failed:", err);
            return fallback;
          }
        };

        // Fetch all dashboard data in parallel
        const [
          complaintsData,
          numbersData,
          maintenanceData,
          announcementsData,
          statsData
        ] = await Promise.all([
          fetchWithFallback(complaintApi.getAllComplaints(societyId), { complainList: [] }),
          fetchWithFallback(importantNumberApi.getAll(), { data: [] }),
          fetchWithFallback(financialApi.getMaintenanceRecords(), { data: [] }),
          fetchWithFallback(announcementApi.getAll(societyId), { announcement: [] }),
          fetchWithFallback(dashboardApi.getStats(societyId), { totalBalance: 0, totalIncome: 0, totalExpense: 0, totalUnit: 0, monthlyIncome: new Array(12).fill(0) })
        ]);

        // Safe date formatting helper
        const formatDate = (dateVal: any) => {
          const d = new Date(dateVal);
          return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-GB");
        };

        // Helper to safely extract arrays from various backend response formats
        const ensureArray = (dataObj: any, key?: string) => {
          if (!dataObj) return [];
          if (Array.isArray(dataObj)) return dataObj;
          if (key && Array.isArray(dataObj[key])) return dataObj[key];
          if (Array.isArray(dataObj.data)) return dataObj.data;
          return [];
        };

        // Map Complaints
        const allComplaints = ensureArray(complaintsData, "complainList");
        const mappedComplaints = allComplaints.map((c: any) => ({
          id: c._id,
          complainerName: c.compainerName || "N/A",
          complaintName: c.complainName || "N/A",
          date: formatDate(c.createdAt),
          priority: c.priority || "Medium",
          status: c.status || "Pending"
        }));

        // Map Important Numbers
        const allNumbers = ensureArray(numbersData, "importantNumber");
        const mappedNumbers = allNumbers.map((n: any) => ({
          id: n._id,
          name: n.name || "N/A",
          phone: n.phoneNumber || n.number || n.phone || "N/A",
          work: n.work || "N/A"
        }));

        // Map Upcoming Activities (Announcements)
        const allAnnouncements = ensureArray(announcementsData, "announcement");
        const mappedActivities = allAnnouncements.map((a: any) => ({
          id: a._id,
          letter: (a.title || "A").charAt(0).toUpperCase(),
          title: a.title || "Untitled",
          time: a.time || "N/A",
          date: formatDate(a.date)
        }));

        // Financial Data
        const allMaintenance = ensureArray(maintenanceData);

        const { totalBalance, totalIncome, totalExpense, totalUnit } = statsData;

        // Map Pending Maintenances
        const mappedMaintenance = allMaintenance
          .filter((m: any) => m && (m.status?.toLowerCase() === "pending" || m.status?.toLowerCase() === "due"))
          .map((m: any) => {
            const firstName = m.resident?.firstname || "";
            const lastName = m.resident?.lastname || "";
            const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (m.name || m.resident?.name || "Resident");
            return {
              id: m._id,
              name: fullName,
              pending: m.status || "Pending",
              amount: (m.amount || m.maintenanceSetup?.maintenanceAmount || 0).toString()
            };
          });


        setData({
          complaints: mappedComplaints,
          importantNumbers: mappedNumbers,
          pendingMaintenances: mappedMaintenance,
          upcomingActivities: mappedActivities,
          monthlyBalance: statsData.monthlyIncome || new Array(12).fill(0),
          stats: {
            totalBalance,
            totalIncome,
            totalExpense,
            totalUnit
          }
        });
      }
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-10 animate-spin text-(--primary)" />
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
              onClick={() => navigate("/security-management/visitor-logs")}
              className="rounded-xl bg-[#FE512E] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:opacity-90"
            >
              Visitor Tracking
            </button>
          </div>
        </div>
      </section>
    );
  }

  const liveStatCards = [
    {
      title: "Total Balance",
      value: `${data.stats.totalBalance.toLocaleString()}`,
      type: "balance" as const
    },
    {
      title: "Total Income",
      value: `${data.stats.totalIncome.toLocaleString()}`,
      type: "income" as const
    },
    {
      title: "Total Expense",
      value: `${data.stats.totalExpense.toLocaleString()}`,
      type: "expense" as const
    },
    {
      title: "Total Unit",
      value: data.stats.totalUnit.toString(),
      type: "unit" as const
    },
  ];

  return (
    <div className="animate-in fade-in flex flex-col gap-5 duration-500">
      {/* Row 1: Stat Cards */}
      <section className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveStatCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            type={card.type}
            variant="dashboard"
          />
        ))}
      </section>

      {/* Row 2: Balance Chart | Important Numbers | Pending Maintenances */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)_minmax(16rem,1fr)]">
        <BalanceChart data={data.monthlyBalance} total={data.stats.totalBalance} />
        <ImportantNumbersCard
          data={data.importantNumbers}
          role={role}
          onDataChange={fetchDashboardData}
        />
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