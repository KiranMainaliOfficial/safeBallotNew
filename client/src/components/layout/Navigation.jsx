import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/authStore";
import { logoutApi } from "../../api/auth.api";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    logout();
    nav("/login");
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center text-xs">
            SB
          </span>
          SafeBallot
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {token && (
            <Link
              to="/elections"
              className="text-slate-600 hover:text-slate-900"
            >
              Elections
            </Link>
          )}
          <Link to="/verify" className="text-slate-600 hover:text-slate-900">
            Verify
          </Link>
          {(user?.role === "admin" || user?.role === "auditor") && (
            <>
              <Link to="/admin" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link
                to="/admin/elections"
                className="text-slate-600 hover:text-slate-900"
              >
                Manage
              </Link>
              <Link
                to="/admin/fraud"
                className="text-slate-600 hover:text-slate-900"
              >
                Fraud
              </Link>
            </>
          )}
          {token ? (
            <button
              onClick={onLogout}
              className="btn-primary !py-1.5 !px-3 text-sm"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary !py-1.5 !px-3 text-sm"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
