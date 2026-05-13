import { useEffect, useState } from "react";
import { User,Mail , Phone, MapPin, Calendar, Users, Car, CreditCard, AlertCircle, Clock, FileText } from "lucide-react";
import { authApi, announcementApi, financialApi, paymentApi } from "../../../services/api";
import toast from "react-hot-toast";


export default function PersonalDetail() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"Owner" | "Tenant">("Owner");

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await authApi.getProfile();
      if (profileData.user) {
        setProfile(profileData.user);
        setActiveTab(profileData.user.residentStatus || "Owner");

        const societyId = profileData.user.society?._id || profileData.user.society;

        // Fetch announcements and maintenance in parallel
        const [announcementData, maintenanceData] = await Promise.all([
          societyId ? announcementApi.getAll(societyId) : Promise.resolve({ announcement: [] }),
          financialApi.getMaintenanceRecords()
        ]);

        setAnnouncements(announcementData.announcement || []);
        setMaintenanceRecords(maintenanceData.data || []);
      }
    } catch (error: any) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayment = async (amount: number, recordId: string) => {
    try {
      const data = await paymentApi.createOrder(amount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: data.order.amount,
        currency: data.order.currency,
        name: "SMS Project",
        description: "Resident Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            await paymentApi.verify({ ...response, recordId });
            toast.success("Payment Successful & Verified");
            // Refresh data to show updated status
            fetchData();
          } catch (err: any) {
            toast.error("Payment verification failed");
            console.error(err);
          }
        },
        prefill: {
          name: profile?.name || "Resident",
          email: profile?.email || "",
          contact: profile?.phoneNumber || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Payment initialization failed");
    }
  };



  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading personal details...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500 font-medium">Profile not found</div>;

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-[#F6F8FB] min-h-screen">
      {/* Header Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Home</span>
        <span className="text-gray-400">&gt;</span>
        <span className="text-[#5678E9] font-medium">Personal Detail</span>
      </div>

      {/* Tabs Section */}
      <div className="relative z-10 flex w-full items-end overflow-x-auto -mb-[1px]">
        {profile.residentStatus?.toLowerCase() === "owner" ? (
          <div className="min-h-14 min-w-32 shrink-0 px-8 py-4 text-sm font-bold rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white flex items-center justify-center">
            Owner
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("Tenant")}
              className={`min-h-14 min-w-32 shrink-0 px-8 py-4 text-sm font-bold transition-all ${
                activeTab === "Tenant"
                  ? "rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white"
                  : "rounded-t-xl border border-b-2 border-[#D9DCE5] border-b-[#F09619] bg-white text-[#202224] hover:bg-gray-50"
              }`}
            >
              Tenant
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Owner")}
              className={`min-h-14 min-w-32 shrink-0 px-8 py-4 text-sm font-bold transition-all ${
                activeTab === "Owner"
                  ? "rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white"
                  : "rounded-t-xl border border-b-2 border-[#D9DCE5] border-b-[#F09619] bg-white text-[#202224] hover:bg-gray-50"
              }`}
            >
              Owner
            </button>
          </>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-[20px] rounded-tl-none shadow-sm overflow-hidden border border-gray-100">
        <div className="p-8 flex flex-col xl:flex-row gap-8">
          {/* Avatar and Main Info */}
          <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
            <div className="h-32 w-32 rounded-full border-4 border-[#F6F8FB] overflow-hidden bg-gray-50 flex items-center justify-center">
              {activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant") && profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt="" 
                  className="h-full w-full object-cover"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=F6F8FB&color=5678E9&bold=true`;
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">
                  <User size={64} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 flex-1">
              {/* Show self data if active tab matches current status, otherwise show owner data for tenants */}
              {activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant") ? (
                <>
                  <DetailItem label="Full Name" value={profile.name || `${profile.firstname} ${profile.lastname}`} />
                  <DetailItem label="Phone Number" value={profile.phoneNumber} />
                  <DetailItem label="Email Address" value={profile.email} />
                  <DetailItem label="Gender" value={profile.gender} isCapitalized />
                  <DetailItem label="Wing" value={profile.wing} />
                  <DetailItem label="Age" value={profile.age} />
                  <DetailItem label="Unit" value={profile.unit} />
                  <DetailItem label="Relation" value={profile.relation || "Self"} />
                </>
              ) : (
                <>
                  <DetailItem label="Full Name" value={profile.ownerName || "Property Owner"} />
                  <DetailItem label="Phone Number" value={profile.ownerPhone || "Not Provided"} />
                  <DetailItem label="Email Address" value="N/A" />
                  <DetailItem label="Gender" value="N/A" />
                  <DetailItem label="Wing" value={profile.wing} />
                  <DetailItem label="Age" value="N/A" />
                  <DetailItem label="Unit" value={profile.unit} />
                  <DetailItem label="Relation" value="Owner" />
                </>
              )}
            </div>
          </div>

          {/* Documents Section - Only show for current user */}
          {activeTab === (profile.residentStatus || "Owner") && (
            <div className="xl:w-80 space-y-3">
              {profile.uploadAadharfront && <DocumentCard label="Aadhar Card Front" size="View File" url={profile.uploadAadharfront} />}
              {profile.uploadAadharback && <DocumentCard label="Aadhar Card Back" size="View File" url={profile.uploadAadharback} />}
              {profile.addressProof && <DocumentCard label="Address Proof" size="View File" url={profile.addressProof} />}
              {profile.rentAgreeMent && <DocumentCard label="Rent Agreement" size="View File" url={profile.rentAgreeMent} />}
              {!profile.uploadAadharfront && !profile.uploadAadharback && !profile.addressProof && !profile.rentAgreeMent && (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  No documents uploaded
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conditional Sections - Only show when viewing current resident profile */}
      {activeTab === (profile.residentStatus || "Owner") && (
        <>
          {/* Members Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Member : ({profile.members?.length || 0})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.members?.map((member: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-900">{member.name}</span>
                  </div>
                  <div className="space-y-2">
                    <MemberDetailItem label="Email" value={member.email} />
                    <MemberDetailItem label="Phone Number" value={member.phoneNumber} />
                    <MemberDetailItem label="Age" value={member.age} />
                    <MemberDetailItem label="Gender" value={member.gender} isCapitalized />
                    <MemberDetailItem label="Relation" value={member.relation} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicles Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Vehicle : ({profile.vehicles?.length || 0})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.vehicles?.map((vehicle: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
                  <div className="bg-[#5678E9] text-white px-4 py-2 rounded-t-lg -mx-5 -mt-5 font-bold text-sm">
                    {vehicle.vehicleType} Wheelers
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Vehicle Name</span>
                      <span className="text-sm font-bold text-gray-800">{vehicle.vehicleName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Vehicle Number</span>
                      <span className="text-sm font-bold text-gray-800">{vehicle.vehicleNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Maintenance Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Show Maintenance Details</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-xl shadow-sm">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Maintenance Amount</p>
              <p className="text-lg font-bold text-[#39973D]">
                ₹ {maintenanceRecords.reduce((sum, r) => {
                  const isPending = r.status?.toLowerCase() === "pending";
                  const amount = r.maintenanceSetup?.maintenanceAmount || r.amount || 0;
                  return sum + (isPending ? Number(amount) : 0);
                }, 0).toLocaleString()}
              </p>
            </div>
            <div className="h-8 w-1 bg-[#39973D] rounded-full opacity-20" />
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-xl shadow-sm">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Penalty Amount</p>
              <p className="text-lg font-bold text-[#E74C3C]">
                ₹ {maintenanceRecords.reduce((sum, r) => {
                  const isPending = r.status?.toLowerCase() === "pending";
                  const penalty = r.penalty || 0;
                  return sum + (isPending ? Number(penalty) : 0);
                }, 0).toLocaleString()}
              </p>
            </div>
            <div className="h-8 w-1 bg-[#E74C3C] rounded-full opacity-20" />
          </div>
        </div>
      </div>

      {/* Pending Maintenance Section */}
      {maintenanceRecords.filter(r => r.status?.toLowerCase() === "pending").length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Pending Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenanceRecords
              .filter(r => r.status?.toLowerCase() === "pending")
              .map((record) => (
                <MaintenanceCard 
                  key={record._id} 
                  record={record} 
                  status="Pending" 
                  onPay={(total) => handlePayment(total, record._id)}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Pending Maintenance</h2>
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
            No pending maintenance records found.
          </div>
        </div>
      )}

      {/* Due Maintenance Section */}
      {maintenanceRecords.filter(r => r.status?.toLowerCase() === "due").length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Due Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenanceRecords
              .filter(r => r.status?.toLowerCase() === "due")
              .map((record) => (
                <MaintenanceCard 
                  key={record._id} 
                  record={record} 
                  status="Due" 
                  onPay={(total) => handlePayment(total, record._id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Announcement Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Announcement Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {announcements.length > 0 ? (
            announcements.map((announcement: any) => (
              <div key={announcement._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-3">
                <div className="bg-[#5678E9] text-white px-4 py-2 rounded-t-lg -mx-5 -mt-5 font-bold text-sm">
                  {announcement.title}
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Announcement Date</span>
                    <span className="font-bold text-gray-800 text-right">
                      {new Date(announcement.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Announcement Time</span>
                    <span className="font-bold text-gray-800 text-right">{announcement.time}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400">Description</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                      {announcement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No announcements found for your society.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isCapitalized }: { label: string; value: any; isCapitalized?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className={`text-base font-bold text-gray-800 ${isCapitalized ? 'capitalize' : ''}`}>
        {value || "--"}
      </p>
    </div>
  );
}

function MemberDetailItem({ label, value, isCapitalized }: { label: string; value: any; isCapitalized?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold text-gray-800 text-right ${isCapitalized ? 'capitalize' : ''}`}>
        {value || "--"}
      </span>
    </div>
  );
}

