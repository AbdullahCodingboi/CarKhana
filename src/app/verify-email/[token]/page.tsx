"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function VerifyEmailTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setMessage("Verification token is missing from the URL.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email/${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || "Token invalid or expired.");
        }
        setSuccess(true);
        setMessage("Success! Your email is verified, and your account is now active.");
      } catch (err) {
        setSuccess(false);
        setMessage(err instanceof Error ? err.message : "Unable to verify your email.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200/60 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-400 border-t-transparent" />
          ) : success ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          ) : (
            <XCircle className="h-8 w-8 text-rose-600" />
          )}
        </div>

        <h1 className="mt-6 text-center font-display text-2xl font-bold text-slate-950">
          {loading ? "Verifying your email…" : success ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mt-4 text-center font-body text-sm text-slate-600">{message}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
