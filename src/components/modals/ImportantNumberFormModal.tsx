import { useEffect, useMemo, useState } from "react";
import AppModal from "./AppModal";
import FormInput from "../../ui/FormInput";
import PopupActions from "../../ui/PopupActions";

export type ImportantNumberFormValues = {
  name: string;
  phone: string;
  work: string;
};

type ImportantNumberFormModalProps = {
  open: boolean;
  mode?: "add" | "edit";
  initialValues?: ImportantNumberFormValues;
  onClose: () => void;
  onSave: (values: ImportantNumberFormValues) => void;
};

const defaultValues: ImportantNumberFormValues = {
  name: "",
  phone: "+91",
  work: "",
};

export default function ImportantNumberFormModal({
  open,
  mode = "add",
  initialValues,
  onClose,
  onSave,
}: ImportantNumberFormModalProps) {
  const [values, setValues] = useState<ImportantNumberFormValues>(defaultValues);

  useEffect(() => {
    if (!open) return;

    setValues(initialValues ?? defaultValues);
  }, [open, initialValues]);

  const isDisabled = useMemo(() => {
    return (
      values.name.trim() === "" ||
      values.phone.replace("+91", "").trim() === "" ||
      values.work.trim() === ""
    );
  }, [values]);

  const updateValue = (key: keyof ImportantNumberFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDisabled) return;

    onSave({
      name: values.name.trim(),
      phone: values.phone.trim(),
      work: values.work.trim(),
    });
  };

  return (
    <AppModal
      open={open}
      title={mode === "edit" ? "Edit Important Number" : "Add Important Number"}
      widthClassName="w-[410px]"
    >
      <form onSubmit={handleSubmit}>
        <div className="mt-[20px] flex flex-col gap-[5px]">
          <FormInput
            label="Full Name"
            required
            value={values.name}
            placeholder="Enter Full Name"
            onChange={(value) => updateValue("name", value)}
          />

          <FormInput
            label="Phone Number"
            required
            value={values.phone}
            placeholder="+91"
            onChange={(value) => updateValue("phone", value)}
          />

          <FormInput
            label="Work"
            required
            value={values.work}
            placeholder="Enter Work"
            onChange={(value) => updateValue("work", value)}
          />
        </div>

        <PopupActions onCancel={onClose} disabled={isDisabled} submitText="Save" />
      </form>
    </AppModal>
  );
}