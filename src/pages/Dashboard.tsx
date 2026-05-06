import StatCard from "../components/dashboard/StatCard";
import BalanceChart from "../components/dashboard/BalanceChart";
import ComplaintTable from "../components/dashboard/ComplaintTable";
import UpcomingActivityCard from "../components/dashboard/UpcomingActivityCard";
import PendingMaintenanceCard from "../components/dashboard/PendingMaintenanceCard";
import ImportantNumbersCard from "../components/dashboard/ImportantNumbersCard";
import { complaints, importantNumbers, pendingMaintenances, statCards, upcomingActivities } from "../data/dashboard.data";

export default function Dashboard() {

  return (

    <div className="space-y-[20px]">
      {/* Row 1: Stat Cards - 4 equal columns, responsive */}
      <section className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
        {statCards
          .map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              type={card.type}
            />
          ))}
      </section>

      {/* Row 2: Balance Chart (50%) | Important Numbers (25%) | Pending Maintenances (25%) */}
      <section className="grid grid-cols-1 gap-[20px] lg:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
        <BalanceChart />
        <ImportantNumbersCard data={importantNumbers} />
        <PendingMaintenanceCard data={pendingMaintenances} />
      </section>

      {/* Row 3: Complaint List (75%) | Upcoming Activity (25%) */}
      <section className="grid grid-cols-1 gap-[20px] xl:grid-cols-[3fr_1fr]">
        <ComplaintTable data={complaints} />
        <UpcomingActivityCard data={upcomingActivities} />
      </section>
    </div>
  );
}
