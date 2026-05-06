import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Clock } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import reset from "../assets/reset.png";
import { authApi } from "../services/api";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailOrPhone = location.state?.emailOrPhone || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (!emailOrPhone) {
  //     toast.error("Invalid session. Please try again.");
  //     navigate("/forgot-password");
  //   }
  // }, [emailOrPhone, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.verifyOtp({ emailOrPhone, otp: otp.join("") });
      toast.success(data.message || "OTP verified successfully!");
      // Navigate to Reset Password page
      navigate("/reset-password", { state: { emailOrPhone, otp: otp.join("") } });
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setTimer(30);
    setCanResend(false);
    try {
      await authApi.forgetPassword(emailOrPhone);
      toast.success("OTP resent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP.");
    }
  };

  const tagline = (
    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
      Your Security, Our Priority.<br />
      <span className="text-[#EE641D]">Verify your identity.</span>
    </h2>
  );

  return (
    <AuthLayout title="Enter OTP" illustration={reset} tagline={tagline} step={2}>
      <div className="flex-1 flex flex-col justify-center">
        <form className="space-y-8" onSubmit={handleVerifyOtp}>
          <div className="space-y-2">

            <p className="text-gray-500 text-sm">
              Please enter the 6 digit code that send to <span className="font-semibold text-gray-700">{emailOrPhone}</span>.
            </p>
          </div>

          <div className="flex justify-center gap-6.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-15 h-15 border border-gray-200 rounded-xl text-center text-xl font-bold focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={16} />
              <span>00:{timer < 10 ? `0${timer}` : timer} sec</span>
            </div>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend}
              className={`${canResend ? "text-[#EE641D] hover:underline" : "text-gray-300 cursor-not-allowed"} font-medium`}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className={`w-full py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] font-bold ${!otp.some((d) => !d) && !loading
              ? "bg-[#EE641D] text-white shadow-lg hover:opacity-90"
              : "bg-[#f3f3f3] text-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <Link to="/login" className="text-red-400 font-semibold hover:underline">Back to Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
