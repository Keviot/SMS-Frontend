import type { ReactNode } from "react";
import Card from "./Card";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <Card className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-[#202224]">{title}</h2>

        {description && (
          <p className="mt-1 text-sm font-semibold text-[#7B8190]">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </Card>
  );
}