import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../store/authStore";
import { getMeApi, submitKycApi } from "../api/auth.api";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function KycPage() {
  const { user, token, setAuth } = useAuth();
  const nav = useNavigate();

  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [grandfatherName, setGrandfatherName] = useState("");
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [selfie, setSelfie] = useState(null);
  const [declaration, setDeclaration] = useState(false);

  const [locating, setLocating] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    getMeApi()
      .then((res) => {
        const u = res.data.data;
        setAuth(u, token);
        if (u.phone) {
          setPhone(u.phone);
        }
      })
      .catch(() => {});
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
        toast.success("Location retrieved successfully!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to retrieve location. Please allow permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera. Please upload an image instead.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSelfie(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelfie(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selfie) {
      toast.error("Please capture or upload a selfie");
      return;
    }
    if (!location && !address.trim()) {
      toast.error("Please capture your GPS location OR enter your full physical address");
      return;
    }
    if (!declaration) {
      toast.error("You must accept the legal declaration");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        selfie,
        location: location || undefined,
        address: address.trim() || undefined,
        nid,
        phone,
        fatherName,
        grandfatherName,
        declarationAccepted: declaration,
      };

      const res = await submitKycApi(payload);
      toast.success("KYC Completed successfully!");
      setAuth(res.data.data, token);
      nav("/elections");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 grid place-items-center text-xl font-bold">
            👤
          </span>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">KYC Verification</h3>
            <p className="text-slate-500 text-sm">
              Complete your verification to become eligible to cast votes securely.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="text"
              placeholder="e.g. +1234567890"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="National ID (NID)"
              type="text"
              placeholder="Enter NID Number"
              required
              value={nid}
              onChange={(e) => setNid(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Father's Full Name"
              type="text"
              placeholder="Enter Father's name"
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
            />
            <Input
              label="Grandfather's Full Name"
              type="text"
              placeholder="Enter Grandfather's name"
              required
              value={grandfatherName}
              onChange={(e) => setGrandfatherName(e.target.value)}
            />
          </div>

          {/* Location & Address Verification */}
          <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">
                1. Location or Address Verification
              </label>
              <p className="text-slate-500 text-xs">
                To be eligible to vote, you must provide either your GPS coordinates or enter your physical address.
              </p>
            </div>

            {/* GPS Option */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-white border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Option A: Geolocation GPS</p>
                {location ? (
                  <p className="text-emerald-700 text-sm font-medium mt-1 flex items-center gap-1.5">
                    ✓ GPS Captured: {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                  </p>
                ) : (
                  <p className="text-slate-500 text-xs mt-1">
                    Allow device GPS permissions to retrieve coordinates.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition whitespace-nowrap"
              >
                {locating ? "Locating..." : location ? "Re-detect GPS" : "Capture GPS"}
              </button>
            </div>

            {/* Address Option */}
            <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Option B: Physical Address</p>
              <Input
                type="text"
                placeholder="Enter street, city, state, and zip code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Selfie Capture */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              2. Selfie Verification
            </label>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Selfie Frame / Preview */}
              <div className="relative w-48 h-48 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                {selfie ? (
                  <img src={selfie} alt="Selfie preview" className="w-full h-full object-cover" />
                ) : cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <span className="text-slate-400 text-4xl">📸</span>
                )}
              </div>

              {/* Webcam Controls & Uploader */}
              <div className="flex-1 space-y-3">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Take a clean photo facing the camera. Ensure your face is fully visible in well-lit conditions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {!cameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                    >
                      Use Live Camera
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                      >
                        Snap Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 cursor-pointer inline-block text-center transition">
                    Upload Selfie File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Legal Declaration */}
          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-1 accent-brand-600 rounded"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I hereby declare that all information, documents, and coordinates supplied in this profile are valid, authentic, and legally true. I support legal guidelines and declare I am completing this KYC on my own accord.
              </span>
            </label>
          </div>

          {/* Submission button */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Submitting KYC..." : "Submit Verification Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
