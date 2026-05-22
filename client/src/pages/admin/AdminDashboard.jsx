import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import BarChart from "../../components/charts/BarChart";

export default function AdminDashboard() {
  const socket = useSocket();
  const [tally, setTally] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);

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

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          ))}{" "}
        </ul>{" "}
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
  );
}
