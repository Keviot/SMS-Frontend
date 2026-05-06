import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import reset from "../assets/reset.png";
import { authApi } from "../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { emailOrPhone, otp } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // if (!emailOrPhone || !otp) {
  //   navigate("/forgot-password");
  //   return null;
  // }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        emailOrPhone,
        otp,
        password,
        confirmPassword,
      });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const tagline = (
    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
      Your Security, Our Priority.<br />
      <span className="text-[#EE641D]">Reset your password securely.</span>
    </h2>
  );

  return (
    <AuthLayout title="Reset Password" illustration={reset} tagline={tagline} step={2}>
      <div className="flex-1 flex flex-col justify-center">
        <form className="space-y-8" onSubmit={handleResetPassword}>
          <div className="space-y-2 text-center">
            {/* <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1> */}
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">New Password<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter New Password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700 placeholder:text-gray-300"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">ConfirmPassword<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter Confirm Password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700 placeholder:text-gray-300"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password || password !== confirmPassword}
            className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${password && password === confirmPassword
              ? "bg-[#EE641D] text-white shadow-lg hover:opacity-90"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <Link to="/login" className="text-red-400 font-semibold hover:underline">Back to Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
