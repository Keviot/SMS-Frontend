import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";
import { authApi } from "../../../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailOrPhone = location.state?.emailOrPhone || "";
  const otp = location.state?.otp || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.resetPassword({ emailOrPhone, otp, newPassword });
      toast.success(data.message || "Password reset successful!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <form className="space-y-6" onSubmit={handleResetPassword}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">New Password<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter New Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Confirm Password<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className={`w-full py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] font-bold ${(newPassword && confirmPassword) && !loading
            ? "bg-[#EE641D] text-white shadow-lg hover:opacity-90"
            : "bg-[#f3f3f3] text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center text-sm mt-6">
        <Link to="/login" className="text-red-400 font-semibold hover:underline">Back to Login</Link>
      </p>
    </div>
  );
}
