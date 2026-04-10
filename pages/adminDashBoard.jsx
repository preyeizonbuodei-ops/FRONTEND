import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUsers, FaTrash, FaDownload, FaSearch, FaSyncAlt, FaBars, FaTimes 
} from "react-icons/fa";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDownloadError, setShowDownloadError] = useState(false);
  const [downloadErrorMsg, setDownloadErrorMsg] = useState("");

  const api = axios.create({
    baseURL: 'https://free-electrical-learning-backend.onrender.com',
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/auth/v1/user/get-all-trianees');
      const userList = Array.isArray(response.data) 
        ? response.data 
        : response.data?.users || response.data?.data || [];

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login';
      } else {
        setError(err.response?.data?.message || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadUserDoc = async (traineeId) => {
    try {
      const response = await api.get(`/api/auth/v1/user/download-one-trainee-pdf/${traineeId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trainee_${traineeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadErrorMsg("Failed to download trainee document.");
      setShowDownloadError(true);
    }
  };

  const deleteUser = async (traineeId) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      await api.delete(`/api/auth/v1/user/delete-trainee/${traineeId}`);
      const updated = users.filter(u => u._id !== traineeId);
      setUsers(updated);
      setFilteredUsers(updated);
      alert("User deleted successfully");
    } catch (err) {
      alert("Delete failed");
    }
  };

  const downloadAllPDF = async () => {
    try {
      const response = await api.get("/api/auth/v1/user/download-trainees-pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all-trainees.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const result = users.filter(user =>
      (user.username || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term) ||
      (user.department || "").toLowerCase().includes(term)
    );
    setFilteredUsers(result);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }
    fetchAllUsers();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 
        transition-transform flex flex-col`}>

        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">A</div>
            <h1 className="text-2xl font-semibold">AdminHub</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="flex-1 p-6">
          <div className="flex items-center gap-3 px-5 py-4 bg-slate-800 rounded-3xl text-white">
            <FaUsers className="text-xl" />
            <span className="font-medium">All Trainees</span>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 rounded-3xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden text-2xl text-slate-400"
            >
              <FaBars />
            </button>
            <h1 className="text-xl lg:text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-slate-800 border border-slate-700 focus:border-violet-500 w-64 lg:w-80 pl-11 pr-6 py-3 rounded-3xl text-sm outline-none"
              />
            </div>

            {/* Refresh */}
            <button 
              onClick={fetchAllUsers} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-3xl transition-colors"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Download All PDF */}
            <button 
              onClick={downloadAllPDF}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-3xl font-medium transition-all"
            >
              <FaDownload />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Total Count */}
            <div className="hidden sm:block px-5 py-3 bg-slate-800 rounded-3xl font-medium text-violet-400">
              Total: {users.length}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Registered Trainees</h2>

            {loading && <div className="text-center py-20 text-slate-400">Loading users...</div>}
            
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-400 p-8 rounded-3xl text-center">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]"> {/* Prevents table from shrinking too much */}
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700">
                        <th className="text-left py-5 px-6 whitespace-nowrap">NAME</th>
                        <th className="text-left py-5 px-6 whitespace-nowrap">EMAIL</th>
                        <th className="text-left py-5 px-6 hidden md:table-cell whitespace-nowrap">DEPARTMENT</th>
                        <th className="text-left py-5 px-6 hidden lg:table-cell whitespace-nowrap">PHONE</th>
                        <th className="text-left py-5 px-6 whitespace-nowrap">VALIDATION CODE</th>
                        <th className="text-center py-5 px-6 whitespace-nowrap">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/70 transition-colors">
                          <td className="py-5 px-6 font-medium">{user.username}</td>
                          <td className="py-5 px-6 text-sm">{user.email}</td>
                          <td className="py-5 px-6 hidden md:table-cell">
                            <span className="px-4 py-1 bg-slate-700 text-xs rounded-3xl">
                              {user.department || "N/A"}
                            </span>
                          </td>
                          <td className="py-5 px-6 hidden lg:table-cell font-mono text-sm">
                            {user.phonenumber || "N/A"}
                          </td>
                          <td className="py-5 px-6 font-mono text-violet-300">
                            {user.verificationCode || "N/A"}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => downloadUserDoc(user._id || user.id)}
                                className="text-violet-400 hover:text-violet-500 p-2 hover:bg-violet-500/10 rounded-xl transition-colors"
                                title="Download Document"
                              >
                                <FaDownload size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user._id || user.id);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-colors"
                                title="Delete User"
                              >
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-16 text-slate-500">
                    No users found matching your search.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Error Modal */}
      {showDownloadError && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-red-500">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Download Error</h2>
            <p className="text-slate-300 mb-6">{downloadErrorMsg}</p>
            <button
              onClick={() => setShowDownloadError(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to permanently delete this trainee? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedUser) await deleteUser(selectedUser);
                  setShowDeleteModal(false);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-2xl transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;