import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fraudListApi, updateFraudApi } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import { fmtDate } from "../../utils/formatters";

export default function FraudReports() {
  const [items, setItems] = useState(null);

  const load = () =>
    fraudListApi()
      .then((r) => setItems(r.data.data))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    try {
      await updateFraudApi(id, status);
      toast.success(`Marked ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (!items) return <Loader />;

  const sevColor = (s) =>
    s === "high"
      ? "bg-rose-100 text-rose-700"
      : s === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="p-4">
      <h3 className="text-2xl font-semibold mb-6">Fraud Reports</h3>
      {items.length === 0 && (
        <div className="card text-slate-500 text-sm">No reports.</div>
      )}
      <div className="space-y-3">
        {items.map((r) => (
          <div key={r._id} className="card">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.type}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${sevColor(
                    r.severity,
                  )}`}
                >
                  {r.severity}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === "open"
                      ? "bg-rose-50 text-rose-600"
                      : r.status === "reviewed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="flex gap-2">
                {r.status !== "reviewed" && (
                  <button
                    onClick={() => update(r._id, "reviewed")}
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700"
                  >
                    Mark reviewed
                  </button>
                )}
                {r.status !== "dismissed" && (
                  <button
                    onClick={() => update(r._id, "dismissed")}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-200 text-slate-700"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {fmtDate(r.detectedAt || r.createdAt)}
            </p>
            <pre className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg overflow-auto">
              {JSON.stringify(r.evidence, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
