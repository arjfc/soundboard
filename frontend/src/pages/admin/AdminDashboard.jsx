import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScriptList from "./ScriptList";
import LogList from "./LogList";
import { 
  FiBook, 
  FiClock, 
  FiLogOut, 
  FiUser, 
  FiHome,
  FiSettings,
  FiBell,
  FiMenu,
  FiX
} from "react-icons/fi";

export default function AdminDashboard({ onLogout, initialView = "scripts" }) {
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    if (path.includes("/admin/scripts")) return "scripts";
    if (path.includes("/admin/logs")) return "logs";
    return initialView;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleViewChange = (newView) => {
    setView(newView);
    // Update URL without reloading
    navigate(`/admin/${newView}`);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.clear();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const userName = localStorage.getItem("name") || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  // Mock notifications
  const notifications = [
    { id: 1, text: "New script added", time: "5 min ago", read: false },
    { id: 2, text: "System update completed", time: "1 hour ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        hidden lg:block
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                AgentAI
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-700 transition"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="font-medium truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          <button
            onClick={() => handleViewChange("scripts")}
            className={`
              w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
              ${sidebarCollapsed ? 'justify-center' : ''}
              ${view === "scripts" 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <FiBook className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium flex-1 text-left">Scripts</span>
            )}
          </button>

          <button
            onClick={() => handleViewChange("logs")}
            className={`
              w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
              ${sidebarCollapsed ? 'justify-center' : ''}
              ${view === "logs" 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <FiClock className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium flex-1 text-left">Logs</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Page Title */}
              <h1 className="text-xl font-semibold text-gray-800 lg:text-2xl">
                {view === "scripts" ? "Script Management" : "Activity Logs"}
              </h1>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full relative"
                  >
                    <FiBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-700">Notifications</h3>
                      </div>
                      {notifications.map(notif => (
                        <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-indigo-50' : ''}`}>
                          <p className="text-sm text-gray-800">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {view === "scripts" && <ScriptList />}
            {view === "logs" && <LogList />}
          </div>
        </main>
      </div>
    </div>
  );
}