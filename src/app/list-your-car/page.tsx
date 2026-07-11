"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ListCarForm from "@/components/ListCarForm";

export default function ListYourCarPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("zrac_token");
    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    const storedUser = localStorage.getItem("zrac_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        //
      }
    }
  }, [router]);

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-mist">
      <Header />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-4 rounded-3xl bg-white p-8 shadow-card sm:p-12 lg:p-14">
          <div className="space-y-3">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Publish a car
            </p>
            <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              List your car in minutes
            </h1>
            <p className="max-w-2xl font-body text-sm text-ink/60">
              Add photos, specs, and your WhatsApp contact. Renters will reach out directly — no
              commission, no complex calendar. Just peer-to-peer car sharing.
            </p>
          </div>

          <div className="border-t border-line pt-8">
            <ListCarForm token={token} onSuccess={handleSuccess} />
          </div>
        </div>
      </section>
    </main>
  );
}

