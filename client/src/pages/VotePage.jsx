import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getElectionApi } from "../api/election.api";
import { castVoteApi } from "../api/vote.api";
import { verifyFaceApi } from "../api/auth.api";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import { useAuth } from "../store/authStore";

export default function VotePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("candidate") || null;
  });
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState("idle"); // 'idle', 'camera_request', 'scanning', 'comparing', 'success', 'failed'
  const [matchPercent, setMatchPercent] = useState(0);
  const [verifiedSelfie, setVerifiedSelfie] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    getElectionApi(id)
      .then((r) => setElection(r.data.data))
      .catch(() => setElection(false));
  }, [id]);

  if (election === null) return <Loader />;
  if (!election)
    return <p className="p-6 text-slate-500">Election not found.</p>;

  if (!user?.kycComplete) {
    return (
      <div className="max-w-md mx-auto p-4 text-center mt-12">
        <div className="card border-red-100 bg-red-50/50">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            🔒
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">KYC Required</h3>
          <p className="text-slate-600 text-sm mb-6">
            You must complete your identity verification before you can cast a vote.
          </p>
          <Button onClick={() => nav("/kyc")} className="!bg-brand-600 hover:!bg-brand-700 w-full">
            Complete KYC Now
          </Button>
        </div>
      </div>
    );
  }

  const startScanner = async () => {
    setShowScanner(true);
    setScanStatus("camera_request");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanStatus("scanning");
      
      // Auto capture frame after 2.5 seconds of scanning simulation
      setTimeout(() => {
        captureAndMatch();
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error("Webcam access failed. Camera is required for face match verification.");
      setShowScanner(false);
      setScanStatus("idle");
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndMatch = async () => {
    setScanStatus("comparing");
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 150, 150);
      const base64Selfie = canvas.toDataURL("image/jpeg");
      setVerifiedSelfie(base64Selfie);
      stopScanner();

      try {
        const res = await verifyFaceApi({ image: base64Selfie });
        const scoreVal = res.data?.data?.score;
        const percentageScore = (scoreVal * 100).toFixed(1);
        setMatchPercent(percentageScore);
        setScanStatus("success");
        toast.success(`Face matched: ${percentageScore}% similarity!`);
      } catch (err) {
        setScanStatus("failed");
        const errMsg = err.response?.data?.message || "Face matching failed. Please try again.";
        toast.error(errMsg);
      }
    } else {
      setScanStatus("failed");
      stopScanner();
      toast.error("Could not capture frame from webcam");
    }
  };

  const submit = async () => {
    if (!selected) return;
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
      setShowScanner(false);
      setScanStatus("idle");
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
          onClick={startScanner}
          disabled={!selected || loading}
          className="mt-6 w-full"
        >
          Cast Vote
        </Button>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Biometric Face Verification</h3>
              <p className="text-slate-500 text-xs mt-1">
                Scan your face to authorize your vote transaction.
              </p>
            </div>

            {/* Video Frame */}
            <div className="relative w-44 h-44 rounded-full border-4 border-brand-500 overflow-hidden bg-slate-50 flex items-center justify-center">
              {scanStatus === "success" && verifiedSelfie ? (
                <img src={verifiedSelfie} alt="Verified snap" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
              {/* Scanning visualizer laser bar */}
              {scanStatus === "scanning" && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500 shadow-md animate-[bounce_2s_infinite] top-0" />
              )}
            </div>

            {/* Status Information */}
            <div className="w-full">
              {scanStatus === "camera_request" && (
                <p className="text-slate-500 text-sm animate-pulse">Requesting webcam permissions...</p>
              )}
              {scanStatus === "scanning" && (
                <p className="text-brand-600 text-sm font-semibold tracking-wide animate-pulse">
                  Scanning Face Profile...
                </p>
              )}
              {scanStatus === "comparing" && (
                <p className="text-indigo-600 text-sm font-semibold tracking-wide animate-pulse">
                  Analyzing Biometrics...
                </p>
              )}
              {scanStatus === "success" && (
                <div className="space-y-1">
                  <p className="text-emerald-600 font-bold text-sm flex items-center justify-center gap-1.5">
                    ✓ Face Matched Successfully
                  </p>
                  <p className="text-slate-500 text-xs">Similarity Score: <span className="font-semibold text-slate-700">{matchPercent}%</span></p>
                </div>
              )}
              {scanStatus === "failed" && (
                <p className="text-rose-600 font-bold text-sm">⚠️ Matching Failed</p>
              )}
            </div>

            {/* Controls */}
            <div className="w-full flex gap-3">
              {scanStatus === "success" ? (
                <Button onClick={submit} disabled={loading} className="flex-1 !bg-emerald-600 hover:!bg-emerald-700">
                  {loading ? "Recording Vote..." : "Confirm & Cast Vote"}
                </Button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      stopScanner();
                      setShowScanner(false);
                      setScanStatus("idle");
                    }}
                    disabled={scanStatus === "comparing"}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {scanStatus === "failed" && (
                    <Button onClick={startScanner} className="flex-1">
                      Retry Scan
                    </Button>
                  )}
                </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
