import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { verifyOtpApi } from "../api/auth.api";

export default function VerifyOtp() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [email, setEmail] = useState(params.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtpApi({ email, otp });
      toast.success("Email verified. Please sign in.");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4">
      <div className="card">
        <h3 className="text-2xl font-semibold mb-1">Verify your email</h3>
        <p className="text-sm text-slate-500 mb-6">
          Enter the 6-digit code we sent.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="OTP"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying…" : "Verify"}
          </Button>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
