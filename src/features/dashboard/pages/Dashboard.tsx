import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../services/api";
import StatCard from "../../../components/dashboard/StatCard";
import BalanceChart from "../../../components/dashboard/BalanceChart";
import ComplaintTable from "../../../components/dashboard/ComplaintTable";
import UpcomingActivityCard from "../../../components/dashboard/UpcomingActivityCard";
import PendingMaintenanceCard from "../../../components/dashboard/PendingMaintenanceCard";
import ImportantNumbersCard from "../../../components/dashboard/ImportantNumbersCard";
import { complaints, importantNumbers, pendingMaintenances, statCards, upcomingActivities } from "../../../data/dashboard.data";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const data = await authApi.getProfile();
        if (data.user) {
          const userRole = data.user.role?.toLowerCase();
          setRole(userRole);
        }
      } catch (error) {
        console.error("Dashboard role check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Security View Landing (If they manually navigate to /dashboard)
  if (role === "guard" || role === "security") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Security Dashboard</h2>
        <p className="text-gray-500 mb-6">Access visitor tracking and security protocols.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/security-guard")}
            className="bg-[#FE512E] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
          >
            Visitor Tracking
          </button>
        </div>
      </div>
    );
  }

  // Both Admin and Resident see the same high-fidelity layout as per the user request
  return (
    <div className="space-y-[20px] animate-in fade-in duration-500">
      {/* Row 1: Stat Cards - 4 equal columns */}
      <section className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            type={card.type}
          />
        ))}
      </section>

      {/* Row 2: Balance Chart (Large) | Important Numbers | Pending Maintenances */}
      <section className="grid grid-cols-1 gap-[20px] lg:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
        <BalanceChart />
        <ImportantNumbersCard data={importantNumbers} role={role} />
        <PendingMaintenanceCard data={pendingMaintenances} />
      </section>

      {/* Row 3: Complaint List (Large) | Upcoming Activity */}
      <section className="grid grid-cols-1 gap-[20px] xl:grid-cols-[3fr_1fr]">
        <ComplaintTable data={complaints} role={role} />
        <UpcomingActivityCard data={upcomingActivities} />
      </section>
    </div>
  );
}
