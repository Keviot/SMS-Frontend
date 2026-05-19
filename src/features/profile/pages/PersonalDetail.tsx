import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Users, Car, CreditCard, AlertCircle, Clock, FileText, Eye } from "lucide-react";
import { authApi, announcementApi, financialApi, paymentApi } from "../../../services/api";
import toast from "react-hot-toast";
import Avatar from "../../../components/Avatar";
import { cn } from "../../../lib/cn";


export default function PersonalDetail() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [eventPayments, setEventPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"Owner" | "Tenant">("Owner");

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await authApi.getProfile();
      if (profileData.user) {
        setProfile(profileData.user);
        setActiveTab(profileData.user.residentStatus || "Owner");

        const societyId = profileData.user.society?._id || profileData.user.society;

        // Fetch announcements, maintenance and event payments in parallel
        const [announcementData, maintenanceData, eventPaymentData] = await Promise.all([
          societyId ? announcementApi.getAll(societyId) : Promise.resolve({ announcement: [] }),
          financialApi.getMaintenanceRecords(),
          import("../../../services/api").then(m => m.eventPaymentApi.get()).catch(() => ({ data: [] }))
        ]);

        setAnnouncements(announcementData.announcement || []);
        setMaintenanceRecords(maintenanceData.data || []);
        setEventPayments(eventPaymentData.data || []);
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

  const handleEventPayment = async (amount: number, eventId: string) => {
    try {
      const data = await paymentApi.createOrder(amount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "SMS Project",
        description: "Event Participation Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const societyId = profile.society?._id || profile.society;
            await import("../../../services/api").then(m => m.eventPaymentApi.create({
              event: eventId,
              resident: profile._id,
              amount: amount,
              payment: "Online",
              society: societyId,
              status: "Paid"
            }));
            toast.success("Participation Confirmed!");
            fetchData();
          } catch (err: any) {
            toast.error("Failed to record participation");
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

  const renderResidentDetails = () => (
    <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-stretch">
      {/* Avatar and Main Info - Mobile View */}
      <div className="flex flex-col gap-6 flex-1 xl:hidden">
        {/* Row with Avatar and Full Name */}
        <div className="flex items-center gap-6">
          <div className="h-28 w-28 shrink-0">
            <Avatar
              src={activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant") ? profile.profileImage : ""}
              name={activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant")
                ? (profile.name || `${profile.firstname} ${profile.lastname}`)
                : (profile.ownerName || "Property Owner")}
              size="lg"
              className="h-28 w-28 text-2xl border-5 border-[#DFE0EB] shadow-sm"
            />
          </div>
          <DetailItem
            label="Full Name"
            value={activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant")
              ? (profile.name || `${profile.firstname} ${profile.lastname}`)
              : (profile.ownerName || "Property Owner")}
          />
        </div>

        {/* Other details in a vertical stack */}
        <div className="flex flex-col gap-5 mt-0">
          {activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant") ? (
            <>
              <DetailItem label="Email Address" value={profile.email} />
              <DetailItem label="Phone Number" value={profile.phoneNumber} />

              <div className="grid grid-cols-3 gap-y-5 gap-x-2">
                <DetailItem label="Gender" value={profile.gender} isCapitalized />
                <DetailItem label="Relation" value={profile.relation || "Self"} />
                <DetailItem label="Age" value={profile.age} />
              </div>

              <div className="grid grid-cols-3 gap-y-5 gap-x-2">
                <DetailItem label="Wing" value={profile.wing} />
                <DetailItem label="Unit" value={profile.unit} />
              </div>
            </>
          ) : (
            <>
              <DetailItem label="Phone Number" value={profile.ownerPhone || "Not Provided"} />
              <DetailItem label="Email Address" value="N/A" />

              <div className="grid grid-cols-3 gap-y-5 gap-x-2">
                <DetailItem label="Gender" value="N/A" />
                <DetailItem label="Relation" value="Owner" />
                <DetailItem label="Age" value="N/A" />
              </div>

              <div className="grid grid-cols-3 gap-y-5 gap-x-2">
                <DetailItem label="Wing" value={profile.wing} />
                <DetailItem label="Unit" value={profile.unit} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Avatar and Main Info - Large Screen View */}
      <div className={cn(
        "hidden xl:flex items-start gap-8 flex-1",
        activeTab === (profile.residentStatus || "Owner") && "xl:border-r xl:border-gray-100 xl:pr-10 xl:mr-2"
      )}>
        <div className="h-32 w-32 shrink-0">
          <Avatar
            src={activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant") ? profile.profileImage : ""}
            name={activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant")
              ? (profile.name || `${profile.firstname} ${profile.lastname}`)
              : (profile.ownerName || "Property Owner")}
            size="lg"
            className="h-32 w-32 text-3xl border-5 border-[#DFE0EB] shadow-sm"
          />
        </div>

        <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-6 max-w-4xl">
          {activeTab === (profile.residentStatus === "Owner" ? "Owner" : "Tenant") ? (
            <>
              {/* Column 1 */}
              <div className="space-y-5">
                <DetailItem
                  label="Full Name"
                  value={profile.name || `${profile.firstname} ${profile.lastname}`}
                />
                <DetailItem label="Wing" value={profile.wing} />
              </div>
              {/* Column 2 */}
              <div className="space-y-5">
                <DetailItem label="Phone Number" value={profile.phoneNumber} />
                <DetailItem label="Age" value={profile.age} />
              </div>
              {/* Column 3 */}
              <div className="space-y-5">
                <DetailItem label="Email Address" value={profile.email} />
                <DetailItem label="Unit" value={profile.unit} />
              </div>
              {/* Column 4 */}
              <div className="space-y-5">
                <DetailItem label="Gender" value={profile.gender} isCapitalized />
                <DetailItem label="Relation" value={profile.relation || "Self"} />
              </div>
            </>
          ) : (
            <>
              {/* Column 1 */}
              <div className="space-y-5">
                <DetailItem
                  label="Full Name"
                  value={profile.ownerName || "Property Owner"}
                />
                <DetailItem label="Wing" value={profile.wing} />
              </div>
              {/* Column 2 */}
              <div className="space-y-5">
                <DetailItem label="Phone Number" value={profile.ownerPhone || "Not Provided"} />
                <DetailItem label="Age" value="N/A" />
              </div>
              {/* Column 3 */}
              <div className="space-y-5">
                <DetailItem label="Email Address" value="N/A" />
                <DetailItem label="Unit" value={profile.unit} />
              </div>
              {/* Column 4 */}
              <div className="space-y-5">
                <DetailItem label="Gender" value="N/A" />
                <DetailItem label="Relation" value="Owner" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Documents Section - Only show for current user */}
      {activeTab === (profile.residentStatus || "Owner") && (
        <div className="xl:w-80 shrink-0 space-y-3">
          {(!profile.uploadAadharfront && !profile.uploadAadharback && !profile.addressProof && !profile.rentAgreeMent) ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
              No documents uploaded
            </div>
          ) : (
            <div className="max-h-[148px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {profile.uploadAadharfront && <DocumentCard label="Aadhar Card Front" size="View File" url={profile.uploadAadharfront} />}
              {profile.uploadAadharback && <DocumentCard label="Aadhar Card Back" size="View File" url={profile.uploadAadharback} />}
              {profile.addressProof && <DocumentCard label="Address Proof" size="View File" url={profile.addressProof} />}
              {profile.rentAgreeMent && <DocumentCard label="Rent Agreement" size="View File" url={profile.rentAgreeMent} />}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-0 space-y-5 bg-[#F6F8FB] min-h-screen">
      {/* Header Breadcrumbs
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Home</span>
        <span className="text-gray-400">&gt;</span>
        <span className="text-[#5678E9] font-medium">Personal Detail</span>
      </div> */}

      <div className="flex flex-col">
        {/* Tabs Section */}
        <div className="relative z-10 flex w-full items-end -mb-[1px] mt-0">
          {profile.residentStatus?.toLowerCase() === "owner" ? (
            <div className="w-full max-w-[172px] sm:w-[172px] h-[49px] sm:shrink-0 text-base font-bold rounded-t-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white flex items-center justify-center">
              Owner
            </div>
          ) : (
            <div className="w-full max-w-[172px] sm:w-[172px] h-[49px] sm:shrink-0 text-base font-bold rounded-t-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white flex items-center justify-center">
              Tenant
            </div>
          )}
        </div>

        {/* Main Profile Card / Cards */}
        {profile.residentStatus?.toLowerCase() === "tenant" ? (
          <div className="space-y-6">
            {/* Card 1: Owner Details (Under tab) */}
            <div className="bg-white rounded-xl rounded-tl-none rounded-tr-none shadow-sm overflow-hidden border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <DetailItem label="Owner Name" value={profile.ownerName || "Property Owner"} />
                <DetailItem label="Owner Phone" value={profile.ownerPhone || "Not Provided"} />
                <DetailItem label="Owner Address" value={profile.ownerAddress || "Not Provided"} />
              </div>
            </div>

            {/* Card 2: Resident Profile Details (Separate Card) */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-6">
              {renderResidentDetails()}
            </div>
          </div>
        ) : (
          /* Single Card: Owner Profile Details */
          <div className="bg-white rounded-xl rounded-tl-none rounded-tr-none shadow-sm overflow-hidden border border-gray-100 p-6">
            {renderResidentDetails()}
          </div>
        )}
      </div>

      {/* Conditional Sections - Only show when viewing current resident profile */}
      {activeTab === (profile.residentStatus || "Owner") && (
        <div className="flex flex-col gap-6">
          {/* Members Section Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
            <h6 className="text-lg font-semibold text-gray-900">Member : ({profile.members?.length || 0})</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.members?.map((member: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col overflow-hidden">
                  <div className="bg-blue text-white px-4 py-2 rounded-t-lg -mx-5 -mt-5 font-bold text-sm">
                    {member.name}
                  </div>
                  <div className="space-y-2 pt-2 flex-1">
                    <MemberDetailItem label="Email" value={member.email} />
                    <MemberDetailItem label="Phone Number" value={member.phoneNumber} />
                    <MemberDetailItem label="Age" value={member.age} />
                    <MemberDetailItem label="Gender" value={member.gender} isCapitalized />
                    <MemberDetailItem label="Relation" value={member.relation} isCapitalized />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicles Section Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Vehicle : ({profile.vehicles?.length || 0})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.vehicles?.map((vehicle: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
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
        </div>
      )}

      {/* Maintenance Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex min-h-24 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Show Maintenance Details
          </h2>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:flex lg:items-center lg:gap-4">
            <div className="relative flex min-h-24 w-full flex-col justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white py-4 pl-8 pr-4 shadow-sm lg:w-64">
              <div className="absolute left-[-4px] top-1/2 h-10 w-2 -translate-y-1/2 rounded-full bg-[#39973D] opacity-60" />

              <div
                className="absolute -right-[1.5px] -top-[1.5px] h-20 w-16 rounded-tr-2xl border-r-[3px] border-t-2 border-[#39973D]"
                style={{
                  maskImage:
                    "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
                }}
              />

              <p className="text-sm font-semibold text-[#202224] opacity-70">
                Maintenance Amount
              </p>

              <p className="mt-1 text-2xl font-bold leading-8 text-[#39973D]">
                ₹{" "}
                {maintenanceRecords
                  .reduce((sum, r) => {
                    const isPending = r.status?.toLowerCase() === "pending";
                    const amount = r.maintenanceSetup?.maintenanceAmount || r.amount || 0;
                    return sum + (isPending ? Number(amount) : 0);
                  }, 0)
                  .toLocaleString()}
              </p>
            </div>

            <div className="relative flex min-h-24 w-full flex-col justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white py-4 pl-8 pr-4 shadow-sm lg:w-64">
              <div className="absolute left-[-4px] top-1/2 h-10 w-2 -translate-y-1/2 rounded-full bg-[#E74C3C] opacity-60" />

              <div
                className="absolute -right-[1.5px] -top-[1.5px] h-20 w-16 rounded-tr-2xl border-r-[3px] border-t-2 border-[#E74C3C]"
                style={{
                  maskImage:
                    "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
                }}
              />

              <p className="text-sm font-semibold text-[#202224] opacity-70">
                Penalty Amount
              </p>

              <p className="mt-1 text-2xl font-bold leading-8 text-[#E74C3C]">
                ₹{" "}
                {maintenanceRecords
                  .reduce((sum, r) => {
                    const isPending = r.status?.toLowerCase() === "pending";
                    const penalty = r.penalty || 0;
                    return sum + (isPending ? Number(penalty) : 0);
                  }, 0)
                  .toLocaleString()}
              </p>
            </div>
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
            announcements.map((announcement: any) => {
              const isEvent = Array.isArray(announcement.announcementType)
                ? announcement.announcementType[0] === "Event"
                : announcement.announcementType === "Event";
              const hasAmount = announcement.amount > 0;
              const hasParticipated = eventPayments.some(p => p.event?._id === announcement._id || p.event === announcement._id);

              return (
                <div key={announcement._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-3 flex flex-col">
                  <div className="bg-[#5678E9] text-white px-4 py-2 rounded-t-lg -mx-5 -mt-5 font-bold text-sm">
                    {announcement.title}
                  </div>
                  <div className="space-y-2 pt-2 flex-1">
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
                    {isEvent && hasAmount && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Participation Amount</span>
                        <span className="font-bold text-[#39973D] text-right">₹ {announcement.amount}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400">Description</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                        {announcement.description}
                      </p>
                    </div>
                  </div>

                  {isEvent && hasAmount && (
                    <div className="pt-2">
                      {hasParticipated ? (
                        <div className="w-full h-10 rounded-xl bg-green-50 text-[#39973D] flex items-center justify-center font-bold text-xs border border-green-100">
                          Already Participated
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEventPayment(announcement.amount, announcement._id)}
                          className="w-full h-10 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white font-bold text-xs shadow-md shadow-orange-500/10 hover:opacity-90 transition-all active:scale-[0.98]"
                        >
                          Participate Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
    <div className="space-y-0">
      <p className="text-lg font-medium text-[#202224]">{label}</p>
      <p className={`text-[#A7A7A7] text-lg font-normal break-all ${isCapitalized ? 'capitalize' : ''}`}>
        {value || "--"}
      </p>
    </div>
  );
}

function MemberDetailItem({ label, value, isCapitalized }: { label: string; value: any; isCapitalized?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`font-bold text-gray-800 text-right break-all ${isCapitalized ? 'capitalize' : ''}`}>
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
      <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
        <Eye size={14} />
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
