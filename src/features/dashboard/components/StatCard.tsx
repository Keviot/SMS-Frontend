import Card from "../../../ui/Card";

type StatCardType = "balance" | "income" | "expense" | "unit" | "penalty";

type StatCardProps = {
  title: string;
  value: string | number;
  type: StatCardType;
  loading?: boolean;
  variant?: "compact" | "dashboard";
};

const statConfig = {
  balance: {
    valueColor: "text-[#202224]",
    accent: "bg-[#FFB37C]",
    border: "border-[#FFB37C]",
  },
  income: {
    valueColor: "text-[#39973D]",
    accent: "bg-[#39973D]",
    border: "border-[#39973D]",
  },
  expense: {
    valueColor: "text-[#5678E9]",
    accent: "bg-[#5678E9]",
    border: "border-[#5678E9]",
  },
  unit: {
    valueColor: "text-[#EC4899]",
    accent: "bg-[#EC4899]",
    border: "border-[#EC4899]",
  },
  penalty: {
    valueColor: "text-[#E74C3C]",
    accent: "bg-[#E74C3C]",
    border: "border-[#E74C3C]",
  },
};

export default function StatCard({
  title,
  value,
  type,
  loading = false,
  variant = "compact",
}: StatCardProps) {
  const config = statConfig[type];

  if (variant === "dashboard") {
    return (
      <Card className="relative flex h-[105px] w-full items-center justify-between overflow-hidden rounded-[15px] border border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div
          className={[
            "absolute left-[-4px] top-1/2 h-10 w-2 -translate-y-1/2 rounded-full opacity-60",
            config.accent,
          ].join(" ")}
        />

        <div
          className={[
            "absolute -right-[1.5px] -top-[1.5px] h-20 w-16 rounded-tr-[15px] border-r-[3px] border-t-2",
            config.border,
          ].join(" ")}
          style={{
            maskImage:
              "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
          }}
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#202224] opacity-70">
            {title}
          </p>

          <h3
            className={[
              "mt-2 truncate text-2xl font-bold leading-8",
              config.valueColor,
            ].join(" ")}
          >
            {loading ? "..." : `${type !== "unit" ? "₹ " : ""}${value}`}
          </h3>
        </div>
      </Card>
    );
  }
  return (
    <Card className="relative flex min-h-24 w-full flex-col justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white py-4 pl-8 pr-4 shadow-sm lg:w-64">
      <div
        className={[
          "absolute left-[-4px] top-1/2 h-10 w-2 -translate-y-1/2 rounded-full opacity-60",
          config.accent,
        ].join(" ")}
      />

      <div
        className={[
          "absolute -right-[1.5px] -top-[1.5px] h-20 w-16 rounded-tr-2xl border-r-[3px] border-t-2",
          config.border,
        ].join(" ")}
        style={{
          maskImage:
            "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
        }}
      />

      <div className="text-sm font-semibold text-[#202224] opacity-70">
        {title}
      </div>

      <div
        className={[
          "mt-1 text-2xl font-bold leading-8",
          config.valueColor,
        ].join(" ")}
      >
        {loading ? "..." : `${type !== "unit" ? "₹ " : ""}${value}`}
      </div>
    </Card>
  );
}