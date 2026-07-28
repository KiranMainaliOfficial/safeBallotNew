import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { getMeApi } from "../api/auth.api";
import Loader from "../components/common/Loader";
import { fmtDate } from "../utils/formatters";

export default function MyDetails() {
  const { user, token, setAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then((res) => {
        setProfile(res.data.data);
        setAuth(res.data.data, token);
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;
  if (!profile) return <p className="p-6 text-slate-500">Failed to load details.</p>;

  const kyc = profile.kycData || {};

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="card space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
              {kyc.selfie ? (
                <img src={kyc.selfie} alt="Selfie" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 text-3xl">👤</span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{profile.name}</h3>
              <p className="text-slate-500 text-sm">{profile.email}</p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              profile.kycComplete
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            {profile.kycComplete ? "✓ KYC Verified" : "⚠️ KYC Incomplete"}
          </span>
        </div>

        {/* Verification Alert if not completed */}
        {!profile.kycComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-amber-800 font-semibold text-sm">KYC Completion Required</h4>
              <p className="text-amber-700 text-xs mt-0.5">
                You must complete the verification process to cast votes in active elections.
              </p>
            </div>
            <Link
              to="/kyc"
              className="btn-primary !bg-amber-600 hover:!bg-amber-700 text-xs whitespace-nowrap self-start sm:self-center"
            >
              Complete KYC Now
            </Link>
          </div>
        )}

        {/* Details Grid */}
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Voter Profile Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 block mb-0.5">Full Name</span>
                <span className="text-sm font-medium text-slate-700">{profile.name}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 block mb-0.5">Registered Email</span>
                <span className="text-sm font-medium text-slate-700">{profile.email}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 block mb-0.5">Phone Number</span>
                <span className="text-sm font-medium text-slate-700">{kyc.phone || profile.phone || "Not set"}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400 block mb-0.5">National ID (NID)</span>
                <span className="text-sm font-medium text-slate-700">{kyc.nid || "Not set"}</span>
              </div>
            </div>
          </div>

          {profile.kycComplete && (
            <>
              {/* Family Verification Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Family Declaration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-400 block mb-0.5">Father's Full Name</span>
                    <span className="text-sm font-medium text-slate-700">{kyc.fatherName}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-400 block mb-0.5">Grandfather's Full Name</span>
                    <span className="text-sm font-medium text-slate-700">{kyc.grandfatherName}</span>
                  </div>
                </div>
              </div>

              {/* Verified Location or Address */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Location & Address Details</h4>
                <div className="space-y-3">
                  {kyc.location?.latitude && (
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400 block mb-0.5">GPS Location Coordinates</span>
                        <span className="text-sm font-medium text-slate-700">
                          {kyc.location.latitude.toFixed(6)}°, {kyc.location.longitude.toFixed(6)}°
                        </span>
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">GPS Verified</span>
                    </div>
                  )}
                  {kyc.address && (
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-xs text-slate-400 block mb-0.5">Physical Full Address</span>
                      <span className="text-sm font-medium text-slate-700 block mt-1 leading-relaxed">{kyc.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Auditing and Timestamps */}
              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-2">
                <span>Verification Submitted: {fmtDate(kyc.submittedAt)}</span>
                <span>User Role: <strong className="text-slate-500 font-semibold">{profile.role}</strong></span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
