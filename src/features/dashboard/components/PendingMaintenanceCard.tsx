import Button from "../../../ui/Button";
import Card from "../../../ui/Card";

type PendingMaintenance = { id: string; name: string; pending: string; amount: string };
type PendingMaintenanceCardProps = { data: PendingMaintenance[] };

export default function PendingMaintenanceCard({ data }: PendingMaintenanceCardProps) {
  return (
    <Card className="h-[398px] p-[20px]">
      <div className="flex items-center justify-between gap-[12px]">
        <h2 className="text-[16px] font-semibold leading-[20px] text-[#202224]">Pending Maintenances</h2>
        <Button variant="ghost" className="h-auto rounded-none p-0 text-[12px] font-medium text-[#5678E9] hover:bg-transparent hover:text-[#5678E9]">
          View all
        </Button>
      </div>

      <div className="mt-[15px] h-[325px] overflow-y-auto pr-[4px]">
        {data.map((item) => (
          <div key={item.id} className="grid min-h-[51px] grid-cols-[34px_1fr_auto] items-center gap-[10px] border-b border-[#F1F1F1] py-[8px] last:border-b-0">
            <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#FFF1E9] text-[12px] font-semibold text-[#FE512E]">
              {item.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-[17px] text-[#202224]">{item.name}</p>
              <p className="mt-[2px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">{item.pending}</p>
            </div>
            <p className="text-right text-[12px] font-semibold leading-[17px] text-[#E74C3C]">₹ {item.amount}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
