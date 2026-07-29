import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../../hooks/useSocket";
import BarChart from "../../components/charts/BarChart";
import { listElectionsApi, setStatusApi, deleteElectionApi } from "../../api/election.api";

export default function AdminDashboard() {
  const socket = useSocket();
  const location = useLocation();
  const [tally, setTally] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [elections, setElections] = useState([]);

  const loadElections = () => {
    listElectionsApi()
      .then((r) => setElections(r.data.data))
      .catch(() => setElections([]));
  };

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.on("vote:new", (payload) => {
      setTally(payload.tally);
      setActivity((p) =>
        [{ ts: payload.ts, electionId: payload.electionId }, ...p].slice(0, 10),
      );
    });
    socket.current.on("fraud:alert", (r) =>
      setAlerts((p) => [r, ...p].slice(0, 20)),
    );
  }, [socket.current]);

  const handleStatusChange = async (id, status) => {
    try {
      await setStatusApi(id, status);
      toast.success(`Status updated to ${status}`);
      loadElections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? All candidates and votes will be permanently removed.")) return;
    try {
      await deleteElectionApi(id);
      toast.success("Election deleted");
      loadElections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Admin Navigation */}
      <div className="flex gap-6 border-b border-slate-200 pb-3">
        <Link
          to="/admin"
          className={`text-sm font-semibold pb-1 transition-all ${
            location.pathname === "/admin"
              ? "text-[#0B3C95] border-b-2 border-[#0B3C95] font-bold"
              : "text-slate-500 hover:text-[#0B3C95]"
          }`}
        >
          Live Dashboard
        </Link>
        <Link
          to="/admin/elections"
          className={`text-sm font-semibold pb-1 transition-all ${
            location.pathname === "/admin/elections"
              ? "text-[#0B3C95] border-b-2 border-[#0B3C95] font-bold"
              : "text-slate-500 hover:text-[#0B3C95]"
          }`}
        >
          Manage Elections
        </Link>
        <Link
          to="/admin/fraud"
          className={`text-sm font-semibold pb-1 transition-all ${
            location.pathname === "/admin/fraud"
              ? "text-[#0B3C95] border-b-2 border-[#0B3C95] font-bold"
              : "text-slate-500 hover:text-[#0B3C95]"
          }`}
        >
          Fraud Reports
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/elections"
          className="card flex items-center justify-between p-6 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:scale-[1.01] transition duration-200"
        >
          <div>
            <h5 className="font-bold text-[#0B3C95] text-sm md:text-base">Create Election</h5>
            <p className="text-[10px] text-slate-500 mt-1">Configure title, timeline & candidates</p>
          </div>
          <span className="text-xl bg-blue-100/80 p-2.5 rounded-2xl">➕</span>
        </Link>
        
        <Link
          to="/admin/elections"
          className="card flex items-center justify-between p-6 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:scale-[1.01] transition duration-200"
        >
          <div>
            <h5 className="font-bold text-emerald-800 text-sm md:text-base">Manage Statuses</h5>
            <p className="text-[10px] text-slate-500 mt-1">Activate draft ballots or close voting</p>
          </div>
          <span className="text-xl bg-emerald-100/80 p-2.5 rounded-2xl">⚙️</span>
        </Link>

        <Link
          to="/admin/fraud"
          className="card flex items-center justify-between p-6 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 hover:scale-[1.01] transition duration-200"
        >
          <div>
            <h5 className="font-bold text-rose-800 text-sm md:text-base">Fraud Auditing</h5>
            <p className="text-[10px] text-slate-500 mt-1">Inspect double-voting & anomaly alerts</p>
          </div>
          <span className="text-xl bg-rose-100/80 p-2.5 rounded-2xl">🚨</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h4 className="font-semibold mb-4">Live Vote Count</h4>
          {tally.length === 0 ? (
            <p className="text-sm text-slate-400">Waiting for votes…</p>
          ) : (
            <BarChart
              labels={tally.map((c) => c.name)}
              data={tally.map((c) => c.voteCount)}
            />
          )}
        </div>

        <div className="card">
          <h4 className="font-semibold mb-4 text-rose-600">Fraud Alerts</h4>
          <ul className="space-y-2 max-h-96 overflow-auto">
            {alerts.length === 0 && (
              <li className="text-slate-400 text-sm">No alerts</li>
            )}
            {alerts.map((a) => (
              <li
                key={a._id}
                className="p-3 rounded-lg bg-rose-50 border border-rose-100"
              >
                <p className="text-sm font-medium text-rose-700">{a.type}</p>
                <p className="text-xs text-slate-500">
                  Severity: {a.severity} ·{" "}
                  {new Date(a.detectedAt || a.createdAt).toLocaleTimeString()}
                </p>
                <pre className="text-[10px] text-slate-500 mt-1 whitespace-pre-wrap break-all">
                  {" "}
                  {JSON.stringify(a.evidence, null, 0)}{" "}
                </pre>{" "}
              </li>
            ))}
          </ul>
        </div>

        <div className="card lg:col-span-3">
          <h4 className="font-semibold mb-4">Recent Activity</h4>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent votes</p>
          ) : (
            <ul className="text-sm divide-y divide-slate-100">
              {activity.map((a, i) => (
                <li key={i} className="py-2 flex justify-between">
                  <span className="font-mono text-xs">{a.electionId}</span>
                  <span className="text-slate-400">
                    {new Date(a.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Elections Overview and quick controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800">Elections Overview & Quick Controls</h4>
          <Link to="/admin/elections" className="text-xs font-bold text-[#0B3C95] hover:underline">
            Go to Election Manager →
          </Link>
        </div>

        {elections.length === 0 ? (
          <p className="text-sm text-slate-400">No elections found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {elections.map((e) => (
              <div key={e._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-semibold text-slate-800 text-sm">{e.title}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Start: {new Date(e.startTime).toLocaleString()} · End: {new Date(e.endTime).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    e.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : e.status === 'closed'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {e.status}
                  </span>

                  <div className="flex gap-1.5">
                    <Link
                      to={`/admin/elections`}
                      className="text-xs px-2.5 py-1 rounded bg-blue-50 text-[#0B3C95] hover:bg-blue-100 font-semibold transition"
                    >
                      Edit
                    </Link>
                    {e.status !== "active" && (
                      <button
                        onClick={() => handleStatusChange(e._id, "active")}
                        className="text-xs px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition"
                      >
                        Activate
                      </button>
                    )}
                    {e.status !== "closed" && (
                      <button
                        onClick={() => handleStatusChange(e._id, "closed")}
                        className="text-xs px-2.5 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold transition"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="text-xs px-2.5 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
