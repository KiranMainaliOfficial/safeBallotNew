import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { loginApi } from "../api/auth.api";
import { useAuth } from "../store/authStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      setAuth(data.data.user, data.data.accessToken);
      toast.success("Welcome back");
      
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect");
      if (redirectTo) {
        nav(redirectTo);
      } else {
        nav(data.data.user.role === "admin" ? "/admin" : "/elections");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-md w-full">
        <h3 className="text-2xl font-extrabold text-[#0B3C95] mb-1">Sign In</h3>
        <p className="text-sm text-slate-500 mb-6">
          Access your secure Safe Ballot account
        </p>
        <form onSubmit={submit} className="space-y-4">
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
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" disabled={loading} className="w-full !bg-[#0B3C95] hover:!bg-[#072C70] py-3 text-sm">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">
          New here?{" "}
          <Link to="/register" className="text-[#0B3C95] font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
