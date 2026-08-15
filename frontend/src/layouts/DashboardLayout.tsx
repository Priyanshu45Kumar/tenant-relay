import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside>
        TenantRelay
      </aside>

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;