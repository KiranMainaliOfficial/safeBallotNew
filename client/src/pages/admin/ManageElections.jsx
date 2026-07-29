import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  listElectionsApi,
  createElectionApi,
  setStatusApi,
  addCandidateApi,
  updateElectionApi,
  deleteElectionApi,
} from "../../api/election.api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { fmtDate } from "../../utils/formatters";

export default function ManageElections() {
  const location = useLocation();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [candForm, setCandForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    listElectionsApi()
      .then((r) => setItems(r.data.data))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await updateElectionApi(editingId, form);
        toast.success("Election updated");
      } else {
        await createElectionApi(form);
        toast.success("Election created");
      }
      setForm({ title: "", description: "", startTime: "", endTime: "" });
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (election) => {
    setEditingId(election._id);
    // Format dates to YYYY-MM-DDTHH:mm format required by datetime-local input
    const startFmt = election.startTime ? new Date(election.startTime).toISOString().slice(0, 16) : "";
    const endFmt = election.endTime ? new Date(election.endTime).toISOString().slice(0, 16) : "";
    setForm({
      title: election.title,
      description: election.description || "",
      startTime: startFmt,
      endTime: endFmt,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", startTime: "", endTime: "" });
  };

  const updateStatus = async (id, status) => {
    try {
      await setStatusApi(id, status);
      toast.success(`Status: ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? All candidates and votes will be permanently removed.")) return;
    try {
      await deleteElectionApi(id);
      toast.success("Election deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleFileChange = (e, electionId, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCandForm((p) => ({
        ...p,
        [electionId]: {
          ...p[electionId],
          [field]: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const addCand = async (id) => {
    const c = candForm[id];
    if (!c?.name) return toast.error("Name required");
    if (!c?.nid) return toast.error("NID required");
    try {
      await addCandidateApi(id, {
        name: c.name,
        party: c.party || "",
        nid: c.nid,
        photo: c.photo || "",
        partySymbol: c.partySymbol || "",
      });
      toast.success("Candidate added");
      setCandForm((p) => ({ ...p, [id]: { name: "", party: "", nid: "", photo: "", partySymbol: "" } }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (!items) return <Loader />;

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

      <div className="card">
        <h4 className="font-semibold mb-4">{editingId ? "Edit Election" : "Create Election"}</h4>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Start"
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
          <Input
            label="End"
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
          <div className="md:col-span-2 flex gap-2">
            <Button disabled={busy}>{busy ? "Processing…" : (editingId ? "Save Changes" : "Create")}</Button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {items.map((e) => (
          <div key={e._id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-lg text-slate-800">{e.title}</h4>
                <p className="text-xs text-slate-500">
                  {fmtDate(e.startTime)} → {fmtDate(e.endTime)}
                </p>
                <p className="text-xs mt-1">
                  Status: <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{e.status}</span> · ID:{" "}
                  <span className="font-mono">{e._id}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(e)}
                  className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-[#0B3C95] hover:bg-blue-200 transition"
                >
                  Edit
                </button>
                {e.status !== "active" && (
                  <button
                    onClick={() => updateStatus(e._id, "active")}
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                  >
                    Activate
                  </button>
                )}
                {e.status !== "closed" && (
                  <button
                    onClick={() => updateStatus(e._id, "closed")}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => handleDelete(e._id)}
                  className="text-xs px-3 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Add Candidate</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="input text-xs"
                  placeholder="Candidate Name"
                  value={candForm[e._id]?.name || ""}
                  onChange={(ev) =>
                    setCandForm((p) => ({
                      ...p,
                      [e._id]: { ...p[e._id], name: ev.target.value },
                    }))
                  }
                />
                <input
                  className="input text-xs"
                  placeholder="NID Number"
                  value={candForm[e._id]?.nid || ""}
                  onChange={(ev) =>
                    setCandForm((p) => ({
                      ...p,
                      [e._id]: { ...p[e._id], nid: ev.target.value },
                    }))
                  }
                />
                <input
                  className="input text-xs"
                  placeholder="Party Name"
                  value={candForm[e._id]?.party || ""}
                  onChange={(ev) =>
                    setCandForm((p) => ({
                      ...p,
                      [e._id]: { ...p[e._id], party: ev.target.value },
                    }))
                  }
                />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">Candidate Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-[#0B3C95] hover:file:bg-blue-100"
                    onChange={(ev) => handleFileChange(ev, e._id, "photo")}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">Party Sign / Symbol</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-[#0B3C95] hover:file:bg-blue-100"
                    onChange={(ev) => handleFileChange(ev, e._id, "partySymbol")}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <Button onClick={() => addCand(e._id)} className="w-full text-xs py-2">
                    Add Candidate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
