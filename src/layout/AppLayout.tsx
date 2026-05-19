import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/45 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* Main content with responsive left margin */}
      <div className="min-h-screen lg:ml-[280px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content with responsive padding - prevents horizontal scroll */}
        <main className="overflow-x-hidden max-sm:mt-[20px] max-h-[calc(100vh-100px)] p-[15px] sm:p-[20px] lg:p-[30px] bg-[#F0F5FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
