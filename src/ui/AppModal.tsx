import type { ReactNode } from "react";

type AppModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  widthClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
  showHeaderDivider?: boolean;
  headerRight?: ReactNode;
  titleClassName?: string;
};

export default function AppModal({
  open,
  title,
  children,
  widthClassName = "w-[410px]",
  overlayClassName = "",
  panelClassName = "",
  showHeaderDivider = false,
  headerRight,
  titleClassName = "text-[16px] font-semibold leading-[20px] text-[#202224]",
}: AppModalProps) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/50 px-4 ${overlayClassName}`}
    >
      <div
        className={`relative ${widthClassName} max-w-[calc(100vw-32px)] rounded-[15px] bg-white p-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${panelClassName}`}
      >
        <div
          className={
            showHeaderDivider
              ? "flex h-[40px] w-full items-start justify-between border-b border-[#F4F4F4]"
              : "flex w-full items-start justify-between"
          }
        >
          <h2 className={titleClassName}>{title}</h2>
          {headerRight}
        </div>

        {children}
      </div>
    </div>
  );
}