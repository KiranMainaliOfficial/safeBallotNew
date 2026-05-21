import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/authStore";

export default function AdminRoute() {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "auditor")
    return <Navigate to="/elections" replace />;
  return <Outlet />;
}
