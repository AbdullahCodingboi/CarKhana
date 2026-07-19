"use client";

import { useEffect, useState } from "react";
import { Plus, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "../lib/api";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const setLoginState = () => {
      if (typeof window === "undefined") return;
      const storedUser = window.localStorage.getItem("zrac_user");
      setIsLoggedIn(Boolean(storedUser));
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setIsAdmin(Boolean(parsed?.isAdmin));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    setLoginState();
    window.addEventListener("storage", setLoginState);
    return () => window.removeEventListener("storage", setLoginState);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-700 font-display text-sm font-bold text-white">
            C
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Car<span className="text-brand-600">khana</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 font-body text-sm font-medium text-ink/70 md:flex">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="transition hover:text-brand-700">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/signup" className="transition hover:text-brand-700">
                Sign up
              </Link>
              <Link href="/login" className="transition hover:text-brand-700">
                Login
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 font-body text-sm font-semibold text-white shadow-card transition hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            List your car
          </Link>
        </div>
      </div>
    </header>
  );
}
