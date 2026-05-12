import Card from "../../../ui/Card";

type UpcomingActivity = {
  id: string;
  letter: string;
  title: string;
  time: string;
  date: string;
};

type UpcomingActivityCardProps = {
  data: UpcomingActivity[];
};

const colors = [
  "bg-[#5678E9]",
  "bg-[#39973D]",
  "bg-[#FE512E]",
  "bg-[#F09619]",
  "bg-[#5678E9]",
];

export default function UpcomingActivityCard({
  data,
}: UpcomingActivityCardProps) {
  return (
    <Card className="flex min-h-[22rem] flex-col p-5">
      <h2 className="text-base font-semibold leading-5 text-[#202224]">
        Upcoming Activity
      </h2>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="divide-y divide-[#F1F1F1]">
          {data.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 py-2"
            >
              <div
                className={[
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white",
                  colors[index % colors.length],
                ].join(" ")}
              >
                {item.letter}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-5 text-[#202224]">
                  {item.title}
                </p>

                <p className="truncate text-[11px] font-medium leading-4 text-[#A7A7A7]">
                  {item.time}
                </p>
              </div>

              <p className="shrink-0 text-right text-[11px] font-medium leading-4 text-[#A7A7A7]">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}