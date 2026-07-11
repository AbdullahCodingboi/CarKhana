"use client";

import { Search, MapPin } from "lucide-react";

type Props = {
  search: string;
  city: string;
  aiMode: boolean;
  onSearchChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSubmit: () => void;
  onAiModeToggle: () => void;
  aiSearching: boolean;
  totalCount: number;
};

export default function HeroSearch({
  search,
  city,
  aiMode,
  onSearchChange,
  onCityChange,
  onSubmit,
  onAiModeToggle,
  aiSearching,
  totalCount,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-brand-950">
      {/* signature: a dashed "bridge" line running the width of the hero, owner-icon to renter-icon */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-bridge-dashes opacity-30 md:block" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
          Rent a car straight from its owner.
        </h1>
        <p className="mt-4 max-w-xl font-body text-base text-brand-100/80 sm:text-lg">
          CarKhana Rent A Car is a listing board, not a rental company. Browse cars posted by
          real owners, then message them on WhatsApp to work out the details yourselves.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className={`mt-8 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-card transition sm:flex-row sm:items-center ${
            aiMode
              ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-brand-950"
              : ""
          }`}
        >
          <div className="flex flex-1 items-center gap-2 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-ink/40" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search brand, model, or type — e.g. Corolla, SUV"
              className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </div>
          <div className="hidden h-6 w-px bg-line sm:block" />
          <div className="flex items-center gap-2 px-3 py-2 sm:w-48">
            <MapPin className="h-4 w-4 shrink-0 text-ink/40" />
            <input
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="City"
              className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-6 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onAiModeToggle}
              className={`rounded-lg px-6 py-2.5 font-body text-sm font-semibold transition ${
                aiMode
                  ? "bg-violet-600 text-white border border-violet-700 hover:bg-violet-500"
                  : "border border-line bg-surface text-ink hover:bg-slate-100"
              }`}
            >
              {aiMode ? "AI mode: ON" : "AI mode: OFF"}
            </button>
          </div>
        </form>
        <p className="mt-3 text-sm font-body text-violet-200">
          {aiMode
            ? "AI mode is enabled — typed input is automatically sent to the intelligent search parser."
            : "Normal search is enabled — filtering is based on exact search text and selected options."}
        </p>

        <p className="mt-4 font-mono text-xs text-brand-200/70">
          {totalCount > 0 ? `${totalCount} car${totalCount === 1 ? "" : "s"} listed right now` : " "}
        </p>
      </div>
    </section>
  );
}