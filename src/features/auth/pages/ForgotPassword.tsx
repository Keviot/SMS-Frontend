import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../services/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.forgetPassword(emailOrPhone);
      toast.success(data.message || "OTP sent successfully!");
      // Navigate to standalone OTP verification page
      navigate("/verify-otp", { state: { emailOrPhone } });
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <form className="space-y-6" onSubmit={handleRequestOtp}>
        <p className="text-gray-500 text-sm">Enter your email or phone and we'll send you an OTP.</p>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Email or Phone<span className="text-red-500">*</span></label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Enter Email or Phone number"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !emailOrPhone}
          className={`w-full py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] font-bold ${emailOrPhone && !loading
            ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg hover:opacity-90"
            : "bg-[#f3f3f3] text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "Sending..." : "Get OTP"}
        </button>
      </form>

      <p className="text-center text-sm mt-6">
        <Link to="/login" className="text-red-400 font-semibold hover:underline">Back to Login</Link>
      </p>
    </div>
  );
}
