import Card from "../../ui/Card";
import Button from "../../ui/Button";

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
  return (
    <Card className="h-[350px] w-full p-[15px] lg:h-[398px] lg:p-[20px]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[14px] font-semibold text-[#202224] sm:text-[16px] lg:text-[18px]">
          Pending Maintenances
        </h2>

        <Button variant="ghost" size="sm" className="h-[32px] px-[10px] text-[12px] text-[#5678E9] hover:text-[#4A67D5] lg:h-[38px] lg:px-[15px] lg:text-[14px]">
          View all
        </Button>
      </div>

      {/* Scrollable content area */}
      <div className="mt-[12px] h-[260px] space-y-[8px] overflow-y-auto pr-[5px] lg:mt-[15px] lg:h-[305px] lg:space-y-[10px]">
        {data.map((item) => (
          <div
            key={item.id}
            className="grid min-h-[60px] grid-cols-[40px_1fr_auto] items-center gap-[10px] border-b border-[#F1F1F1] py-[8px] last:border-b-0 lg:min-h-[70px] lg:grid-cols-[45px_1fr_auto] lg:gap-[12px] lg:py-[10px]"
          >
            <div className="grid h-[40px] w-[40px] place-items-center rounded-full bg-[#F6F8FB] text-[14px] font-bold text-[#202224] lg:h-[45px] lg:w-[45px] lg:text-[16px]">
              {item.name.charAt(0)}
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-[#202224] lg:text-[14px]">
                {item.name}
              </h4>
              <p className="mt-[3px] text-[11px] font-medium text-[#A7A7A7] lg:mt-[4px] lg:text-[12px]">
                {item.pending}
              </p>
            </div>

            <strong className="text-[14px] font-bold text-[#E74C3C] lg:text-[16px]">
              ₹ {item.amount}
            </strong>
          </div>
        ))}
      </div>
    </Card>
  );
}