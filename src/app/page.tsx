"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { SlidersHorizontal, X, MessagesSquare, UploadCloud, Handshake } from "lucide-react";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import FilterSidebar from "@/components/FilterSidebar";
import CarCard from "@/components/CarCard";
import { fetchCars, type Car, type CarFilters } from "@/lib/api";

const SORTS: { value: NonNullable<CarFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "lowestPrice", label: "Price: low to high" },
  { value: "highestPrice", label: "Price: high to low" },
  { value: "mileage", label: "Lowest mileage" },
  { value: "year", label: "Newest model year" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [filters, setFilters] = useState<CarFilters>({ sort: "newest", page: 1, limit: 12 });
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchPrompt, setAiSearchPrompt] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const lastAiRequestRef = useRef({ search: "", city: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCars({ ...filters, search, city });
      setCars(res.cars);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong loading listings.");
    } finally {
      setLoading(false);
    }
  }, [filters, search, city]);

  const runAiSearch = useCallback(
    async (query: string, cityValue: string) => {
      if (!query.trim()) {
        return;
      }

      if (
        lastAiRequestRef.current.search === query &&
        lastAiRequestRef.current.city === cityValue
      ) {
        return;
      }

      lastAiRequestRef.current = { search: query, city: cityValue };
      setAiSearching(true);
      setAiError(null);

      try {
        const response = await axios.post("/api/ai-search", {
          query,
          city: cityValue,
        });

        const parsed = response.data;
        console.log("AI parsed result:", parsed);

        const nextSearch = parsed.search ?? query;
        const nextCity = parsed.city ?? cityValue;

        setAiSearchPrompt(nextSearch);
        setSearch(nextSearch);
        setCity(nextCity);
        setFilters((prev) => ({
          ...prev,
          page: 1,
          brand: parsed.brand ?? prev.brand,
          model: parsed.model ?? prev.model,
          carType: parsed.carType ?? prev.carType,
          fuelType: parsed.fuelType ?? prev.fuelType,
          transmission: parsed.transmission ?? prev.transmission,
          condition: parsed.condition ?? prev.condition,
          driverOption: parsed.driverOption ?? prev.driverOption,
          priceMin: parsed.priceMin ?? prev.priceMin,
          priceMax: parsed.priceMax ?? prev.priceMax,
        }));
      } catch (err) {
        setAiSearchPrompt(null);
        if (axios.isAxiosError(err) && err.response?.data?.error) {
          setAiError(String(err.response.data.error));
        } else {
          setAiError(err instanceof Error ? err.message : "AI search failed. Please try again.");
        }
      } finally {
        setAiSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!aiMode) {
      return;
    }

    const timer = window.setTimeout(() => {
      runAiSearch(search, city);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [aiMode, search, city, runAiSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilter = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ sort: "newest", page: 1, limit: 12 });
    setSearch("");
    setCity("");
  };

  return (
    <main className="min-h-screen bg-mist">
      <Header />

      <HeroSearch
        search={search}
        displaySearch={aiSearching && aiSearchPrompt ? aiSearchPrompt : undefined}
        city={city}
        aiMode={aiMode}
        onSearchChange={(value) => {
          setAiSearchPrompt(null);
          setSearch(value);
        }}
        onCityChange={(value) => {
          setAiSearchPrompt(null);
          setCity(value);
        }}
        onSubmit={() => setFilters((prev) => ({ ...prev, page: 1 }))}
        onAiModeToggle={() => setAiMode((prev) => !prev)}
        aiSearching={aiSearching}
        totalCount={total}
      />
      {aiError && (
        <div className="mx-auto mt-3 max-w-7xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700 sm:px-6 lg:px-8">
          {aiError}
        </div>
      )}

      <section id="browse" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Sidebar — desktop */}
          <div className="hidden sm:block">
            <FilterSidebar filters={filters} onChange={updateFilter} onReset={resetFilters} />
          </div>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 flex sm:hidden">
              <div
                className="absolute inset-0 bg-ink/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="relative ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-mist p-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mb-3 flex items-center gap-1 font-body text-sm text-ink/60"
                >
                  <X className="h-4 w-4" /> Close
                </button>
                <FilterSidebar filters={filters} onChange={updateFilter} onReset={resetFilters} />
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Available listings</h2>
                <p className="font-body text-sm text-ink/50">
                  {loading ? "Loading…" : `${total} car${total === 1 ? "" : "s"} found`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 font-body text-sm font-medium text-ink/70 sm:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value as CarFilters["sort"])}
                  className="rounded-md border border-line bg-white px-3 py-2 font-body text-sm text-ink/70 focus:border-brand-500 focus:outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-body text-sm text-red-700">
                {error}
              </div>
            )}

            {!error && loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 animate-pulse rounded-xl border border-line bg-white"
                  />
                ))}
              </div>
            )}

            {!error && !loading && cars.length === 0 && (
              <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
                <p className="font-display text-lg font-semibold text-ink">No cars match yet</p>
                <p className="mt-1 font-body text-sm text-ink/50">
                  Try widening your filters, or check back soon — new listings go up every day.
                </p>
              </div>
            )}

            {!error && !loading && cars.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cars.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
            )}

            {!error && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateFilter("page", pageNum)}
                      className={`h-9 w-9 rounded-md font-mono text-sm font-medium transition ${
                        filters.page === pageNum
                          ? "bg-brand-700 text-white"
                          : "border border-line bg-white text-ink/60 hover:border-brand-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink">How the bridge works</h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-ink/50">
            We don't take bookings, hold payments, or manage keys. We just connect the person
            with a car to the person who needs one.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-line p-5">
              <UploadCloud className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 font-display text-base font-bold text-ink">Owners list</h3>
              <p className="mt-1 font-body text-sm text-ink/50">
                Post your car with photos, specs, a daily rate, and your WhatsApp number.
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <MessagesSquare className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 font-display text-base font-bold text-ink">Renters browse</h3>
              <p className="mt-1 font-body text-sm text-ink/50">
                Filter by city, type, price, and message any owner directly on WhatsApp.
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <Handshake className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 font-display text-base font-bold text-ink">You arrange it</h3>
              <p className="mt-1 font-body text-sm text-ink/50">
                Dates, handover, and payment are worked out between the two of you — we're not
                a party to it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-brand-950">
        <div className="mx-auto max-w-7xl px-4 py-10 font-body text-sm text-brand-200/70 sm:px-6 lg:px-8">
          <p className="font-display text-base font-bold text-white">CarKhana Rent A Car</p>
          <p className="mt-2 max-w-xl">
            CarKhana Rent A Car is a listings platform only. All rentals, payments, and handovers
            happen directly between the car owner and the renter — we're just the bridge.
          </p>
          <p className="mt-6 text-xs text-brand-300/50">
            © {new Date().getFullYear()} CarKhana Rent A Car. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
