import { useState, useEffect } from "react";
import { EyeOff, Eye, ChevronDown } from "lucide-react";
import sms from "../assets/sms.png"
import pattern from "../assets/pattern.png";
import collab from "../assets/collab.png";
import { authApi, societyApi } from "../services/api";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [societies, setSocieties] = useState<string[]>([]);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [illustration, setillustration] = useState(sms);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    state: "",
    city: "",
    society: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false
  });

  // Fetch societies on mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const data = await societyApi.getAll();
        if (Array.isArray(data)) {
          // If the API returns an array of strings
          setSocieties(data);
        } else if (data.societies) {
          // If the API returns an object with a societies array
          setSocieties(data.societies.map((s: any) => s.name || s));
        }
      } catch (error) {
        console.error("Error fetching societies:", error);
      }
    };
    fetchSocieties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const isFormValid =
    Object.entries(formData)
      .filter(([key]) => key !== "agreedToTerms")
      .every(([_, value]) => typeof value === "string" && value.trim() !== "") &&
    formData.agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (isFormValid) {
      setillustration(collab);
    }

    setLoading(true);
    try {
      const data = await authApi.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        society: formData.society,
        password: formData.password
      });

      if (data.success || !data.message) {
        alert("Registration Successful!");
      } else {
        alert(data.message || "Registration Failed.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-orange-100">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 items-center justify-center border-r border-gray-100">


        <div className="max-w-2xl w-full flex flex-col items-center">
          {/* Logo */}
          <div className="self-start mb-12 pl-4">
            <h1 className="text-4xl font-extrabold tracking-tighter">
              <span className="text-[#EE641D]">Dash</span><span className="text-[#121212]">Stack</span>
            </h1>
          </div>
          {/* Illustration */}
          <div className="relative w-full max-w-md aspect-square mb-12">
            <img
              src={illustration}
              alt="Society Management Illustration"
              className="w-full h-full object-contain drop-shadow-2xl animate-float"
            />
          </div>

          {/* Tagline */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Connect, Collaborate, and Control – <span className="text-[#EE641D]">Society Management</span> Simplified
            </h2>
            <div className="flex justify-center gap-2 mt-4">
              <div className="h-1.5 w-8 rounded-full bg-[#EE641D]/30"></div>
              <div className="h-1.5 w-8 rounded-full bg-[#EE641D]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#fdfdfd]">
        {/* Blurred Background Pattern Layer */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-100 scale-105"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#fdfdfd'
          }}
        ></div>

        {/* Subtle Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-1 bg-[radial-gradient(#EE641D_0.5px,transparent_0.5px)] [background-size:20px_20px]"></div>

        <div className="w-full max-w-[630px] h-[893px] bg-white rounded-3xl p-6 lg:p-10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 relative z-10 backdrop-blur-sm bg-white/95">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Registration</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">First Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Last Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter Last Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Email Address<span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Phone Number<span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="91+"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Country<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">State<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">City<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Select Society */}
            <div className="space-y-2 relative" id="society-dropdown">
              <label className="text-sm font-semibold text-gray-700 block">Select Society<span className="text-red-500">*</span></label>
              <div className="relative">
                <div
                  onClick={() => setShowSocietyDropdown(!showSocietyDropdown)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700 bg-transparent cursor-pointer flex justify-between items-center"
                >
                  <span className={formData.society ? "text-gray-700" : "text-gray-400"}>
                    {formData.society || "Select Society"}
                  </span>
                  <ChevronDown className={`text-gray-400 transition-transform ${showSocietyDropdown ? "rotate-180" : ""}`} size={20} />
                </div>

                {showSocietyDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="max-h-60 overflow-y-auto py-2">
                      {societies.map((soc) => (
                        <div
                          key={soc}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, society: soc }));
                            setShowSocietyDropdown(false);
                          }}
                          className="px-6 py-3 hover:bg-orange-50 text-gray-700 cursor-pointer transition-colors text-sm font-medium"
                        >
                          {soc}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-50">
                      <button
                        type="button"
                        onClick={(e) => {

                        }}
                        className="w-full bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
                      >
                        Create Society
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Password<span className="text-red-500">*</span></label>
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Confirm Password<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter Confirm Password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-[#EE641D] focus:ring-[#EE641D] transition-all cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
                I agree to all the <span className="text-red-500 font-medium">Terms</span> and <span className="text-red-500 font-medium">Privacy Policies.</span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 rounded-xl transition-all shadow-sm hover:shadow-md mt-6 active:scale-[0.98] font-bold ${isFormValid
                ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
                : "bg-[#f3f3f3] text-gray-400 cursor-not-allowed"
                }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account? <a href="#" className="text-red-500 font-semibold hover:underline">Login</a>
            </p>
          </form>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
       
      `}} />
      </div>
    </div>
  );
}
