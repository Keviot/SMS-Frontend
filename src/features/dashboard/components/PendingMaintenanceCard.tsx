import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../../ui/Button";
import Card from "../../../ui/Card";
import { authApi } from "../../../services/api";

type PendingMaintenance = {
  id: string;
  name: string;
  pending: string;
  amount: string;
};

type PendingMaintenanceCardProps = {
  data: PendingMaintenance[];
};

export default function PendingMaintenanceCard({
  data,
}: PendingMaintenanceCardProps) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const profileData = await authApi.getProfile();
        if (profileData.user) {
          setUserRole(profileData.user.role?.toLowerCase() || "");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const handleViewAll = () => {
    // Admin goes to financial management income page
    // Resident goes to payment portal maintenance invoices page
    if (userRole === "resident") {
      navigate("/payment-portal");
    } else {
      navigate("/financial-management/income");
    }
  };

  return (
    <Card className="flex h-[27rem] flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold leading-5 text-[#202224]">
          Pending Maintenances
        </h2>

        <Button
          variant="ghost"
          onClick={handleViewAll}
          className="h-auto rounded-none p-0 text-xs font-medium text-[#5678E9] hover:bg-transparent hover:text-[#5678E9] hover:underline"
        >
          View all
        </Button>
      </div>

      <div className="mt-3  min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="divide-y divide-[#F1F1F1]">
          {data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 py-2"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFF1E9] text-xs font-semibold text-[#FE512E]">
                {item.name.charAt(0)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-5 text-[#202224]">
                  {item.name}
                </p>

                <p className="truncate text-[11px] font-medium leading-4 text-[#A7A7A7]">
                  {item.pending}
                </p>
              </div>

              <p className="shrink-0 text-right text-xs font-semibold leading-5 text-[#E74C3C]">
                ₹ {item.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}