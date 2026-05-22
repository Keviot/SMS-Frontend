import AppModal from "../../../components/modals/AppModal";

type SecurityProtocolViewData = {
  title: string;
  description: string;
  date: string;
  time: string;
};

type ViewSecurityProtocolModalProps = {
  open: boolean;
  onClose: () => void;
  data: SecurityProtocolViewData | null;
};

export default function ViewSecurityProtocolModal({
  open,
  onClose,
  data,
}: ViewSecurityProtocolModalProps) {
  if (!open || !data) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="View Security Protocol"
      widthClassName="w-full max-w-md"
      showHeaderDivider={true}
    >
      <div className="pt-2 mt-5 space-y-5">
          <div>
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Title
            </p>
            <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
              {data.title}
            </p>
          </div>

          <div>
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Description
            </p>
            <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
              {data.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-base font-medium leading-5 text-[#A7A7A7]">
                Date
              </p>
              <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
                {data.date}
              </p>
            </div>

            <div>
              <p className="text-base font-medium leading-5 text-[#A7A7A7]">
                Time
              </p>
              <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
                {data.time}
              </p>
            </div>
          </div>
      </div>
    </AppModal>
  );
}