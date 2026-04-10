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



  // const adminName = "Preye";

  // Create axios instance with token
  const api = axios.create({
    baseURL: 'http://localhost:5000',   // ← Change to your backend base URL
  });

  // Add token to every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/auth/v1/user/get-all-trianees');   // Your protected route

      console.log("✅ Users fetched successfully:", response.data);

      let userList = Array.isArray(response.data) ? response.data 
                    : response.data?.users || response.data?.data || [];

      setUsers(userList);
      setFilteredUsers(userList);

    } catch (err) {
      console.error("Fetch error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('adminToken');
        // Optional: redirect to login
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
    console.error("User doc download failed:", err);
    setDownloadErrorMsg("Failed to download trainee document. Please try again.");
    setShowDownloadError(true);
  }
};



  const deleteUser = async (traineeId) => {
    if (!confirm("Delete this user permanently?")) return;

    try {
      await api.delete(`/api/auth/v1/user/delete-trainee/${traineeId}`);
      const updated = users.filter(u => u.id !== traineeId);
      setUsers(updated);
      setFilteredUsers(updated);
      alert("User deleted successfully");
    } catch (err) {
      alert("Delete failed");
    }
  };

  const downloadPDF = async () => {
  try {
    // Use your axios instance to call the backend
    const response = await api.get("/api/auth/v1/user/download-trainees-pdf", {
      responseType: "blob", // important for file downloads
    });

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.pdf"); // file name
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
      (user.name || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term) ||
      (user.department || "").toLowerCase().includes(term)

    );
    setFilteredUsers(result);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
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
          <div className="flex items-center gap-3 px-5 py-4 bg-slate-800 rounded-3xl text-white">
            <FaUsers className="text-xl" />
            <span className="font-medium">All Users</span>
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
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-2xl"><FaBars /></button>
            <h1 className="text-4xl font-bold mb-6">
              {/* Welcome, {adminUsername ? adminUsername : "Admin"}! */}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search, Refresh, Download buttons same as before */}
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-slate-800 border border-slate-700 focus:border-violet-500 w-72 lg:w-80 pl-11 pr-6 py-3 rounded-3xl text-sm outline-none"
              />
            </div>

            <button onClick={fetchAllUsers} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-3xl">
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl font-medium">
              <FaDownload />
              <span className="hidden sm:inline">PDF</span>
            </button>
            {/* Total Users */}
            <div className="px-5 py-3 bg-slate-800 rounded-3xl font-medium text-violet-400">
              Total Trainees: {users.length}
            </div>
          </div>
        </div>

        {/* Table Section - Same as before */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Registered Users</h2>

            {loading && <div className="text-center py-20">Loading users...</div>}
            
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-400 p-8 rounded-3xl text-center">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700">
                        <th className="text-left py-5 px-6">NAME</th>
                        <th className="text-left py-5 px-6">EMAIL</th>
                        <th className="text-left py-5 px-6 hidden md:table-cell">DEPARTMENT</th>
                        <th className="text-left py-5 px-6 hidden lg:table-cell">PHONE</th>
                        <th className="text-left py-5 px-6">VALIDATION CODE</th>
                        <th className="text-center py-5 px-6">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/70">
                          <td className="py-5 px-6 font-medium">{user.username}</td>
                          <td className="py-5 px-6">{user.email}</td>
                          <td className="py-5 px-6 hidden md:table-cell">
                            <span className="px-4 py-1 bg-slate-700 text-xs rounded-3xl">{user.department}</span>
                          </td>
                          <td className="py-5 px-6 hidden lg:table-cell font-mono">{user.phonenumber}</td>
                          <td className="py-5 px-6 font-mono text-violet-300">{user.verificationCode}</td>
                          <td className="py-5 px-6 text-center flex items-center gap-4 justify-center">
                          <button
                            onClick={() => downloadUserDoc(user.id)}
                            className="text-violet-400 hover:text-violet-500"
                            title="Download User Doc"
                          >
                            <FaDownload />
                          </button>
                          <td className="py-5 px-6 text-center flex items-center gap-4 justify-center">
                          <button
                            onClick={() => {
                              setSelectedUser(user._id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-400 hover:text-red-500"
                            title="Delete User"
                          >
                          <FaTrash />
                        </button>
                        </td>

                        </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDownloadError && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-96 border border-red-500">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Download Error</h2>
          <p className="text-slate-300 mb-6">{downloadErrorMsg}</p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowDownloadError(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}


      {showDeleteModal && (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-96 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Confirm Delete</h2>
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await api.delete(`/api/auth/v1/user/delete-trainee/${selectedUser}`);
                setUsers(users.filter((u) => u._id !== selectedUser));
                setFilteredUsers(filteredUsers.filter((u) => u._id !== selectedUser));
                setShowDeleteModal(false);
              } catch (err) {
                console.error("Delete failed:", err);
                setShowDeleteModal(false);
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
)}

    </div>

    
  );
};

export default AdminDashboard;