import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/authStore";
import { logoutApi } from "../../api/auth.api";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    logout();
    nav("/login");
  };

  const handleScrollTo = (elementId) => {
    if (location.pathname !== "/") {
      nav(`/#${elementId}`);
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.getElementById(elementId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="bg-[#0B3C95] text-white border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold select-none text-base">
          <span className="w-8 h-8 rounded-lg bg-white text-[#0B3C95] grid place-items-center text-sm font-black">
            SB
          </span>
          <span className="tracking-tight text-white font-bold">Safe Ballot</span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider bg-white/15 text-blue-100 border border-white/10 px-1.5 py-0.5 rounded ml-1">
            Official
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-blue-100/90">
          <button
            onClick={() => handleScrollTo("how-it-works")}
            className="hover:text-white transition cursor-pointer"
          >
            How It Works
          </button>
          
          <Link
            to="/verify"
            className="hover:text-white transition"
          >
            Security
          </Link>

          <button
            onClick={() => handleScrollTo("active-ballots")}
            className="hover:text-white transition cursor-pointer"
          >
            Elections
          </button>

          <Link
            to="/about"
            className="hover:text-white transition"
          >
            About Project
          </Link>

          <Link
            to="/contact"
            className="hover:text-white transition"
          >
            Contact Us
          </Link>
        </nav>

        {/* Auth Action Area */}
        <div className="flex items-center gap-4 text-xs">
          {token ? (
            <>
              <Link
                to="/elections"
                className="text-blue-100 hover:text-white font-semibold transition"
              >
                Ballot Box
              </Link>
              <Link
                to="/my-details"
                className="text-blue-100 hover:text-white font-semibold transition"
              >
                Profile
              </Link>
              
              {(user?.role === "admin" || user?.role === "auditor") && (
                <Link
                  to="/admin"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={onLogout}
                className="bg-red-600/80 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-white text-[#0B3C95] hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Sign In to Vote
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
