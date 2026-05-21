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
      nav(data.data.user.role === "admin" ? "/admin" : "/elections");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4">
      {" "}
      <div className="card">
        {" "}
        <h3 className="text-2xl font-semibold mb-1">Sign in</h3>{" "}
        <p className="text-sm text-slate-500 mb-6">
          {" "}
          Access your SafeBallot account{" "}
        </p>{" "}
        <form onSubmit={submit} className="space-y-4">
          {" "}
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />{" "}
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />{" "}
          <Button type="submit" disabled={loading} className="w-full">
            {" "}
            {loading ? "Signing in…" : "Sign in"}{" "}
          </Button>{" "}
        </form>{" "}
        <p className="text-sm text-slate-500 mt-4">
          {" "}
          New here?{" "}
          <Link to="/register" className="text-brand-600 font-medium">
            {" "}
            Create an account{" "}
          </Link>{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
