import { useEffect, useState } from "react";
import { FiClock, FiUser, FiPlay, FiFilter, FiSearch, FiRefreshCw } from "react-icons/fi";

export default function LogList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Not authenticated. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      const res = await fetch("http://localhost:5000/api/logs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on search and type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.script?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    // Add more filter logic here if you have different log types
    return matchesSearch;
  });

  const handleRefresh = () => {
    fetchLogs();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-500">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with title and refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-800">Script Play Logs</h2>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            title="Refresh logs"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or script..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Logs</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Script</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Played At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <FiUser className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {log.user?.name || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {log.user?.email || ""}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FiPlay className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-900">
                        {log.script?.name || "Unknown Script"}
                      </span>
                    </div>
                    {log.script?.type && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        {log.script.type}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="w-4 h-4 mr-1" />
                      {log.playedAt ? new Date(log.playedAt).toLocaleString() : "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Completed
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No logs found</p>
                  <p className="text-sm">
                    {searchTerm 
                      ? "Try adjusting your search" 
                      : "Script play logs will appear here"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {filteredLogs.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
          <span>
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
          <span className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}