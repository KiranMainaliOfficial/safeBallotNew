import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listElectionsApi } from "../api/election.api";
import { getMeApi } from "../api/auth.api";
import { useAuth } from "../store/authStore";
import Loader from "../components/common/Loader";
import { fmtDate } from "../utils/formatters";

export default function Elections() {
  const [items, setItems] = useState(null);
  const [sortOrder, setSortOrder] = useState("endTimeAsc");
  const { user, token, setAuth } = useAuth();

  useEffect(() => {
    getMeApi()
      .then((r) => {
        setAuth(r.data.data, token);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile", err);
      });

    listElectionsApi()
      .then((r) => setItems(r.data.data))
      .catch(() => setItems([]));
  }, []);

  if (!items) return <Loader />;

  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === "endTimeAsc") {
      return new Date(a.endTime) - new Date(b.endTime);
    }
    if (sortOrder === "startTimeDesc") {
      return new Date(b.startTime) - new Date(a.startTime);
    }
    if (sortOrder === "startTimeAsc") {
      return new Date(a.startTime) - new Date(b.startTime);
    }
    return 0;
  });

  // Helper to map categories based on titles
  const getElectionMeta = (title) => {
    if (title.includes("Presidential")) {
      return { category: "Federal", count: "18.4M registered", badgeColor: "bg-blue-100 text-blue-800 font-bold" };
    }
    if (title.includes("Senate")) {
      return { category: "State", count: "3.1M registered", badgeColor: "bg-teal-100 text-teal-800 font-bold" };
    }
    if (title.includes("Governor")) {
      return { category: "State", count: "9.6M registered", badgeColor: "bg-teal-100 text-teal-800 font-bold" };
    }
    if (title.includes("School")) {
      return { category: "Local", count: "240K registered", badgeColor: "bg-amber-100 text-amber-800 font-bold", isClosingSoon: true };
    }
    if (title.includes("Proposition")) {
      return { category: "Ballot", count: "9.6M registered", badgeColor: "bg-purple-100 text-purple-800 font-bold" };
    }
    if (title.includes("Mayor")) {
      return { category: "Local", count: "2.2M registered", badgeColor: "bg-amber-100 text-amber-800 font-bold" };
    }
    return { category: "Local", count: "1.2M registered", badgeColor: "bg-slate-100 text-slate-800 font-bold" };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-[#0B3C95]">Active Ballots</h3>
          <p className="text-slate-500 text-sm mt-1">Browse, view candidate rosters, and cast your official digital vote.</p>
        </div>
        <div className="relative inline-block self-start sm:self-center">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 py-2 px-4 pr-10 rounded-xl text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-[#0B3C95]/20 appearance-none"
          >
            <option value="endTimeAsc">⏰ Sort: Ends Soonest</option>
            <option value="startTimeDesc">📅 Sort: Newest Start</option>
            <option value="startTimeAsc">📅 Sort: Oldest Start</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            ▾
          </div>
        </div>
      </div>

      {!user?.kycComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-amber-800 font-semibold text-base flex items-center gap-2">
              ⚠️ KYC Verification Required
            </h4>
            <p className="text-amber-700 text-sm mt-1">
              You must complete your identity profile verification to be eligible for voting.
            </p>
          </div>
          <Link
            to="/kyc"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap self-start sm:self-center"
          >
            Complete KYC Now
          </Link>
        </div>
      )}

      {sortedItems.length === 0 && (
        <div className="bg-white border border-slate-150 rounded-3xl p-12 text-center text-slate-500">
          No elections available right now.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((e) => {
          const meta = getElectionMeta(e.title);
          return (
            <div key={e._id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover-lift shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${meta.badgeColor}`}>
                    {meta.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      e.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : e.status === "closed"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {e.status.toUpperCase()}
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 mb-1">{e.title}</h4>
                <p className="text-xs text-slate-400 font-semibold mb-4">
                  Closes: {new Date(e.endTime).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                </p>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6">
                  {e.description}
                </p>
              </div>

              <div className="flex gap-2">
                {e.status === "active" && (
                  user?.kycComplete ? (
                    <Link
                      to={`/vote/${e._id}`}
                      className="flex-1 text-center bg-[#0B3C95] hover:bg-[#072C70] text-white font-bold py-2.5 rounded-xl transition text-xs"
                    >
                      Cast Ballot
                    </Link>
                  ) : (
                    <button
                      disabled
                      title="Complete KYC to vote"
                      className="flex-1 bg-slate-100 text-slate-400 font-semibold py-2.5 rounded-xl text-xs cursor-not-allowed"
                    >
                      Vote (KYC Needed)
                    </button>
                  )
                )}
                <Link
                  to={`/results/${e._id}`}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-350 text-slate-650 font-semibold text-xs transition"
                >
                  Results
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
