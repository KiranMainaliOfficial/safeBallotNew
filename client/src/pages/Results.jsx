import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
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
    sessionStorage.getItem(`receipt:${id}`) || "null",
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
        <div className="card border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-base font-bold text-emerald-800">Official Vote Casting Receipt</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Election</p>
              <p className="text-slate-800 font-medium text-sm">{receipt.electionTitle || "Local Election"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Casted At</p>
              <p className="text-slate-800 font-medium text-sm">{receipt.timestamp || new Date().toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Your Candidate Choice</p>
              <p className="text-slate-800 font-medium text-sm">
                {receipt.candidateName || "Anonymous"} 
                {receipt.candidateParty && ` (${receipt.candidateParty})`}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Verification Status</p>
              <p className="text-emerald-700 font-bold text-sm">✓ Secured in Ballot Chain</p>
            </div>
          </div>

          <div className="border-t border-emerald-100/50 pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/60 p-2.5 rounded-xl border border-emerald-100">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receipt ID</p>
                <p className="font-mono text-xs text-slate-700 truncate">{receipt.receiptId}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(receipt.receiptId);
                  toast.success("Receipt ID copied!");
                }}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold rounded-lg self-start sm:self-center transition"
              >
                Copy ID
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/60 p-2.5 rounded-xl border border-emerald-100">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ballot Hash Chain Link</p>
                <p className="font-mono text-xs text-slate-700 truncate">{receipt.voteHash}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(receipt.voteHash);
                  toast.success("Vote Hash copied!");
                }}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold rounded-lg self-start sm:self-center transition"
              >
                Copy Hash
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400 text-center pt-2">
            💡 You can use these keys on the <a href="/verify" className="text-[#0B3C95] hover:underline font-bold">Security Page</a> to independently verify that your ballot is intact and counted.
          </p>
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
