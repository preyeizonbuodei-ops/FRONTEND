import AdminRegister from "../pages/adminRegister";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegistrationForm from "../pages/tranineeLogin";
import AdminLogin from "../pages/adminLogin";
import AdminDashBoard from "../pages/adminDashBoard";
import RegistrationSelector from '../pages/welcomepage';
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/trainee-register" element={<RegistrationForm />} />
        <Route path="/" element={<RegistrationSelector />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashBoard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
}

export default App;
