import { useState } from "react";
import Sidebar from "../components/Sidebar/sidebar";
import Header from "../components/Header/header";
import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// bg-gradient-to-br
  return (
    <div className="flex min-h-screen  from-gray-50 via-white to-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col w-full lg:ml-64 transition-all duration-300 h-screen overflow-hidden">
        {/* Header - fixed at top */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 max-w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
