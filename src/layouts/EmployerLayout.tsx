import { useState } from "react";
import Sidebar from "../components/Sidebar/sidebar";
import Header from "../components/Header/header";
import { Outlet } from "react-router-dom";

const EmployerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 w-full lg:ml-64 transition-all duration-300 overflow-x-hidden">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployerLayout;
