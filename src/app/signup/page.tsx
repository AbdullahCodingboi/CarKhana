"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Link2,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { signupUser, loginUser } from "../../lib/api";

const initialForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  whatsapp: "",
  bio: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-body text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-sm font-medium text-slate-900">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

const PERKS = [
  { icon: Zap, text: "List a car in under two minutes" },
  { icon: MessageCircle, text: "Renters reach you straight on WhatsApp" },
  { icon: ShieldCheck, text: "No fees — we never touch the money" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("zrac_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.username || !form.email || !form.password) {
      setError("Username, email, and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      const signupResponse = await signupUser(payload);

      if (signupResponse?.token && signupResponse?.user) {
        localStorage.setItem("zrac_token", signupResponse.token);
        localStorage.setItem("zrac_user", JSON.stringify(signupResponse.user));
        router.push("/dashboard");
        return;
      }

      const loginResponse = await loginUser({ email: payload.email, password: payload.password });
      localStorage.setItem("zrac_token", loginResponse.token);
      localStorage.setItem("zrac_user", JSON.stringify(loginResponse.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-400 px-4  sm:px-6">
      <div className="grid w-full m-10 max-w-3xl grid-cols-1 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200/70 lg:grid-cols-2">
        {/* Left — brand panel */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-9">
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="absolute inset-0 bg-slate-950/30" />

          <Link href="/" className="relative z-10 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
              <Link2 className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[1.05rem] font-bold leading-none text-white">
              CarKhana
              <span className="block text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/50">
                Rent A Car
              </span>
            </span>
          </Link>

          <div className="relative z-10">
            <h1 className="max-w-xs font-display text-3xl font-bold leading-[1.15] tracking-tight text-white">
              Your car, your terms. We just make the introduction.
            </h1>
            <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-white/60">
              Post it once, and anyone interested messages you directly on WhatsApp.
              No commission, no calendar to manage on our end.
            </p>

            <ul className="mt-7 space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-brand-200" />
                  </span>
                  <span className="font-body text-sm text-white/75">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — form panel */}
        <div className="bg-white px-6 py-8 sm:px-9 sm:py-10">
          <div className="w-full">
            {/* Mobile-only compact brand mark */}
            <Link href="/" className="mb-7 flex items-center gap-2.5 lg:hidden">
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

            {success ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-card">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-100">
                  <CheckCircle2 className="h-6 w-6 text-brand-600" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-slate-950">
                  You're in, {form.username}
                </h2>
                <p className="mt-2 font-body text-sm leading-relaxed text-slate-600">
                  Your account has been created. Log in to start listing your car or browsing
                  others.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 py-3 font-body text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                >
                  Back to browsing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-slate-950">Create your account</h2>
                <p className="mt-1.5 font-body text-sm text-slate-600">
                  Free forever. List a car, or start browsing what's out there.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                  <Field label="Username" required>
                    <input
                      value={form.username}
                      onChange={update("username")}
                      placeholder="e.g. CarKhana_k"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Email" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Password" required>
                      <input
                        type="password"
                        value={form.password}
                        onChange={update("password")}
                        placeholder="6+ characters"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Confirm" required>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={update("confirmPassword")}
                        placeholder="Repeat password"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="my-1 flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="font-body text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      So people can reach you
                    </span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* <Field label="Phone" required={true}>
                      <input
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+92 3xx xxxxxxx"
                        className={inputClass}
                      />
                    </Field> 
                   
                  </div> */}
 <Field label="WhatsApp" required={true}>
                      <input
                        value={form.whatsapp}
                        onChange={update("whatsapp")}
                        placeholder="+92 3xx xxxxxxx"
                        className={inputClass}
                      />
                    </Field>
                  <Field label="City" required={true}>
                    <input
                      value={form.city}
                      onChange={update("city")}
                      placeholder="e.g. Karachi"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Bio" required={false}>
                    <textarea
                      value={form.bio}
                      onChange={update("bio")}
                      placeholder="A short line about yourself (optional)"
                      rows={2}
                      className={inputClass}
                    />
                  </Field>

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
                    {submitting ? "Creating account…" : "Create account"}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </button>

                  <p className="text-center font-body text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
                      Log in
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}