import { useEffect, useMemo, useState } from "react";
import type { ComplaintStatus, Priority } from "../../data/dashboard.data";
import AppModal from "./AppModal";
import FormInput from "../../ui/FormInput";
import FormTextarea from "../../ui/FormTextarea";
import OptionButton from "../../ui/OptionButton";

export type ComplaintFormValues = {
  complainerName: string;
  complaintName: string;
  description: string;
  wing: string;
  unit: string;
  priority: Priority;
  status: ComplaintStatus;
};

type ComplaintFormModalProps = {
  open: boolean;
  mode?: "add" | "edit";
  initialValues?: ComplaintFormValues;
  onClose: () => void;
  onSave: (values: ComplaintFormValues) => void;
};

const defaultValues: ComplaintFormValues = {
  complainerName: "",
  complaintName: "",
  description: "",
  wing: "",
  unit: "",
  priority: "Medium",
  status: "Open",
};

const labelClass =
  "mb-[5px] block text-[16px] font-medium leading-[20px] text-[#202224]";

const inputClass =
  "h-[42px] w-full rounded-[10px] border border-[#202224] bg-white px-[13px] text-[16px] font-normal leading-[20px] text-[#202224] outline-none placeholder:text-[#A7A7A7]";

const smallInputClass =
  "h-[47px] w-full rounded-[10px] border border-[#202224] bg-white px-[13px] text-[16px] font-normal leading-[20px] text-[#202224] outline-none placeholder:text-[#A7A7A7]";

export default function ComplaintFormModal({
  open,
  mode = "edit",
  initialValues,
  onClose,
  onSave,
}: ComplaintFormModalProps) {
  const [values, setValues] = useState<ComplaintFormValues>(defaultValues);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues ?? defaultValues);
  }, [open, initialValues]);

  const isDisabled = useMemo(() => {
    return (
      values.complainerName.trim() === "" ||
      values.complaintName.trim() === "" ||
      values.description.trim() === "" ||
      values.wing.trim() === "" ||
      values.unit.trim() === ""
    );
  }, [values]);

  const updateValue = <K extends keyof ComplaintFormValues>(
    key: K,
    value: ComplaintFormValues[K]
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDisabled) return;

    onSave({
      complainerName: values.complainerName.trim(),
      complaintName: values.complaintName.trim(),
      description: values.description.trim(),
      wing: values.wing.trim(),
      unit: values.unit.trim(),
      priority: values.priority,
      status: values.status,
    });
  };

  return (
    <AppModal
      open={open}
      title={mode === "add" ? "Create Complaint" : "Edit Complaint"}
      widthClassName="w-[410px]"
      panelClassName="h-[720px]"
      showHeaderDivider
      titleClassName="text-[20px] font-semibold leading-[25px] text-[#202224]"
    >
      <form onSubmit={handleSubmit} className="mt-[20px] w-[370px]">
        <div className="flex h-[403px] w-[370px] flex-col gap-[5px]">
          <FormInput
            label="Complainer Name"
            required
            value={values.complainerName}
            placeholder="Enter Name"
            onChange={(value) => updateValue("complainerName", value)}
            labelClassName={labelClass}
            inputClassName={inputClass}
          />

          <FormInput
            label="Complaint Name"
            required
            value={values.complaintName}
            placeholder="Enter Complaint Name"
            onChange={(value) => updateValue("complaintName", value)}
            labelClassName={labelClass}
            inputClassName={inputClass}
          />

          <FormTextarea
            label="Description"
            required
            value={values.description}
            placeholder="Enter Description"
            onChange={(value) => updateValue("description", value)}
          />

          <div className="grid h-[96px] w-[370px] grid-cols-2 gap-[20px]">
            <FormInput
              label="Wing"
              required
              value={values.wing}
              placeholder="Enter Wing"
              onChange={(value) => updateValue("wing", value)}
              labelClassName={labelClass}
              inputClassName={smallInputClass}
            />

            <FormInput
              label="Unit"
              required
              value={values.unit}
              placeholder="Enter Unit"
              onChange={(value) => updateValue("unit", value)}
              labelClassName={labelClass}
              inputClassName={smallInputClass}
            />
          </div>
        </div>

        <div className="flex h-[144px] w-[369px] flex-col gap-[10px]">
          <div className="w-[369px]">
            <p className="mb-[5px] text-[16px] font-medium leading-[20px] text-[#202224]">
              Priority<span className="text-[#E74C3C]">*</span>
            </p>

            <div className="grid h-[41px] w-[369px] grid-cols-3 gap-[20px]">
              {(["High", "Medium", "Low"] as Priority[]).map((priority) => (
                <OptionButton
                  key={priority}
                  label={priority}
                  selected={values.priority === priority}
                  onClick={() => updateValue("priority", priority)}
                />
              ))}
            </div>
          </div>

          <div className="w-[369px]">
            <p className="mb-[5px] text-[16px] font-medium leading-[20px] text-[#202224]">
              Status<span className="text-[#E74C3C]">*</span>
            </p>

            <div className="grid h-[41px] w-[369px] grid-cols-3 gap-[20px]">
              {(["Open", "Pending", "Solve"] as ComplaintStatus[]).map(
                (status) => (
                  <OptionButton
                    key={status}
                    label={status}
                    selected={values.status === status}
                    onClick={() => updateValue("status", status)}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-[20px] grid h-[51px] w-[370px] grid-cols-2 gap-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[51px] rounded-[10px] border border-[#D3D3D3] bg-white text-[16px] font-medium leading-[20px] text-[#202224]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isDisabled}
            className="h-[51px] rounded-[10px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] text-[16px] font-semibold leading-[20px] text-white disabled:bg-none disabled:bg-[#F6F8FB] disabled:text-[#202224]"
          >
            Save
          </button>
        </div>
      </form>
    </AppModal>
  );
}