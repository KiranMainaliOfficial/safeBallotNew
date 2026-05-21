import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getElectionApi } from "../api/election.api";
import { castVoteApi } from "../api/vote.api";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";

export default function VotePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getElectionApi(id)
      .then((r) => setElection(r.data.data))
      .catch(() => setElection(false));
  }, [id]);

  if (election === null) return <Loader />;
  if (!election)
    return <p className="p-6 text-slate-500">Election not found.</p>;

  const submit = async () => {
    if (!selected) return;
    if (!confirm("Confirm your vote? This cannot be changed.")) return;
    setLoading(true);
    try {
      const { data } = await castVoteApi({
        electionId: id,
        candidateId: selected,
      });
      toast.success("Vote recorded");
      sessionStorage.setItem(`receipt:${id}`, JSON.stringify(data.data));
      nav(`/results/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Vote failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="card">
        <h3 className="text-2xl font-semibold mb-1">{election.title}</h3>
        <p className="text-slate-500 text-sm mb-6">{election.description}</p>

        <div className="space-y-3">
          {election.candidates.map((c) => (
            <label
              key={c._id}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                selected === c._id
                  ? "border-brand-500 bg-brand-500/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="cand"
                className="accent-brand-600"
                checked={selected === c._id}
                onChange={() => setSelected(c._id)}
              />
              <div>
                <p className="font-medium">{c.name}</p>
                {c.party && <p className="text-xs text-slate-500">{c.party}</p>}
              </div>
            </label>
          ))}
        </div>

        <Button
          onClick={submit}
          disabled={!selected || loading}
          className="mt-6 w-full"
        >
          {loading ? "Submitting…" : "Cast Vote"}
        </Button>
      </div>
    </div>
  );
}
