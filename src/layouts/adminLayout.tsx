import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/sidebar";
import Header from "../components/Header/header";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
