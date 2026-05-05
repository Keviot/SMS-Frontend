import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import forgetImg from "../assets/forget.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("OTP sent to your email/phone!");
    }, 1500);
  };

  const isFormValid = email.trim() !== "";

  const tagline = (
    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
      Your Security, Our Priority.<br />
      <span className="text-[#EE641D]">Reset your password securely.</span>
    </h2>
  );

  return (
    <AuthLayout 
      title="Forget Password" 
      illustration={forgetImg}
      tagline={tagline}
    >
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-gray-500 mb-8 text-sm">
          Enter your email and we'll send you a otp to reset your password.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email or Phone */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              Email or Phone<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email or Phone number"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
              required
            />
          </div>

          {/* Get OTP Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full py-4 rounded-xl transition-all shadow-sm hover:shadow-md mt-4 active:scale-[0.98] font-bold ${
              isFormValid
                ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
                : "bg-[#f3f9ff] text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Sending..." : "Get OTP"}
          </button>

          {/* Back to Login Link */}
          <p className="text-center text-sm">
            <Link to="/login" className="text-red-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
