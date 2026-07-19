"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Car as CarIcon,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  LogOut,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  fetchPendingCars,
  fetchAdminCars,
  fetchAdminUsers,
  approveCar,
  rejectCar,
  adminDeleteCar,
  adminDeleteUser,
  clearAuth,
  isAuthError,
} from "../../lib/api";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium font-body animate-in slide-in-from-bottom-4 duration-300 ${
            t.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-body text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white shadow-lg"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      {count !== undefined && (
        <span
          className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold ${
            active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Car Image ────────────────────────────────────────────────────────────────
function CarThumb({ car }) {
  return (
    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
      {car.images?.[0]?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={car.images[0].imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
          No photo
        </div>
      )}
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function VerifiedBadge({ isVerified }) {
  return isVerified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle className="h-3 w-3" /> Approved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="font-body text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Pending Cars Tab ─────────────────────────────────────────────────────────
function PendingTab({ token, toast, onAuthError }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingIds, setActingIds] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPendingCars(token);
      setCars(res.cars || []);
    } catch (err) {
      if (isAuthError(err)) { onAuthError(); return; }
      toast("Failed to load pending cars", "error");
    } finally {
      setLoading(false);
    }
  }, [token, toast, onAuthError]);

  useEffect(() => { load(); }, [load]);

  const act = async (carId, action) => {
    setActingIds((p) => [...p, carId]);
    try {
      if (action === "approve") {
        await approveCar(carId, token);
        toast("Car approved and is now publicly visible.");
      } else {
        await rejectCar(carId, token);
        toast("Car rejected and hidden from public.");
      }
      setCars((p) => p.filter((c) => c._id !== carId));
    } catch (err) {
      if (isAuthError(err)) { onAuthError(); return; }
      toast(err?.message || "Action failed", "error");
    } finally {
      setActingIds((p) => p.filter((id) => id !== carId));
    }
  };

  if (loading) return <LoadingGrid />;

  if (cars.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <CheckCircle className="h-10 w-10 text-emerald-400" />
        <p className="mt-3 font-display text-lg font-bold text-slate-800">All clear!</p>
        <p className="mt-1 font-body text-sm text-slate-500">No cars pending approval right now.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {cars.map((car) => {
        const busy = actingIds.includes(car._id);
        return (
          <div
            key={car._id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:gap-5"
          >
            <CarThumb car={car} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate font-display text-base font-bold text-slate-900">
                {car.brand} {car.model}{" "}
                <span className="font-body text-sm font-normal text-slate-400">({car.year})</span>
              </p>
              <p className="flex items-center gap-1 font-body text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {car.city}
                <span className="mx-1.5 text-slate-300">·</span>
                PKR {car.rentalPricePerDay?.toLocaleString()}/day
              </p>
              {car.owner && (
                <p className="font-body text-xs text-slate-400">
                  Owner: {car.owner.name} ({car.owner.email})
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                disabled={busy}
                onClick={() => act(car._id, "approve")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-body text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" />
                {busy ? "…" : "Approve"}
              </button>
              <button
                disabled={busy}
                onClick={() => act(car._id, "reject")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-body text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                {busy ? "…" : "Reject"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── All Cars Tab ─────────────────────────────────────────────────────────────
function AllCarsTab({ token, toast, onAuthError }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all | pending | approved
  const [actingIds, setActingIds] = useState([]);
  const LIMIT = 15;

  const load = useCallback(async (p = 1, f = filter) => {
    setLoading(true);
    try {
      const verifiedParam = f === "approved" ? true : f === "pending" ? false : undefined;
      const res = await fetchAdminCars(token, { page: p, limit: LIMIT, verified: verifiedParam });
      setCars(res.cars || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      if (isAuthError(err)) { onAuthError(); return; }
      toast("Failed to load cars", "error");
    } finally {
      setLoading(false);
    }
  }, [token, filter, toast, onAuthError]);

  useEffect(() => { load(page, filter); }, [page, filter, load]);

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  const actOnCar = async (carId, action) => {
    setActingIds((p) => [...p, carId]);
    try {
      if (action === "approve") {
        await approveCar(carId, token);
        toast("Car approved.");
        setCars((prev) => prev.map((c) => c._id === carId ? { ...c, isVerified: true } : c));
      } else if (action === "reject") {
        await rejectCar(carId, token);
        toast("Car rejected.");
        setCars((prev) => prev.map((c) => c._id === carId ? { ...c, isVerified: false } : c));
      } else if (action === "delete") {
        if (!window.confirm("Permanently delete this car listing and its images?")) return;
        await adminDeleteCar(carId, token);
        toast("Car deleted.");
        setCars((prev) => prev.filter((c) => c._id !== carId));
      }
    } catch (err) {
      if (isAuthError(err)) { onAuthError(); return; }
      toast(err?.message || "Action failed", "error");
    } finally {
      setActingIds((p) => p.filter((id) => id !== carId));
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Filter chips */}
      <div className="flex gap-2">
        {["all", "pending", "approved"].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold capitalize transition ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => load(page, filter)}
          className="ml-auto flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-body text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingGrid />
      ) : cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12">
          <CarIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-2 font-body text-sm text-slate-500">No cars found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500">Car</th>
                <th className="hidden px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">City</th>
                <th className="hidden px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">Price/Day</th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car) => {
                const busy = actingIds.includes(car._id);
                return (
                  <tr key={car._id} className="group transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CarThumb car={car} />
                        <div>
                          <p className="font-display text-sm font-bold text-slate-900">
                            {car.brand} {car.model}
                          </p>
                          <p className="font-body text-xs text-slate-400">{car.year}</p>
                          {car.owner && (
                            <p className="font-body text-xs text-slate-400">{car.owner.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 font-body text-sm text-slate-600 sm:table-cell">
                      {car.city}
                    </td>
                    <td className="hidden px-4 py-3 font-body text-sm text-slate-600 md:table-cell">
                      PKR {car.rentalPricePerDay?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <VerifiedBadge isVerified={car.isVerified} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!car.isVerified ? (
                          <button
                            disabled={busy}
                            onClick={() => actOnCar(car._id, "approve")}
                            title="Approve"
                            className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() => actOnCar(car._id, "reject")}
                            title="Reject / Un-approve"
                            className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          disabled={busy}
                          onClick={() => actOnCar(car._id, "delete")}
                          title="Delete"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={(p) => { setPage(p); load(p, filter); }} />
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab({ token, toast, onAuthError, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingIds, setDeletingIds] = useState([]);
  const LIMIT = 20;

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers(token, { page: p, limit: LIMIT });
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      if (isAuthError(err)) { onAuthError(); return; }
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [token, toast, onAuthError]);

  useEffect(() => { load(page); }, [page, load]);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}'s account? This will also remove all their car listings.`)) return;
    setDeletingIds((p) => [...p, userId]);
    try {
      await adminDeleteUser(userId, token);
      toast(`${userName} has been deleted.`);
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
    } catch (err) {
      if (isAuthError(err)) { onAuthError(); return; }
      toast(err?.message || "Failed to delete user", "error");
    } finally {
      setDeletingIds((p) => p.filter((id) => id !== userId));
    }
  };

  if (loading) return <LoadingGrid rows={4} />;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
              <th className="hidden px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">Email</th>
              <th className="hidden px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">City</th>
              <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-slate-500">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const uid = user._id || user.id;
              const isMe = uid === currentUserId;
              const busy = deletingIds.includes(uid);
              return (
                <tr key={uid} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-700">
                        {user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="font-body text-xs text-slate-400">
                          {user.isVerified ? "Verified email" : "Unverified email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-body text-sm text-slate-600 sm:table-cell">
                    {user.email}
                  </td>
                  <td className="hidden px-4 py-3 font-body text-sm text-slate-500 md:table-cell">
                    {user.city || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 font-body text-xs font-semibold text-violet-700">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-body text-xs font-semibold text-slate-600">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={busy || isMe}
                      title={isMe ? "Cannot delete your own account" : "Delete user"}
                      onClick={() => handleDelete(uid, user.name)}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={(p) => { setPage(p); load(p); }} />
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingGrid({ rows = 3 }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TABS = ["pending", "all-cars", "users"];

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingCount, setPendingCount] = useState(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  useEffect(() => {
    const t = localStorage.getItem("zrac_token");
    const u = localStorage.getItem("zrac_user");

    if (!t) {
      router.replace("/login");
      return;
    }

    let parsedUser = null;
    if (u) {
      try { parsedUser = JSON.parse(u); } catch {}
    }

    if (!parsedUser?.isAdmin) {
      router.replace("/dashboard");
      return;
    }

    setToken(t);
    setUser(parsedUser);

    // Load pending count badge
    fetchPendingCars(t)
      .then((res) => setPendingCount((res.cars || []).length))
      .catch(() => {});
  }, [router]);

  const handleAuthError = useCallback(() => {
    clearAuth();
    router.replace("/login");
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-700 font-display text-sm font-bold text-white">
                C
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900">
                Car<span className="text-brand-600">khana</span>
              </span>
            </Link>
            <span className="hidden items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 font-body text-xs font-bold text-violet-700 sm:inline-flex">
              <Shield className="h-3 w-3" /> Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-body text-sm text-slate-500 sm:block">
              {user.name}
            </span>
            <Link
              href="/dashboard"
              className="font-body text-sm font-medium text-slate-600 transition hover:text-brand-700"
            >
              My Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 font-body text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 font-body text-sm text-slate-500">
            Manage car listings and users across the platform.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <TabBtn
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            icon={Clock}
            label="Pending Approval"
            count={pendingCount ?? undefined}
          />
          <TabBtn
            active={activeTab === "all-cars"}
            onClick={() => setActiveTab("all-cars")}
            icon={CarIcon}
            label="All Cars"
          />
          <TabBtn
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={Users}
            label="All Users"
          />
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "pending" && (
            <PendingTab token={token} toast={addToast} onAuthError={handleAuthError} />
          )}
          {activeTab === "all-cars" && (
            <AllCarsTab token={token} toast={addToast} onAuthError={handleAuthError} />
          )}
          {activeTab === "users" && (
            <UsersTab
              token={token}
              toast={addToast}
              onAuthError={handleAuthError}
              currentUserId={user.id || user._id}
            />
          )}
        </div>
      </section>

      <Toast toasts={toasts} remove={removeToast} />
    </main>
  );
}
