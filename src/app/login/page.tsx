"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, ArrowRight } from "lucide-react";
import { loginUser } from "../../lib/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-body text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("zrac_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const { token, user } = await loginUser({ email, password });
      localStorage.setItem("zrac_token", token);
      localStorage.setItem("zrac_user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200/60 sm:p-9">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white">
            <Link2 className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[1.05rem] font-bold leading-none text-slate-950">
            CarKhana
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
              Rent A Car
            </span>
          </span>
        </Link>

        <h1 className="text-center font-display text-2xl font-bold text-slate-950">Welcome back</h1>
        <p className="mt-1.5 text-center font-body text-sm text-slate-600">
          Log in to manage your listings or message an owner.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block font-body text-sm font-medium text-slate-900">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-body text-sm font-medium text-slate-900">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className={inputClass}
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 py-3 font-body text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center font-body text-xs text-ink/40">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-brand-700 hover:text-brand-800">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}