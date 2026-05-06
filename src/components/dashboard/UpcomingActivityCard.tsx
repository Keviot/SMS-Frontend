import Card from "../ui/Card";

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

export default function UpcomingActivityCard({
  data,
}: UpcomingActivityCardProps) {
  return (
    <Card className="h-[320px] w-full p-[15px] lg:h-[361px] lg:p-[20px]">
      <h2 className="text-[14px] font-semibold text-[#202224] sm:text-[16px] lg:text-[18px]">Upcoming Activity</h2>

      {/* Scrollable content area */}
      <div className="mt-[12px] h-[250px] space-y-[8px] overflow-y-auto pr-[5px] lg:mt-[15px] lg:h-[286px] lg:space-y-[10px]">
        {data.map((item) => (
          <div
            key={item.id}
            className="grid min-h-[60px] grid-cols-[40px_1fr_auto] items-center gap-[10px] border-b border-[#F1F1F1] py-[8px] last:border-b-0 lg:min-h-[70px] lg:grid-cols-[45px_1fr_auto] lg:gap-[12px] lg:py-[10px]"
          >
            <div className="grid h-[40px] w-[40px] place-items-center rounded-full bg-[#5678E9] text-[14px] font-bold text-white lg:h-[45px] lg:w-[45px] lg:text-[16px]">
              {item.letter}
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-[#202224] lg:text-[14px]">
                {item.title}
              </h4>
              <p className="mt-[3px] text-[11px] font-medium text-[#A7A7A7] lg:mt-[4px] lg:text-[12px]">
                {item.time}
              </p>
            </div>

            <span className="text-[11px] font-semibold text-[#A7A7A7] lg:text-[12px]">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}