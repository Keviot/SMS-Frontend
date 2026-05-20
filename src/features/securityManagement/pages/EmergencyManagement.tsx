import { useState, useEffect } from "react";
import { authApi } from "../../../services/api";
import EmergencyAlertForm from "../../../components/security panel/EmergencyAlertForm";

export default function EmergencyManagement() {
    const [societyId, setSocietyId] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await authApi.getProfile();
                if (profile.user?.society) {
                    setSocietyId(profile.user.society);
                } else if (profile.user?.societies?.length > 0) {
                    setSocietyId(profile.user.societies[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="w-full">
            {/* <div className="mb-6 flex items-center gap-2 text-sm text-[#A7A7A7]">
                <span className="font-semibold text-[#202224]">Home</span>
                <span>&gt;</span>
                <span className="font-semibold text-[#5678E9]">Emergency Management</span>
            </div> */}

            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
                <EmergencyAlertForm societyId={societyId} />
            </div>
        </div>
    );
}

