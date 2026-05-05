import { useState, useEffect } from "react";
import { EyeOff, Eye, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import sms from "../assets/sms.png"
import collab from "../assets/collab.png";
import { authApi, societyApi } from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import Modal from "../components/ui/Modal";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [societies, setSocieties] = useState<string[]>([]);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [illustration, setIllustration] = useState(sms);

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
  const [newSociety, setNewSociety] = useState({
    name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: ""
  });

  // Fetch societies on mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const data = await societyApi.getAll();
        if (Array.isArray(data)) {
          // If the API returns an array of objects/strings, normalize to strings
          setSocieties(data.map((s: any) => (typeof s === 'object' ? s.name : s)));
        } else if (data.societies) {
          // If the API returns an object with a societies array
          setSocieties(data.societies.map((s: any) => (typeof s === 'object' ? s.name : s)));
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
      .filter(([key]) => key !== "privacyPolicy")
      .every(([_, value]) => typeof value === "string" && value.trim() !== "") &&
    formData.privacyPolicy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (isFormValid) {
      setIllustration(collab);
    }

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

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSociety(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await societyApi.create(newSociety);
      if (data.success) {
        setSocieties(prev => [...prev, newSociety.name]);
        setFormData(prev => ({ ...prev, selectSociety: newSociety.name }));
        setIsModalOpen(false);
        setNewSociety({ name: "", address: "", country: "", state: "", city: "", zipCode: "" });
        alert("Society created successfully!");
      }
    } catch (error) {
      console.error("Error creating society:", error);
    }
  };

  return (
    <AuthLayout title="Registration" illustration={illustration}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">First Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Last Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all placeholder:text-gray-400 text-gray-700"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] focus:ring-2 focus:ring-[#EE641D]/20 outline-none transition-all text-gray-700 bg-transparent cursor-pointer flex justify-between items-center"
            >
              <span className={formData.selectSociety ? "text-gray-700" : "text-gray-400"}>
                {(formData.selectSociety as any)?.name || (formData.selectSociety as any) || "Select Society"}
              </span>
              <ChevronDown className={`text-gray-400 transition-transform ${showSocietyDropdown ? "rotate-180" : ""}`} size={20} />
            </div>

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
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="terms"
            name="privacyPolicy"
            checked={formData.privacyPolicy}
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

      {/* Create Society Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Society"
      >
        <form onSubmit={handleCreateSociety} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Society Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={newSociety.name}
              onChange={handleModalChange}
              placeholder="Society Name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] outline-none transition-all text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Society Address<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={newSociety.address}
              onChange={handleModalChange}
              placeholder="Society Address"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] outline-none transition-all text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Country<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="country"
                value={newSociety.country}
                onChange={handleModalChange}
                placeholder="Country"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] outline-none transition-all text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">State<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="state"
                value={newSociety.state}
                onChange={handleModalChange}
                placeholder="State"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] outline-none transition-all text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">City<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="city"
                value={newSociety.city}
                onChange={handleModalChange}
                placeholder="City"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] outline-none transition-all text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Zip Code<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="zipCode"
                value={newSociety.zipCode}
                onChange={handleModalChange}
                placeholder="Zip Code"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EE641D] outline-none transition-all text-sm"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white font-semibold shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </AuthLayout>
  );
}
