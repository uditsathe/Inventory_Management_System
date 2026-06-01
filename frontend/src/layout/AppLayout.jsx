import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function isDashboardPath(pathname) {
  return pathname === "/dashboard" || pathname === "/";
}

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => !isDashboardPath(pathname)
  );

  useEffect(() => {
    setSidebarCollapsed(!isDashboardPath(pathname));
  }, [pathname]);

  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onExpand={() => setSidebarCollapsed(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
