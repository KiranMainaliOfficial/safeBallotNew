import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { registerApi } from "../api/auth.api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      toast.success("Account created. Check SMS/email/server console for OTP.");
      nav(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-md w-full">
        <h3 className="text-2xl font-extrabold text-[#0B3C95] mb-1">Create Account</h3>
        <p className="text-sm text-slate-500 mb-6">
          Join Safe Ballot to vote securely
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1234567890"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" disabled={loading} className="w-full !bg-[#0B3C95] hover:!bg-[#072C70] py-3 text-sm">
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </form>
        <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0B3C95] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
