import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Register from './features/auth/pages/Register'
import Login from './features/auth/pages/Login'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import VerifyOtp from './features/auth/pages/VerifyOtp'
import ResetPassword from './features/auth/pages/ResetPassword'
import Dashboard from './features/dashboard/pages/Dashboard'
import AppLayout from './layout/AppLayout'
import AuthLayout from './layout/AuthLayout'
import collab from './assets/images/collab.png'
import reset from './assets/images/reset.png'

import ResidentManagement from './features/residentManagement/pages/ResidentManagement'
import ResidentForm from './features/residentManagement/pages/ResidentForm'
import FacilityManagement from './features/facilityManagement/pages/FacilityManagement'
import SecurityManagement from './features/securityManagement/pages/SecurityProtocols'
import Announcement from './features/announcement/pages/Announcement'
import ProfileSelector from './features/profile/pages/ProfileSelector'
import Income from './features/financialManagement/pages/Income'
import CreatePassword from './features/auth/pages/CreatePassword'
import Expense from './features/financialManagement/pages/Expense'
import Note from './features/financialManagement/pages/Note'
import CreateComplaint from './features/complaintTracking/pages/CreateComplaint'
import RequestTracking from './features/complaintTracking/pages/RequestTracking'

import { SocketProvider } from './context/SocketContext'
import GlobalCallHandler from './components/GlobalCallHandler'
import VisitorLogs from './features/securityManagement/pages/VisitorLogs'
import SecurityProtocols from './features/securityManagement/pages/SecurityProtocols'
import ResidentSecurityProtocols from './features/securityManagement/pages/ResidentSecurityProtocols'
import SecurityGuard from './features/securityManagement/pages/SecurityGuard'
import EventsParticipation from './features/eventsParticipation/pages/EventsParticipation'
import ShowMaintenanceDetails from './features/paymentPortal/pages/ShowMaintenanceDetails'
import MaintenanceInvoices from './features/paymentPortal/pages/MaintenanceInvoices'
import OtherInvoices from './features/paymentPortal/pages/OtherInvoices'
import EventInvoices from './features/paymentPortal/pages/EventInvoices'


import EmergencyManagement from './features/securityManagement/pages/EmergencyManagement'
import AccessForums from './features/community/pages/AccessForums'
import Polls from './features/community/pages/Polls'
import CommunitiesDiscussion from './features/community/pages/CommunitiesDiscussion'

import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { getRoleHomePath } from './utils/roleRoutes'

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
        </Router>
        <GlobalCallHandler />
    </SocketProvider>
    </AuthProvider>
  )
}


export default App

