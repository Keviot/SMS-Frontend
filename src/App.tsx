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
import PersonalDetail from './features/profile/pages/PersonalDetail'
import Income from './features/financialManagement/pages/Income'
import CreatePassword from './features/auth/pages/CreatePassword'
import Expense from './features/financialManagement/pages/Expense'
import Note from './features/financialManagement/pages/Note'
import CreateComplaint from './features/complaintTracking/pages/CreateComplaint'
import RequestTracking from './features/complaintTracking/pages/RequestTracking'

import { SocketProvider } from './context/SocketContext'
import VisitorLogs from './features/securityManagement/pages/VisitorLogs'
import SecurityProtocols from './features/securityManagement/pages/SecurityProtocols'
import ResidentSecurityProtocols from './features/securityManagement/pages/ResidentSecurityProtocols'
import SecurityGuard from './features/securityManagement/pages/SecurityGuard'
import EmergencyManagement from './features/securityManagement/pages/EmergencyManagement'


function App() {
  return (
    <SocketProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth Routes */}
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
                  Your Space, Your Place.<br /><span className="text-[#EE641D]">Society Management Made Simple.</span>
                </h2>
              }
            >
              <Login />
            </AuthLayout>
          } />
          <Route path="/create-password/:token" element={<CreatePassword />} />
          <Route path="/forgot-password" element={
            <AuthLayout
              title="Forget Password"
              illustration={reset}
              step={1}
              tagline={
                <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
                  Your Security, Our Priority.<br />
                  <span className="text-[#EE641D]">Reset your password securely.</span>
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
                  <span className="text-[#EE641D]">Verify your identity.</span>
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
                  <span className="text-[#EE641D]">Reset your password securely.</span>
                </h2>
              }
            >
              <ResetPassword />
            </AuthLayout>
          } />

          {/* App Routes (Sidebar + Header) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resident-management" element={<ResidentManagement />} />
            <Route path="/resident-management/add" element={<ResidentForm />} />
            <Route path="/resident-management/edit/:id" element={<ResidentForm />} />
            <Route path="/financial-management" element={<Income />} />
            <Route path="/financial-management/income" element={<Income />} />
            <Route path="/financial-management/expense" element={<Expense />} />
            <Route path="/financial-management/note" element={<Note />} />
            <Route path="/facility-management" element={<FacilityManagement />} />
            <Route path="/complaint-tracking" element={<CreateComplaint />} />
            <Route path="/complaint-tracking/create-complaint" element={<CreateComplaint />} />
            <Route path="/complaint-tracking/request-tracking" element={<RequestTracking />} />
            <Route path="/security-management" element={<SecurityManagement />} />
            <Route path="/security-management/visitor-logs" element={<VisitorLogs />} />
            <Route path="/security-management/security-protocols" element={<SecurityProtocols />} />
            <Route path="/security-management/protocols" element={<ResidentSecurityProtocols />} />
            <Route path="/security-management/emergency" element={<EmergencyManagement />} />
            <Route path="/security-guard" element={<SecurityGuard />} />
            <Route path="/announcement" element={<Announcement />} />
            <Route path="/profile" element={<PersonalDetail />} />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
  )
}


export default App
