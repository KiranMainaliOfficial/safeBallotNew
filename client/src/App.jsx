import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Elections from "./pages/Elections";
import VotePage from "./pages/VotePage";
import Results from "./pages/Results";
import Verify from "./pages/Verify";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageElections from "./pages/admin/ManageElections";
import FraudReports from "./pages/admin/FraudReports";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/elections" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/verify" element={<Verify />} />

          <Route element={<PrivateRoute />}>
            {" "}
            <Route path="/elections" element={<Elections />} />{" "}
            <Route path="/vote/:id" element={<VotePage />} />{" "}
            <Route path="/results/:id" element={<Results />} />{" "}
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/elections" element={<ManageElections />} />
            <Route path="/admin/fraud" element={<FraudReports />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
