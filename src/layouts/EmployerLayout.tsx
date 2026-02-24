import { useState } from "react";
import Sidebar from "../components/Sidebar/sidebar";
import Header from "../components/Header/header";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const EmployerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const bgStyle = resolvedTheme === "dark"
    ? { background: "linear-gradient(180deg, #0f0a1a 0%, #1a1528 50%, #130e20 100%)" }
    : { background: "linear-gradient(180deg, #e4daf5 0%, #ede7f8 50%, #f5f0fc 100%)" };

  return (
    <div className="flex min-h-screen overflow-hidden transition-colors duration-300" style={bgStyle}>
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

export default EmployerLayout;
