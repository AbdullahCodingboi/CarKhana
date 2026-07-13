import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function VerifyEmailIndexPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200/60 sm:p-10">
        <h1 className="text-center font-display text-3xl font-bold text-slate-950">Email verification</h1>
        <p className="mt-4 text-center font-body text-sm text-slate-600">
          If you are here after clicking your verification email, make sure the URL contains the token path segment.
          The link should look like <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">/verify-email/&lt;token&gt;</code>.
        </p>
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
