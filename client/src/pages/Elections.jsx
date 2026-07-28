import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listElectionsApi } from "../api/election.api";
import { getMeApi } from "../api/auth.api";
import { useAuth } from "../store/authStore";
import Loader from "../components/common/Loader";
import { fmtDate } from "../utils/formatters";

export default function Elections() {
  const [items, setItems] = useState(null);
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

  return (
    <div className="p-4">
      <h3 className="text-2xl font-semibold mb-6">Elections</h3>

      {!user?.kycComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-amber-800 font-semibold text-base flex items-center gap-2">
              ⚠️ KYC Verification Required
            </h4>
            <p className="text-amber-700 text-sm mt-1">
              You must complete your KYC verification to be eligible for voting.
            </p>
          </div>
          <Link
            to="/kyc"
            className="btn-primary !bg-amber-600 hover:!bg-amber-700 text-sm whitespace-nowrap self-start sm:self-center"
          >
            Complete KYC Now
          </Link>
        </div>
      )}
      {items.length === 0 && (
        <div className="card text-slate-500 text-sm">
          No elections available right now.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => (
          <div key={e._id} className="card hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{e.title}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  e.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : e.status === "closed"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {e.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">
              {e.description}
            </p>
            <div className="text-xs text-slate-400 mb-4">
              {fmtDate(e.startTime)} → {fmtDate(e.endTime)}
            </div>
            <div className="flex gap-2">
              {e.status === "active" && (
                user?.kycComplete ? (
                  <Link
                    to={`/vote/${e._id}`}
                    className="btn-primary !py-1.5 !px-3 text-sm"
                  >
                    Vote
                  </Link>
                ) : (
                  <button
                    disabled
                    title="Complete KYC to vote"
                    className="btn-primary !py-1.5 !px-3 text-sm opacity-50 cursor-not-allowed"
                  >
                    Vote
                  </button>
                )
              )}
              <Link
                to={`/results/${e._id}`}
                className="text-sm px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300"
              >
                Results
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
