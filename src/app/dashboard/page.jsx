"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, LogOut, Car as CarIcon, X, Pencil } from "lucide-react";
import Header from "../../components/Header";
import ListCarForm from "../../components/ListCarForm";
import { clearAuth, deleteCar, fetchMyCars, isAuthError, unlistCar } from "../../lib/api";

const STATUS_STYLES = {
  available: "bg-emerald-50 text-emerald-700",
  booked: "bg-amber-50 text-amber-700",
  unavailable: "bg-ink/5 text-ink/40",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);
  const [unlistingIds, setUnlistingIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("zrac_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setToken(token);
    const storedUser = localStorage.getItem("zrac_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore malformed user data
      }
    }

    const loadCars = async () => {
      try {
        const res = await fetchMyCars(token);
        setCars(res.cars);
      } catch (err) {
        if (isAuthError(err)) {
          clearAuth();
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load your cars.");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("zrac_token");
    localStorage.removeItem("zrac_user");
    router.push("/");
  };

  const handleDeleteCar = async (carId) => {
    if (!token || !window.confirm("Are you sure you want to delete this car listing?")) {
      return;
    }

    setDeletingIds((current) => [...current, carId]);
    setError(null);

    try {
      await deleteCar(carId, token);
      setCars((current) => current.filter((car) => car._id !== carId));
    } catch (err) {
      if (isAuthError(err)) {
        clearAuth();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to delete the car.");
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== carId));
    }
  };

  const handleUnlistCar = async (carId) => {
    if (!token) return;

    setUnlistingIds((current) => [...current, carId]);
    setError(null);

    try {
      const res = await unlistCar(carId, token);
      setCars((current) =>
        current.map((car) => (car._id === carId ? res.car : car))
      );
    } catch (err) {
      if (isAuthError(err)) {
        clearAuth();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to unlist the car.");
    } finally {
      setUnlistingIds((current) => current.filter((id) => id !== carId));
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingCar(null);
    if (token) {
      fetchMyCars(token)
        .then((res) => setCars(res.cars))
        .catch(() => {});
    }
  };

  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {user ? `${user.name}'s listings` : "Your listings"}
            </h1>
            <p className="mt-1 font-body text-sm text-muted">
              {loading ? "Loading…" : `${cars.length} car${cars.length === 1 ? "" : "s"} posted`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 font-body text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Add a car
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 font-body text-sm font-medium text-ink/60 transition hover:border-brand-300 hover:text-brand-700"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>

        {/* Add car form modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/40 px-4 py-4 sm:items-center sm:justify-center sm:px-6 sm:py-6">
            <div className="relative w-full max-h-[calc(100vh-3.5rem)] overflow-hidden overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-2xl sm:max-h-[calc(100vh-4rem)] sm:rounded-3xl sm:p-10">
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink transition hover:bg-slate-200 sm:right-6 sm:top-6"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-8 space-y-2 pr-8">
                <p className="font-body text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Add your car
                </p>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Post a listing in minutes
                </h2>
                <p className="font-body text-sm text-ink/60">
                  Add photos, specs, and your WhatsApp — renters reach you directly.
                </p>
              </div>

              {token && (
                <ListCarForm
                  token={token}
                  onSuccess={handleFormSuccess}
                />
              )}
            </div>
          </div>
        )}

        {/* Edit car form modal */}
        {editingCar && (
          <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/40 px-4 py-4 sm:items-center sm:justify-center sm:px-6 sm:py-6">
            <div className="relative w-full max-h-[calc(100vh-3.5rem)] overflow-hidden overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-2xl sm:max-h-[calc(100vh-4rem)] sm:rounded-3xl sm:p-10">
              <button
                onClick={() => setEditingCar(null)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink transition hover:bg-slate-200 sm:right-6 sm:top-6"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-8 space-y-2 pr-8">
                <p className="font-body text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Edit your car
                </p>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Update your listing
                </h2>
                <p className="font-body text-sm text-ink/60">
                  Change any details — renters will see the updated listing right away.
                </p>
              </div>

              {token && (
                <ListCarForm
                  token={token}
                  carId={editingCar._id}
                  initialData={editingCar}
                  onSuccess={handleFormSuccess}
                />
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-body text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-line bg-white" />
            ))}
          </div>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50">
              <CarIcon className="h-5 w-5 text-brand-600" />
            </span>
            <p className="mt-4 font-display text-lg font-bold text-ink">No cars posted yet</p>
            <p className="mt-1 font-body text-sm text-muted">
              List your first car so renters can find and message you.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Add a car
            </button>
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
  <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
    {cars.map((car) => (
      <div
        key={car._id}
        className="group relative flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover sm:flex-row sm:gap-5"
      >
        <Link href={`/cars/${car._id}`} className="flex flex-1 flex-col gap-4 sm:flex-row sm:gap-5">
          <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-surface sm:h-32 sm:w-40">
            {car.images?.[0]?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={car.images[0].imageUrl}
                alt={`${car.brand} ${car.model}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-xs text-ink/25">
                No photo
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
            <div>
              <p className="truncate font-display text-lg font-bold text-ink">
                {car.brand} {car.model}
              </p>
              <p className="mt-1 flex items-center gap-1 font-body text-sm text-muted">
                <MapPin className="h-3.5 w-3.5" /> {car.city} · {car.year}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-base font-semibold text-ink">
                ${car.rentalPricePerDay}
                <span className="font-body text-xs font-normal text-muted"> /day</span>
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold capitalize ${STATUS_STYLES[car.availabilityStatus]}`}
              >
                {car.availabilityStatus}
              </span>
            </div>
          </div>
        </Link>

        <div className="flex gap-2 border-t border-line pt-3 sm:mt-0 sm:w-32 sm:flex-col sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setEditingCar(car);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 font-body text-sm font-semibold text-ink/70 transition hover:bg-surface hover:text-ink sm:flex-none"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>

          {car.availabilityStatus !== "unavailable" ? (
            <button
              type="button"
              disabled={unlistingIds.includes(car._id)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleUnlistCar(car._id);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 font-body text-sm font-semibold text-ink/70 transition hover:bg-surface disabled:cursor-wait disabled:opacity-60 sm:flex-none"
            >
              {unlistingIds.includes(car._id) ? "…" : "Unlist"}
            </button>
          ) : (
            <button
              type="button"
              disabled={unlistingIds.includes(car._id)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleUnlistCar(car._id, "available");
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 font-body text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-wait disabled:opacity-60 sm:flex-none"
            >
              {unlistingIds.includes(car._id) ? "…" : "Relist"}
            </button>
          )}

          <button
            type="button"
            disabled={deletingIds.includes(car._id)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDeleteCar(car._id);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 font-body text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 sm:flex-none"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
)}
      </section>
    </main>
  );
}