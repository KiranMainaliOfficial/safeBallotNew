import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  listElectionsApi,
  createElectionApi,
  setStatusApi,
  addCandidateApi,
} from "../../api/election.api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { fmtDate } from "../../utils/formatters";

export default function ManageElections() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [candForm, setCandForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    listElectionsApi()
      .then((r) => setItems(r.data.data))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createElectionApi(form);
      toast.success("Election created");
      setForm({ title: "", description: "", startTime: "", endTime: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
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

  const addCand = async (id) => {
    const c = candForm[id];
    if (!c?.name) return toast.error("Name required");
    try {
      await addCandidateApi(id, c);
      toast.success("Candidate added");
      setCandForm((p) => ({ ...p, [id]: { name: "", party: "" } }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (!items) return <Loader />;

  return (
    <div className="p-4 space-y-6">
      <div className="card">
        <h4 className="font-semibold mb-4">Create Election</h4>
        <form
          onSubmit={create}
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
          <div className="md:col-span-2">
            <Button disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
          </div>
        </form>
      </div>
      <div className="space-y-4">
        {items.map((e) => (
          <div key={e._id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">{e.title}</h4>
                <p className="text-xs text-slate-500">
                  {fmtDate(e.startTime)} → {fmtDate(e.endTime)}
                </p>
                <p className="text-xs mt-1">
                  Status: <span className="font-medium">{e.status}</span> · ID:{" "}
                  <span className="font-mono">{e._id}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {e.status !== "active" && (
                  <button
                    onClick={() => updateStatus(e._id, "active")}
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700"
                  >
                    Activate
                  </button>
                )}
                {e.status !== "closed" && (
                  <button
                    onClick={() => updateStatus(e._id, "closed")}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-200 text-slate-700"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium mb-2">Add candidate</p>{" "}
              <div className="flex flex-col md:flex-row gap-2">
                {" "}
                <input
                  className="input"
                  placeholder="Name"
                  value={candForm[e._id]?.name || ""}
                  onChange={(ev) =>
                    setCandForm((p) => ({
                      ...p,
                      [e._id]: { ...p[e._id], name: ev.target.value },
                    }))
                  }
                />{" "}
                <input
                  className="input"
                  placeholder="Party"
                  value={candForm[e._id]?.party || ""}
                  onChange={(ev) =>
                    setCandForm((p) => ({
                      ...p,
                      [e._id]: { ...p[e._id], party: ev.target.value },
                    }))
                  }
                />{" "}
                <Button onClick={() => addCand(e._id)} className="md:w-auto">
                  {" "}
                  Add{" "}
                </Button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
