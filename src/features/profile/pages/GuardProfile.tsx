import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Shield, Clock } from "lucide-react";
import { authApi } from "../../../services/api";
import toast from "react-hot-toast";
import Avatar from "../../../components/Avatar";

export default function GuardProfile() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const profileData = await authApi.getProfile();
            if (profileData.user) {
                setProfile(profileData.user);
            }
        } catch (error: any) {
            toast.error("Failed to load profile details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading profile details...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500 font-medium">Profile not found</div>;

    const fullName = `${profile.firstname} ${profile.lastname}`;

    return (
        <div className="p-4 lg:p-8 space-y-8 bg-[#F6F8FB] min-h-screen">
            {/* Header Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Home</span>
                <span className="text-gray-400">&gt;</span>
                <span className="text-secondary font-medium">Security Guard Profile</span>
            </div>

            {/* Profile Tab Header */}
            <div className="relative z-10 flex w-full items-end overflow-x-auto -mb-px">
                <div className="min-h-14 min-w-40 shrink-0 px-8 py-4 text-sm font-bold rounded-t-xl bg-linear-to-r from-[#FE512E] to-[#F09619] text-white flex items-center justify-center">
                    Guard Profile
                </div>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-[20px] rounded-tl-none shadow-sm overflow-hidden border border-gray-100">
                <div className="p-8 flex flex-col xl:flex-row gap-12">
                    {/* Avatar and Info Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-12 flex-1">
                        <div className="h-40 w-40 shrink-0">
                            <Avatar
                                src={profile.profileImage}
                                name={fullName}
                                size="lg"
                                className="h-40 w-40 text-4xl border-4 border-[#F6F8FB] shadow-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 flex-1">
                            <DetailItem icon={<User size={18} className="text-secondary" />} label="Full Name" value={fullName} />
                            <DetailItem icon={<Phone size={18} className="text-secondary" />} label="Phone Number" value={profile.phoneNumber} />
                            <DetailItem icon={<Mail size={18} className="text-secondary" />} label="Email Address" value={profile.email || "Not Provided"} />
                            <DetailItem icon={<Calendar size={18} className="text-secondary" />} label="Gender" value={profile.gender} isCapitalized />
                            <DetailItem icon={<Shield size={18} className="text-secondary" />} label="Shift" value={profile.shift} isCapitalized />
                            <DetailItem icon={<Clock size={18} className="text-secondary" />} label="Shift Time" value={profile.shiftTime} />
                            <DetailItem
                                icon={<Calendar size={18} className="text-secondary" />}
                                label="Shift Date"
                                value={profile.shiftDate ? new Date(profile.shiftDate).toLocaleDateString("en-GB") : "--"}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Guard Info / Role Section
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Job Description & Responsibilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-[#F6F8FB] rounded-xl space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Society</p>
                            <p className="text-base font-bold text-gray-800">{profile.society?.societyName || "Assigned Society"}</p>
                        </div>
                        <div className="p-4 bg-[#F6F8FB] rounded-xl space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employment Status</p>
                            <p className="text-base font-bold text-green-600">Active</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            As a security guard for this society, your primary responsibility is to ensure the safety and security of all residents and property. This includes monitoring visitor entry/exit logs, handling emergency alerts, and conducting regular patrols as per society protocols.
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-500 space-y-2 ml-2">
                            <li>Maintain accurate Visitor Tracking logs</li>
                            <li>Respond promptly to Emergency Management alerts</li>
                            <li>Uphold Security Protocols established by administration</li>
                            <li>Ensure all entry points are secured during shift</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-[#EEF3FF] flex items-center justify-center text-secondary">
                        <Shield size={40} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Security Access</h3>
                        <p className="text-sm text-gray-500 mt-1">Your account has authorized access to the Security Management module.</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/security-management/visitor-logs'}
                        className="w-full py-3 px-6 rounded-xl bg-secondary text-white font-bold hover:bg-[#4564d8] transition-colors"
                    >
                        Go to Visitor Logs
                    </button>
                </div>
            </div> */}
        </div>
    );
}

function DetailItem({ label, value, isCapitalized, icon }: { label: string; value: any; isCapitalized?: boolean; icon?: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                {icon}
                <p className="text-sm text-gray-400 font-medium">{label}</p>
            </div>
            <p className={`text-base font-bold text-gray-800 ml-6 ${isCapitalized ? 'capitalize' : ''}`}>
                {value || "--"}
            </p>
        </div>
    );
}
