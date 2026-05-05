import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { authApi } from "../services/api";
import collab from "../assets/collab.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(formData);
      if (data.success || data.token) {
        alert("Login Successful!");
        // Redirect to dashboard
      } else {
        alert(data.message || "Login Failed.");
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email.trim() !== "" && formData.password.trim() !== "";

  return (
    <AuthLayout title="Login" illustration={collab} tagline={<h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
      Your Space, Your Place.<br /><span className="text-[#EE641D]">Society Management Made Simple.</span>
    </h2>}>
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
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
            className={`w-full py-4 rounded-xl transition-all shadow-sm hover:shadow-md mt-4 active:scale-[0.98] font-bold ${isFormValid
              ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
              : "bg-[#f3f9ff] text-gray-400 cursor-not-allowed"
              }`}
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
    </AuthLayout>
  );
}
