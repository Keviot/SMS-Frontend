import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../../layout/AuthLayout";
import FormInput from "../../../ui/FormInput";
import Button from "../../../ui/Button";
import { residentApi } from "../../../services/api";
import reset from "../../../assets/images/reset.png";

export default function CreatePassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setIsLoading(true);
      await residentApi.createPassword(token, formData.password, formData.confirmPassword);
      toast.success("Password created successfully! You can now login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to create password. The link may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Password"
      illustration={reset}
      step={1}
      tagline={
        <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
          Welcome to the Society!<br />
          <span className="text-[#EE641D]">Set your password to get started.</span>
        </h2>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="relative">
          <FormInput
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={formData.password}
            onChange={(val) => setFormData({ ...formData, password: val })}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-[41px] text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <FormInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-[41px] text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button type="submit" loading={isLoading} className="mt-2 h-12 w-full rounded-xl text-base font-bold">
          Create Password
        </Button>
      </form>
    </AuthLayout>
  );
}
