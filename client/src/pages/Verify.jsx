import { useState } from "react";
import toast from "react-hot-toast";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { verifyElectionApi, verifyReceiptApi } from "../api/verify.api";

export default function Verify() {
  const [electionId, setElectionId] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [eResult, setEResult] = useState(null);
  const [rResult, setRResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkElection = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyElectionApi(electionId);
      setEResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setEResult(null);
    } finally {
      setLoading(false);
    }
  };

  const checkReceipt = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyReceiptApi(receiptId);
      setRResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setRResult(null);
    } finally {
      setLoading(false);
    }
  };

  const Badge = ({ ok, children }) => (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {children}
    </span>
  );

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h4 className="font-semibold mb-1">Verify Election Integrity</h4>
        <p className="text-sm text-slate-500 mb-4">
          Re-walks the entire hash chain and cross-checks tallies. No login
          required.{" "}
        </p>{" "}
        <form onSubmit={checkElection} className="space-y-3">
          {" "}
          <Input
            label="Election ID"
            required
            value={electionId}
            onChange={(e) => setElectionId(e.target.value)}
          />{" "}
          <Button disabled={loading || !electionId}>
            {" "}
            {loading ? "Verifying…" : "Verify chain"}{" "}
          </Button>{" "}
        </form>
        {eResult && (
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              Chain status:{" "}
              <Badge ok={eResult.ok}>{eResult.ok ? "INTACT" : "BROKEN"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              Head matches stored:{" "}
              <Badge ok={eResult.headMatches}>
                {eResult.headMatches ? "YES" : "NO"}
              </Badge>
            </div>
            <p>
              Total votes recomputed:{" "}
              <span className="font-medium">{eResult.totalVotes}</span>
            </p>
            {eResult.brokenAt !== null && (
              <p className="text-rose-600">
                Chain broken at vote index #{eResult.brokenAt}
              </p>
            )}
            {eResult.mismatches?.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-700 text-xs">
                <p className="font-medium mb-1">Tally mismatches:</p>
                <ul className="space-y-1">
                  {eResult.mismatches.map((m) => (
                    <li key={m.candidateId}>
                      {m.name}: stored {m.stored} vs recomputed {m.recomputed}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-slate-400 break-all">
              Head: {eResult.headHash}
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h4 className="font-semibold mb-1">Verify a Vote Receipt</h4>
        <p className="text-sm text-slate-500 mb-4">
          Confirm that your receipt corresponds to a recorded vote. The
          candidate you chose stays private.
        </p>
        <form onSubmit={checkReceipt} className="space-y-3">
          <Input
            label="Receipt ID"
            required
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
          />
          <Button disabled={loading || !receiptId}>
            {loading ? "Checking…" : "Verify receipt"}
          </Button>
        </form>

        {rResult && (
          <div className="mt-5 text-sm">
            {rResult.found ? (
              <div className="space-y-1">
                <Badge ok>RECEIPT VALID</Badge>
                <p>
                  Election:{" "}
                  <span className="font-mono text-xs">
                    {rResult.electionId}
                  </span>
                </p>
                <p>Recorded at: {new Date(rResult.votedAt).toLocaleString()}</p>
              </div>
            ) : (
              <Badge ok={false}>RECEIPT NOT FOUND</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
