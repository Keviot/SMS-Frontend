import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/cn";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const emailOrPhone = formData.email.trim();
      const data = await authApi.login({
        password: formData.password,
        rememberMe: formData.rememberMe,
        ...(emailOrPhone.includes("@")
          ? { email: emailOrPhone }
          : { phoneNumber: emailOrPhone }),
      });
      if (data.success || data.token) {
        toast.success("Login Successful!");
        // Refetch profile to update AuthContext state
        await refetch();
      } else {
        const msg = data.message || "Login Failed.";
        setError(msg);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const errorMessage = err.message || "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="flex-1 flex flex-col justify-center">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email or Phone */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">
            Email or Phone<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Phone Number Or Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">
            Password<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className={cn(
                "w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-400 text-gray-700",
                error
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20"
              )}
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
          {error && (
            <p className="text-[13px] font-medium text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {error === "Incorrect Password" ? "Incorrect Password." : error}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-[#EE641D] focus:ring-[#EE641D] cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer select-none">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-xs text-[#EE641D] font-medium hover:underline">
            Forgot Password ?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={cn(
            "w-full py-4 rounded-xl transition-all shadow-sm hover:shadow-md mt-4 active:scale-[0.98] font-bold",
            isFormValid
              ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
              : "bg-[#f3f9ff] text-gray-400 cursor-not-allowed"
          )}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-400 font-semibold hover:underline">
            Registration
          </Link>
        </p>
      </form>
    </div>
  );
}
