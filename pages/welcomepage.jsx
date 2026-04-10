import { useNavigate } from "react-router-dom";
import bgImage from "../src/assets/hero.jpg"; 

export default function RegistrationSelector() {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }} // 
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

      {/* Box Container */}
      <div className="relative w-full max-w-lg bg-white bg-opacity-95 shadow-2xl rounded-2xl p-10">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Registration Type</h1>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => navigate("/trainee-register")}
            className="w-full sm:w-1/2 px-6 py-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
          >
            Register as Trainee
          </button>

          <button
            onClick={() => navigate("/admin-register")}
            className="w-full sm:w-1/2 px-6 py-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition shadow-md"
          >
            Register as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
