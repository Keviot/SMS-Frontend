import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../../ui/Button";
import { financialApi } from "../../../services/api";
import AppModal from "../../../components/modals/AppModal";

interface SetMaintenancePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (password: string) => void;
}

export default function SetMaintenancePasswordModal({
  open,
  onClose,
  onSuccess,
}: SetMaintenancePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear password when modal closes
  useEffect(() => {
    if (!open) {
      setPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [open]);

  const handleContinue = async () => {
    if (!password || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify password with backend
      await financialApi.verifyMaintenancePassword(password);

      // Password is correct, proceed to next step
      onSuccess(password);
      setPassword("");
      setError("");
    } catch (error: any) {
      // Show error in modal
      const errorMessage = error.message || "Invalid password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Set Maintenance"
      widthClassName="w-full max-w-md sm:max-w-lg"
      titleClassName="text-2xl font-bold leading-8 text-[#202224]"
      showHeaderDivider
    >
      <div className="pt-1">

        {/* Password Input */}
        <div className="mt-5">
          <label className="mb-2 block text-lg font-medium leading-6 text-[#202224]">
            Password<span className="text-[#FE512E]">*</span>
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(""); // Clear error when typing
              }}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              placeholder="........"
              disabled={loading}
              className={`h-14 w-full rounded-xl border ${error ? "border-[#E74C3C]" : "border-[#202224]"
                } bg-white px-4 pr-14 text-base font-medium tracking-widest text-[#202224] outline-none transition-all placeholder:text-[#202224] focus:border-[#202224] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#202224] disabled:opacity-60"
            >
              {showPassword ? <EyeOff size={26} /> : <Eye size={26} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-2 text-sm font-medium text-[#E74C3C]">
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-7 grid grid-cols-2 gap-5">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="h-14 rounded-xl border border-[#D9D9D9] bg-white text-lg font-semibold text-[#202224] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!password || loading}
            className="h-14 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Continue"}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}