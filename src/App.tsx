import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import AppLayout from './layout/AppLayout'
import AuthLayout from './layout/AuthLayout'
import collab from './assets/images/collab.png'
import reset from './assets/images/reset.png'

import { SocketProvider } from './context/SocketContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { getRoleHomePath } from './utils/roleRoutes'

const Register = lazy(() => import('./features/auth/pages/Register'))
const Login = lazy(() => import('./features/auth/pages/Login'))
const ForgotPassword = lazy(() => import('./features/auth/pages/ForgotPassword'))
const VerifyOtp = lazy(() => import('./features/auth/pages/VerifyOtp'))
const ResetPassword = lazy(() => import('./features/auth/pages/ResetPassword'))
const CreatePassword = lazy(() => import('./features/auth/pages/CreatePassword'))
const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'))
const ResidentManagement = lazy(() => import('./features/residentManagement/pages/ResidentManagement'))
const ResidentForm = lazy(() => import('./features/residentManagement/pages/ResidentForm'))
const FacilityManagement = lazy(() => import('./features/facilityManagement/pages/FacilityManagement'))
const SecurityManagement = lazy(() => import('./features/securityManagement/pages/SecurityProtocols'))
const Announcement = lazy(() => import('./features/announcement/pages/Announcement'))
const ProfileSelector = lazy(() => import('./features/profile/pages/ProfileSelector'))
const Income = lazy(() => import('./features/financialManagement/pages/Income'))
const Expense = lazy(() => import('./features/financialManagement/pages/Expense'))
const Note = lazy(() => import('./features/financialManagement/pages/Note'))
const CreateComplaint = lazy(() => import('./features/complaintTracking/pages/CreateComplaint'))
const RequestTracking = lazy(() => import('./features/complaintTracking/pages/RequestTracking'))
const VisitorLogs = lazy(() => import('./features/securityManagement/pages/VisitorLogs'))
const SecurityProtocols = lazy(() => import('./features/securityManagement/pages/SecurityProtocols'))
const ResidentSecurityProtocols = lazy(() => import('./features/securityManagement/pages/ResidentSecurityProtocols'))
const SecurityGuard = lazy(() => import('./features/securityManagement/pages/SecurityGuard'))
const EventsParticipation = lazy(() => import('./features/eventsParticipation/pages/EventsParticipation'))
const ShowMaintenanceDetails = lazy(() => import('./features/paymentPortal/pages/ShowMaintenanceDetails'))
const MaintenanceInvoices = lazy(() => import('./features/paymentPortal/pages/MaintenanceInvoices'))
const OtherInvoices = lazy(() => import('./features/paymentPortal/pages/OtherInvoices'))
const EventInvoices = lazy(() => import('./features/paymentPortal/pages/EventInvoices'))
const EmergencyManagement = lazy(() => import('./features/securityManagement/pages/EmergencyManagement'))
const AccessForums = lazy(() => import('./features/community/pages/AccessForums'))
const Polls = lazy(() => import('./features/community/pages/Polls'))
const CommunitiesDiscussion = lazy(() => import('./features/community/pages/CommunitiesDiscussion'))
const GlobalCallHandler = lazy(() => import('./components/GlobalCallHandler'))

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FE512E] border-t-transparent" />
  </div>
);

