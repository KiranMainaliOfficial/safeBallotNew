import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Contact from "./pages/Contact";
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
import KycPage from "./pages/KycPage";
import MyDetails from "./pages/MyDetails";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F6]">
      <Navbar />
      <main className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/verify" element={<Verify />} />

          <Route element={<PrivateRoute />}>
            {" "}
            <Route path="/elections" element={<Elections />} />{" "}
            <Route path="/vote/:id" element={<VotePage />} />{" "}
            <Route path="/results/:id" element={<Results />} />{" "}
            <Route path="/kyc" element={<KycPage />} />{" "}
            <Route path="/my-details" element={<MyDetails />} />{" "}
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
