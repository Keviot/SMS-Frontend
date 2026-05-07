import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOtp from './pages/VerifyOtp'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import AppLayout from './layout/AppLayout'
import AuthLayout from './layout/AuthLayout'
import collab from './assets/collab.png'
import reset from './assets/reset.png'

import ResidentManagement from './pages/admin/ResidentManagement'
import FinancialManagement from './pages/admin/FinancialManagement/Income'
import FacilityManagement from './pages/admin/FacilityManagement'
import ComplaintTracking from './pages/admin/ComplaintTracking'
import SecurityManagement from './pages/admin/SecurityManagement'
import SecurityGuard from './pages/admin/SecurityGuard'
import Announcement from './pages/admin/Announcement'
import Profile from './pages/admin/Profile'

function App() {
  return (
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
          <Route path="/financial-management" element={<FinancialManagement />} />
          <Route path="/facility-management" element={<FacilityManagement />} />
          <Route path="/complaint-tracking" element={<ComplaintTracking />} />
          <Route path="/security-management" element={<SecurityManagement />} />
          <Route path="/security-guard" element={<SecurityGuard />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
