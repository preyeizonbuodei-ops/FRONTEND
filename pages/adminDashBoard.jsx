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
  const [deleting, setDeleting] = useState(false);
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
      console.error(err);
      if (err.response?.status === 404) {
        setError("API route not found (404). Please check your backend.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('adminToken');
        setTimeout(() => window.location.href = '/admin-login', 1500);
      } else {
        setError("Failed to load trainees");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete User Function
  const deleteUser = async (userId) => {
    if (!userId) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/api/auth/v1/user/delete-trainee/${userId}`);

      if (response.status === 200 || response.status === 204) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        setFilteredUsers(prev => prev.filter(user => user._id !== userId));
        alert("Trainee deleted successfully");
      }
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete trainee";
      alert(errorMsg);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const downloadUserDoc = async (traineeId) => { /* ... same as before */ };
  const downloadAllPDF = async () => { /* ... same as before */ };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const result = users.filter(user =>
      (user.username || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term)
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

  // Calculate total registered trainees
  const totalTrainees = users.length;
  const filteredCount = filteredUsers.length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar - unchanged */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform flex flex-col`}>

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
          <button onClick={handleLogout} className="w-full py-3 text-red-400 hover:bg-red-500/10 rounded-3xl transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden text-2xl text-slate-400"
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={downloadAllPDF}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-5 py-2.5 rounded-2xl font-medium text-sm transition-all active:scale-95"
            >
              <FaDownload /> <span className="hidden sm:inline">All PDF</span>
            </button>

            <button 
              onClick={fetchAllUsers} 
              disabled={loading}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} size={18} />
            </button>
          </div>
        </div>

        {/* Total Trainees Counter - ADDED BACK HERE */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-600/20 rounded-2xl flex items-center justify-center">
                <FaUsers className="text-violet-400 text-3xl" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Registered Trainees</p>
                <h2 className="text-4xl font-bold text-white">{totalTrainees}</h2>
              </div>
            </div>

            {/* Show filtered count when searching */}
            {searchTerm && (
              <div className="text-right">
                <p className="text-slate-400 text-sm">Showing</p>
                <p className="text-lg font-medium text-violet-400">
                  {filteredCount} of {totalTrainees}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search trainees by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 pl-12 py-3.5 rounded-3xl text-base outline-none"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="flex-1 p-4 overflow-auto">
          {loading && <div className="text-center py-20 text-slate-400 text-lg">Loading trainees...</div>}
          
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 p-8 rounded-3xl text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-5">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  {searchTerm ? "No matching trainees found" : "No trainees found"}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user._id} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{user.username}</h3>
                        <p className="text-violet-400 font-mono text-2xl mt-2 tracking-widest">
                          {user.verificationCode || "N/A"}
                        </p>
                      </div>

                      <button
                        onClick={() => downloadUserDoc(user._id)}
                        className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 w-16 h-16 rounded-3xl flex items-center justify-center transition-all active:scale-95 shadow-md"
                      >
                        <FaDownload size={28} />
                      </button>
                    </div>

                    <div className="text-sm text-slate-400 space-y-2 border-t border-slate-700 pt-5">
                      <p><span className="text-slate-500">Email:</span> {user.email || "—"}</p>
                      <p><span className="text-slate-500">Department:</span> {user.department || "N/A"}</p>
                      <p><span className="text-slate-500">Phone:</span> {user.phonenumber || "N/A"}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedUser(user._id);
                        setShowDeleteModal(true);
                      }}
                      className="mt-6 w-full py-4 border border-red-500/50 hover:border-red-500 text-red-400 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium"
                      disabled={deleting}
                    >
                      <FaTrash size={18} /> Delete Trainee
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same as in previous version */}
      {/* Download Error Modal */}
      {showDownloadError && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm">
            <h2 className="text-red-400 text-xl font-semibold mb-4">Download Error</h2>
            <p className="text-slate-300 mb-6">{downloadErrorMsg}</p>
            <button 
              onClick={() => setShowDownloadError(false)} 
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-2xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this trainee?<br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteUser(selectedUser)}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-2"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;