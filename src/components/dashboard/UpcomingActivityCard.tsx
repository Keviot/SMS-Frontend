import Card from "../../ui/Card";

type UpcomingActivity = { id: string; letter: string; title: string; time: string; date: string };
type UpcomingActivityCardProps = { data: UpcomingActivity[] };

const colors = ["bg-[#5678E9]", "bg-[#39973D]", "bg-[#FE512E]", "bg-[#F09619]", "bg-[#5678E9]"];

export default function UpcomingActivityCard({ data }: UpcomingActivityCardProps) {
  return (
    <Card className="h-[361px] p-[20px]">
      <h2 className="text-[16px] font-semibold leading-[20px] text-[#202224]">Upcoming Activity</h2>
      <div className="mt-[15px] h-[286px] overflow-y-auto pr-[4px]">
        {data.map((item, index) => (
          <div key={item.id} className="grid min-h-[54px] grid-cols-[34px_1fr_auto] items-center gap-[10px] border-b border-[#F1F1F1] py-[8px] last:border-b-0">
            <div className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[14px] font-semibold text-white ${colors[index % colors.length]}`}>
              {item.letter}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-[17px] text-[#202224]">{item.title}</p>
              <p className="mt-[2px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">{item.time}</p>
            </div>
            <p className="text-right text-[11px] font-medium leading-[16px] text-[#A7A7A7]">{item.date}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