const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FE512E] border-t-transparent" />
    </div>
  );
  return <Navigate to={user && role ? getRoleHomePath(role) : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" reverseOrder={false} />
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />

            {/* Public Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/register" element={
                <AuthLayout title="Registration" step={1}>
                  <Register />
                </AuthLayout>
              } />
              <Route path="/login" element={
                <AuthLayout
                  title="Login"
                  illustration={collab}
                  step={2}
                  tagline={
                    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
                      Your Space, Your Place.<br /><span className="text-primary">Society Management Made Simple.</span>
                    </h2>
                  }
                >
                  <Login />
                </AuthLayout>
              } />
              <Route path="/forgot-password" element={
                <AuthLayout
                  title="Forget Password"
                  illustration={reset}
                  step={1}
                  tagline={
                    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
                      Your Security, Our Priority.<br />
                      <span className="text-primary">Reset your password securely.</span>
                    </h2>
                  }
                >
                  <ForgotPassword />
                </AuthLayout>
              } />
              <Route path="/verify-otp" element={
                <AuthLayout
                  title="Enter OTP"
                  illustration={reset}
                  step={2}
                  tagline={
                    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
                      Your Security, Our Priority.<br />
                      <span className="text-primary">Verify your identity.</span>
                    </h2>
                  }
                >
                  <VerifyOtp />
                </AuthLayout>
              } />
              <Route path="/reset-password" element={
                <AuthLayout
                  title="Reset Password"
                  illustration={reset}
                  step={2}
                  tagline={
                    <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
                      Your Security, Our Priority.<br />
                      <span className="text-primary">Reset your password securely.</span>
                    </h2>
                  }
                >
                  <ResetPassword />
                </AuthLayout>
              } />
            </Route>

            <Route path="/create-password/:token" element={<CreatePassword />} />
                            <Route path="/security-guard/create-password/:token" element={<CreatePassword />} />


            {/* Protected Routes */}
            <Route element={<AppLayout />}>
              {/* Common Protected Routes (Admin & Resident) */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "resident"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/complaint-tracking" element={<CreateComplaint />} />
                <Route path="/complaint-tracking/create-complaint" element={<CreateComplaint />} />
                <Route path="/community/access-forums" element={<AccessForums />} />
                <Route path="/community/polls" element={<Polls />} />
                <Route path="/community/discussion" element={<CommunitiesDiscussion />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/resident-management" element={<ResidentManagement />} />
                <Route path="/resident-management/add" element={<ResidentForm />} />
                <Route path="/resident-management/edit/:id" element={<ResidentForm />} />
                <Route path="/financial-management" element={<Income />} />
                <Route path="/financial-management/income" element={<Income />} />
                <Route path="/financial-management/expense" element={<Expense />} />
                <Route path="/financial-management/note" element={<Note />} />
                <Route path="/facility-management" element={<FacilityManagement />} />
                <Route path="/complaint-tracking/request-tracking" element={<RequestTracking />} />
                <Route path="/security-management" element={<SecurityManagement />} />
                <Route path="/security-management/security-protocols" element={<SecurityProtocols />} />
                <Route path="/security-guard" element={<SecurityGuard />} />
                <Route path="/announcement" element={<Announcement />} />
                <Route path="/community/access-forums" element={<AccessForums />} />
                <Route path="/community/polls" element={<Polls />} />
                <Route path="/community/discussion" element={<CommunitiesDiscussion />} />
              </Route>

              {/* Shared by Admin, Resident, and Security */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "resident", "security"]} />}>
                <Route path="/profile" element={<ProfileSelector />} />
              </Route>

              {/* Resident Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["resident"]} />}>
                <Route path="/events-participation" element={<EventsParticipation />} />
                <Route path="/payment-portal" element={<ShowMaintenanceDetails />} />
                <Route path="/payment-portal/maintenance-invoices" element={<MaintenanceInvoices />} />
                <Route path="/payment-portal/other-invoices" element={<OtherInvoices />} />
                <Route path="/payment-portal/event-invoices" element={<EventInvoices />} />
                <Route path="/community/access-forums" element={<AccessForums />} />
                <Route path="/community/polls" element={<Polls />} />
                <Route path="/community/discussion" element={<CommunitiesDiscussion />} />
                <Route path="/security-management/protocols" element={<ResidentSecurityProtocols />} />
              </Route>

              {/* Security Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["security"]} />}>
                <Route path="/security-management/emergency" element={<EmergencyManagement />} />
              </Route>

              {/* Shared by Admin and Security */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "security"]} />}>
                <Route path="/security-management/visitor-logs" element={<VisitorLogs />} />
              </Route>
            </Route>
            </Routes>
          </Suspense>
        </Router>
        <Suspense fallback={null}>
          <GlobalCallHandler />
        </Suspense>
    </SocketProvider>
    </AuthProvider>
  )
}


export default App

