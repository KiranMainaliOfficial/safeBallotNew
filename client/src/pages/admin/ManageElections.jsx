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
  getElectionApi,
  updateCandidateApi,
  deleteCandidateApi,
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
  const [busy, setBusy] = useState(false);

  // Candidate management states
  const [selectedElectionForCandidates, setSelectedElectionForCandidates] = useState(null);
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [newCand, setNewCand] = useState({ name: "", party: "", bio: "", nid: "", photo: "", partySymbol: "" });
  const [editCandForm, setEditCandForm] = useState({ name: "", party: "", bio: "", nid: "", photo: "", partySymbol: "" });

  const load = () =>
    listElectionsApi()
      .then((r) => setItems(r.data.data))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const loadCandidates = (electionId) => {
    getElectionApi(electionId)
      .then((res) => {
        setSelectedElectionForCandidates(res.data.data);
      })
      .catch(() => {
        toast.error("Failed to load candidates");
      });
  };

  const selectElectionForCandidates = (election) => {
    setSelectedElectionForCandidates(election);
    loadCandidates(election._id);
  };

  const handleNewFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCand((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditCandForm((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCand.name) return toast.error("Name required");
    if (!newCand.nid) return toast.error("NID required");
    try {
      await addCandidateApi(selectedElectionForCandidates._id, newCand);
      toast.success("Candidate added");
      setNewCand({ name: "", party: "", bio: "", nid: "", photo: "", partySymbol: "" });
      loadCandidates(selectedElectionForCandidates._id);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add candidate");
    }
  };

  const startEditCandidate = (candidate) => {
    setEditingCandidateId(candidate._id);
    setEditCandForm({
      name: candidate.name,
      party: candidate.party || "",
      bio: candidate.bio || "",
      nid: candidate.nid,
      photo: "",
      partySymbol: "",
      photoUrl: candidate.photoUrl || "",
      partySymbolUrl: candidate.partySymbolUrl || "",
    });
  };

  const handleSaveCandidate = async (candidateId) => {
    if (!editCandForm.name) return toast.error("Name required");
    if (!editCandForm.nid) return toast.error("NID required");
    try {
      await updateCandidateApi(selectedElectionForCandidates._id, candidateId, editCandForm);
      toast.success("Candidate updated");
      setEditingCandidateId(null);
      loadCandidates(selectedElectionForCandidates._id);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update candidate");
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate? All their votes will be permanently deleted!")) return;
    try {
      await deleteCandidateApi(selectedElectionForCandidates._id, candidateId);
      toast.success("Candidate deleted");
      loadCandidates(selectedElectionForCandidates._id);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete candidate");
    }
  };

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

      {selectedElectionForCandidates ? (
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Candidates Manager</h4>
              <p className="text-xs text-slate-500">Election: <span className="font-semibold text-[#0B3C95]">{selectedElectionForCandidates.title}</span></p>
            </div>
            <button
              onClick={() => setSelectedElectionForCandidates(null)}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              ← Back to Elections
            </button>
          </div>

          {/* Existing Candidates List */}
          <div className="space-y-4 mb-8">
            <h5 className="font-bold text-slate-700 text-sm">Configure Candidates</h5>
            {(!selectedElectionForCandidates.candidates || selectedElectionForCandidates.candidates.length === 0) ? (
              <p className="text-sm text-slate-400">No candidates added yet. Add one below.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {selectedElectionForCandidates.candidates.map((cand) => {
                  const isEditing = editingCandidateId === cand._id;
                  return (
                    <div key={cand._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-start justify-between">
                      {isEditing ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveCandidate(cand._id); }} className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-3 font-semibold text-xs text-slate-500 mb-1 border-b border-slate-200 pb-1">Editing Candidate Info</div>
                          <Input
                            label="Candidate Name"
                            required
                            value={editCandForm.name}
                            onChange={(ev) => setEditCandForm({ ...editCandForm, name: ev.target.value })}
                          />
                          <Input
                            label="NID Number"
                            required
                            value={editCandForm.nid}
                            onChange={(ev) => setEditCandForm({ ...editCandForm, nid: ev.target.value })}
                          />
                          <Input
                            label="Party Name"
                            value={editCandForm.party}
                            onChange={(ev) => setEditCandForm({ ...editCandForm, party: ev.target.value })}
                          />
                          <div className="md:col-span-3">
                            <Input
                              label="Biography"
                              value={editCandForm.bio}
                              onChange={(ev) => setEditCandForm({ ...editCandForm, bio: ev.target.value })}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-semibold mb-1">New Photo (Optional)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-[#0B3C95] hover:file:bg-blue-100"
                              onChange={(ev) => handleEditFileChange(ev, "photo")}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-semibold mb-1">New Party Symbol (Optional)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-[#0B3C95] hover:file:bg-blue-100"
                              onChange={(ev) => handleEditFileChange(ev, "partySymbol")}
                            />
                          </div>
                          <div className="md:col-span-3 flex justify-end gap-2 mt-2 border-t border-slate-200 pt-2">
                            <button
                              type="submit"
                              className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                            >
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCandidateId(null)}
                              className="text-xs px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex gap-4 items-center">
                            {cand.photoUrl ? (
                              <img src={cand.photoUrl} alt={cand.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">No Image</div>
                            )}
                            <div>
                              <h6 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                {cand.name}
                                {cand.partySymbolUrl && (
                                  <img src={cand.partySymbolUrl} alt="symbol" className="w-5 h-5 rounded-full object-contain" />
                                )}
                              </h6>
                              <p className="text-xs text-slate-500">Party: <span className="font-semibold">{cand.party || "Independent"}</span> · NID: <span className="font-mono">{cand.nid}</span></p>
                              <p className="text-xs text-slate-400 mt-1 max-w-lg">{cand.bio || "No biography provided."}</p>
                              <p className="text-xs text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full inline-block mt-2 font-semibold">Votes: {cand.voteCount || 0}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 md:mt-0">
                            <button
                              onClick={() => startEditCandidate(cand)}
                              className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-[#0B3C95] hover:bg-blue-100 transition font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCandidate(cand._id)}
                              className="text-xs px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Candidate Form */}
          <div className="border-t border-slate-100 pt-6">
            <h5 className="font-bold text-slate-700 text-sm mb-4">Add New Candidate</h5>
            <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Candidate Name"
                required
                value={newCand.name}
                onChange={(ev) => setNewCand({ ...newCand, name: ev.target.value })}
              />
              <Input
                label="NID Number"
                required
                value={newCand.nid}
                onChange={(ev) => setNewCand({ ...newCand, nid: ev.target.value })}
              />
              <Input
                label="Party Name"
                value={newCand.party}
                onChange={(ev) => setNewCand({ ...newCand, party: ev.target.value })}
              />
              <div className="md:col-span-3">
                <Input
                  label="Biography"
                  value={newCand.bio}
                  onChange={(ev) => setNewCand({ ...newCand, bio: ev.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold mb-1">Candidate Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-[#0B3C95] hover:file:bg-blue-100"
                  onChange={(ev) => handleNewFileChange(ev, "photo")}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold mb-1">Party Symbol / Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-[#0B3C95] hover:file:bg-blue-100"
                  onChange={(ev) => handleNewFileChange(ev, "partySymbol")}
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit">Add Candidate</Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
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
                    <button
                      onClick={() => selectElectionForCandidates(e)}
                      className="font-semibold text-lg text-slate-800 hover:text-[#0B3C95] hover:underline text-left cursor-pointer transition"
                    >
                      {e.title}
                    </button>
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
                      onClick={() => selectElectionForCandidates(e)}
                      className="text-xs px-3 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition font-bold"
                    >
                      Manage Candidates
                    </button>
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
