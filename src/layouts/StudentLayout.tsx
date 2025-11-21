import Sidebar from "../components/Sidebar/sidebar";
import Header from "../components/Header/header";
import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <Header />

        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Student Panel</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
