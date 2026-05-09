import { useState, useEffect } from "react";
import { EyeOff, Eye, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, societyApi } from "../services/api";
import CreateSocietyModal from "../components/modals/CreateSocietyModal";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [societies, setSocieties] = useState<string[]>([]);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    country: "",
    state: "",
    city: "",
    selectSociety: "",
    password: "",
    confirmPassword: "",
    privacyPolicy: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch societies on mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const data = await societyApi.getAll();
        if (Array.isArray(data)) {
          // If the API returns an array of objects/strings, normalize to strings
          setSocieties(data.map((s: any) => (typeof s === 'object' ? s.societyName : s)));
        } else if (data.societies) {
          // If the API returns an object with a societies array
          setSocieties(data.societies.map((s: any) => (typeof s === 'object' ? s.societyName : s)));
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

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const isFormValid =
    Object.entries(formData)
      .filter(([key]) => key !== "privacyPolicy")
      .every(([_, value]) => typeof value === "string" && value.trim() !== "") &&
    formData.privacyPolicy;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstname.trim()) newErrors.firstname = "First Name is required.";
    if (!formData.lastname.trim()) newErrors.lastname = "Last Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Incorrect Email Address.";
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.selectSociety) newErrors.selectSociety = "Please select a society.";
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }
    if (!formData.privacyPolicy) newErrors.privacyPolicy = "You must agree to the terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.signup({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        selectSociety: formData.selectSociety,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        privacyPolicy: formData.privacyPolicy
      });

      if (data.success) {
        toast.success("Registration Successful!");

        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          phoneNumber: "",
          country: "",
          state: "",
          city: "",
          selectSociety: "",
          password: "",
          confirmPassword: "",
          privacyPolicy: false
        });

        // Redirect to login after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Registration Failed.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSociety = async (newSocietyData: any) => {
    try {
      const data = await societyApi.create({
        societyName: newSocietyData.name,
        societyAddress: newSocietyData.address,
        country: newSocietyData.country,
        state: newSocietyData.state,
        city: newSocietyData.city,
        zipCode: newSocietyData.zipCode
      });
      setSocieties(prev => [...prev, newSocietyData.name]);
      setFormData(prev => ({ ...prev, selectSociety: newSocietyData.name }));
      toast.success(data.message || "Society created successfully!");
    } catch (error: any) {
      console.error("Error creating society:", error);
      toast.error(error.message || "Error creating society");
    }
  };

  return (
    <>
      <form className="space-y-3.5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* First Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">First Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.firstname ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Last Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.lastname ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Email Address<span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email Address"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Phone Number<span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="91+"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.phoneNumber ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Country */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Country<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter Name"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.country ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">State<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter Name"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.state ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">City<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter Name"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.city ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
        </div>

        {/* Select Society */}
        <div className="space-y-1 relative" id="society-dropdown">
          <label className="text-sm font-semibold text-gray-700 block">Select Society<span className="text-red-500">*</span></label>
          <div className="relative">
            <div
              onClick={() => setShowSocietyDropdown(!showSocietyDropdown)}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.selectSociety ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700 bg-transparent cursor-pointer flex justify-between items-center`}
            >
              <span className={formData.selectSociety ? "text-gray-700" : "text-gray-400"}>
                {(formData.selectSociety as any)?.societyName || (formData.selectSociety as any) || "Select Society"}
              </span>
              <ChevronDown className={`text-gray-400 transition-transform ${showSocietyDropdown ? "rotate-180" : ""}`} size={20} />
            </div>
            {errors.selectSociety && <p className="text-red-500 text-xs mt-1">{errors.selectSociety}</p>}

            {showSocietyDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="max-h-60 overflow-y-auto py-2">
                  {societies.map((soc: any, i: number) => {
                    if (!soc) return null;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, selectSociety: soc }));
                          setShowSocietyDropdown(false);
                        }}
                        className="px-6 py-2.5 hover:bg-orange-50 text-gray-700 cursor-pointer transition-colors text-sm font-medium"
                      >
                        {soc}
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                      setShowSocietyDropdown(false);
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
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Password<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className={`w-full px-4 py-3 rounded-xl border ${errors.password ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Confirm Password<span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Enter Confirm Password"
              className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? "border-red-500" : "border-gray-200"} focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="terms"
              name="privacyPolicy"
              checked={formData.privacyPolicy}
              onChange={handleChange}
              className={`w-5 h-5 rounded border ${errors.privacyPolicy ? "border-red-500" : "border-gray-300"} text-[#EE641D] focus:ring-[#EE641D] transition-all cursor-pointer`}
            />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
              I agree to all the <span className="text-red-500 font-medium">Terms</span> and <span className="text-red-500 font-medium">Privacy Policies.</span>
            </label>
          </div>
          {errors.privacyPolicy && <p className="text-red-500 text-xs">{errors.privacyPolicy}</p>}
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full py-4 rounded-xl transition-all shadow-sm hover:shadow-md mt-2 active:scale-[0.98] font-bold ${isFormValid
            ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
            : "bg-[#f3f3f3] text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-red-500 font-semibold hover:underline">Login</Link>
        </p>
      </form>

      <CreateSocietyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateSociety}
      />
    </>
  );
}
