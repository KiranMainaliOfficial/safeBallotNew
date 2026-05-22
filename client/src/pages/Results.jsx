import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { resultsApi } from "../api/election.api";
import { useSocket } from "../hooks/useSocket";
import BarChart from "../components/charts/BarChart";
import PieChart from "../components/charts/PieChart";
import Loader from "../components/common/Loader";
import { pct } from "../utils/formatters";

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const socket = useSocket();
  const receipt = JSON.parse(
    sessionStorage.getItem(`receipt: ${id}`) || "null",
  );

  useEffect(() => {
    resultsApi(id)
      .then((r) => setData(r.data.data))
      .catch(() => setData(false));
  }, [id]);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.emit("subscribe:election", id);
    socket.current.on("count:update", (tally) => {
      setData((prev) =>
        prev
          ? { ...prev, candidates: mergeTally(prev.candidates, tally) }
          : prev,
      );
    });
  }, [socket.current, id]);

  if (data === null) return <Loader />;
  if (!data) return <p className="p-6 text-slate-500">Results unavailable.</p>;

  const total = data.candidates.reduce((a, c) => a + c.voteCount, 0);

  return (
    <div className="p-4 space-y-6">
      {" "}
      {receipt && (
        <div className="card border-emerald-200 bg-emerald-50">
          {" "}
          <p className="text-sm text-emerald-700 font-medium">
            {" "}
            Your vote receipt{" "}
          </p>{" "}
          <p className="text-xs text-emerald-700/80 mt-1 break-all">
            {" "}
            ID: {receipt.receiptId} · Hash: {receipt.voteHash}{" "}
          </p>{" "}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">{data.election.title}</h4>
            <span className="text-xs text-slate-500">Total votes: {total}</span>
          </div>
          <BarChart
            labels={data.candidates.map((c) => c.name)}
            data={data.candidates.map((c) => c.voteCount)}
          />
        </div>

        <div className="card">
          <h4 className="font-semibold mb-4">Share</h4>
          <PieChart
            labels={data.candidates.map((c) => c.name)}
            data={data.candidates.map((c) => c.voteCount)}
          />
        </div>
      </div>
      <div className="card">
        <h4 className="font-semibold mb-4">Standings</h4>
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-left">
            <tr>
              <th className="py-2">Candidate</th>
              <th>Party</th>
              <th>Votes</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.candidates.map((c) => (
              <tr key={c._id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{c.name}</td>
                <td className="text-slate-500">{c.party || "—"}</td>
                <td>{c.voteCount}</td>
                <td>{pct(c.voteCount, total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function mergeTally(prev, live) {
  const map = new Map(live.map((l) => [String(l._id), l.voteCount]));
  return prev.map((c) => ({
    ...c,
    voteCount: map.get(String(c._id)) ?? c.voteCount,
  }));
}
