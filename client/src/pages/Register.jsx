import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { registerApi } from "../api/auth.api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      toast.success("Account created. Check email/server console for OTP.");
      nav(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4">
      <div className="card">
        <h3 className="text-2xl font-semibold mb-1">Create account</h3>
        <p className="text-sm text-slate-500 mb-6">
          Join SafeBallot to vote securely
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
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
