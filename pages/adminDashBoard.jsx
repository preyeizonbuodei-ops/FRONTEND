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
      const userList = Array.isArray(response.data) ? response.data : 
                      response.data?.users || response.data?.data || [];
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Backend endpoint not found (404). Please check your API routes.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Logging out...");
        localStorage.removeItem('adminToken');
        setTimeout(() => window.location.href = '/admin-login', 1500);
      } else {
        setError("Failed to load trainees");
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
      link.download = `trainee_${traineeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDownloadErrorMsg("Download failed. Try again.");
      setShowDownloadError(true);
    }
  };

  const downloadAllPDF = async () => {
    try {
      const response = await api.get("/api/auth/v1/user/download-trainees-pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "all-trainees.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download all PDFs");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(users.filter(user =>
      (user.username || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term)
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return window.location.href = '/admin-login';
    fetchAllUsers();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform flex flex-col`}>
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">A</div>
            <h1 className="text-2xl font-semibold">AdminHub</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><FaTimes size={24} /></button>
        </div>

        <nav className="flex-1 p-6">
          <div className="flex items-center gap-3 px-5 py-4 bg-slate-800 rounded-3xl">
            <FaUsers className="text-xl" />
            <span className="font-medium">All Trainees</span>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full py-3 text-red-400 hover:bg-red-500/10 rounded-3xl">Logout</button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-2xl"><FaBars /></button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>

          <div className="flex gap-3">
            <button onClick={downloadAllPDF} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-2xl text-sm font-medium">
              <FaDownload /> <span className="hidden sm:inline">All PDF</span>
            </button>
            <button onClick={fetchAllUsers} className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700">
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search trainees..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 pl-12 py-3.5 rounded-3xl text-base"
            />
          </div>
        </div>

        {/* Content - Mobile Cards Only */}
        <div className="flex-1 p-4 overflow-auto">
          {loading && <div className="text-center py-20">Loading...</div>}
          {error && <div className="text-red-400 text-center py-10">{error}</div>}

          {!loading && !error && (
            <div className="space-y-5">
              {filteredUsers.length === 0 && <div className="text-center py-20 text-slate-500">No trainees found</div>}

              {filteredUsers.map((user) => (
                <div key={user._id} className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{user.username}</h3>
                      <p className="text-violet-400 font-mono text-2xl mt-2 tracking-widest">
                        {user.verificationCode || "———"}
                      </p>
                    </div>

                    <button
                      onClick={() => downloadUserDoc(user._id)}
                      className="bg-violet-600 hover:bg-violet-700 w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                      <FaDownload size={28} />
                    </button>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-700 text-sm text-slate-400 space-y-1.5">
                    <p>Email: <span className="text-slate-300">{user.email || "—"}</span></p>
                    <p>Department: <span className="text-slate-300">{user.department || "N/A"}</span></p>
                    <p>Phone: <span className="text-slate-300">{user.phonenumber || "N/A"}</span></p>
                  </div>

                  <button
                    onClick={() => { setSelectedUser(user._id); setShowDeleteModal(true); }}
                    className="mt-6 w-full py-3.5 border border-red-500/50 hover:border-red-500 text-red-400 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaTrash /> Delete Trainee
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals (same as before) */}
      {showDownloadError && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 p-6 rounded-3xl max-w-sm w-full text-center">
            <h2 className="text-red-400 text-xl font-semibold mb-4">Download Failed</h2>
            <p className="mb-6">{downloadErrorMsg}</p>
            <button onClick={() => setShowDownloadError(false)} className="w-full py-3 bg-red-600 rounded-2xl">Close</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 p-6 rounded-3xl max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-slate-300">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-700 rounded-2xl">Cancel</button>
              <button onClick={async () => { if (selectedUser) await deleteUser(selectedUser); setShowDeleteModal(false); }} className="flex-1 py-3 bg-red-600 rounded-2xl">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;