function DocumentCard({ label, size, url }: { label: string; size: string; url?: string }) {
  const content = (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="bg-blue-50 p-2 rounded-lg">
        <FileText className="text-[#5678E9]" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{label}</p>
        <p className="text-[10px] text-gray-400 font-medium">{size}</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
        <Clock size={14} />
      </div>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {content}
      </a>
    );
  }

  return content;
}

function MaintenanceCard({ record, status, onPay }: { record: any; status: "Pending" | "Due"; onPay: (total: number) => void }) {
  const amount = Number(record.maintenanceSetup?.maintenanceAmount || record.amount || 0);
  const penalty = Number(record.penalty || 0);
  const total = amount + penalty;
  const date = record.date ? new Date(record.date).toLocaleDateString("en-GB") : "--";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 space-y-4">
      <div className="flex justify-between items-center bg-[#5678E9] text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 font-bold text-sm">
        <span>Maintenance</span>
        <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs">{status}</span>
      </div>
      <div className="space-y-2 pt-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{status === "Pending" ? "Bill Date" : "Date"}</span>
          <span className="font-bold text-gray-800">{date}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{status === "Pending" ? "Pending Date" : "Amount"}</span>
          <span className={`font-bold ${status === "Pending" ? "text-gray-800" : "text-green-600"}`}>
            {status === "Pending" ? date : amount.toLocaleString()}
          </span>
        </div>
        {status === "Pending" && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Maintenance Amount</span>
              <span className="font-bold text-red-500">{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Maintenance Penalty Amount</span>
              <span className="font-bold text-red-500">{penalty.toLocaleString()}</span>
            </div>
          </>
        )}
        {status === "Due" && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Due Maintenance Amount</span>
            <span className="font-bold text-red-500">{penalty.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-center border-t border-gray-50 pt-3">
          <span className="font-bold text-gray-900">Grand Total</span>
          <span className="font-bold text-[#39973D]">₹ {total.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={() => onPay(total)} className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white font-bold shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all active:scale-[0.98]">
        Pay Now
      </button>
    </div>
  );
}
