"use client";

import { RotateCcw } from "lucide-react";
import type { CarFilters } from "@/lib/api";

type Props = {
  filters: CarFilters;
  onChange: <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => void;
  onReset: () => void;
};

const CAR_TYPES = ["Sedan", "Hatchback", "SUV", "Van", "Coupe"];
const TRANSMISSIONS = ["Auto", "Manual"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const CONDITIONS = ["New", "Used"];
const DRIVER_OPTIONS: { value: string; label: string }[] = [
  { value: "with-driver", label: "With driver" },
  { value: "without-driver", label: "Self-drive" },
];
const SEATS = ["2", "4", "5", "7", "13"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 font-body text-sm font-medium transition ${
        active
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line bg-white text-ink/70 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 font-display text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onReset }: Props) {
  const toggle = (key: keyof CarFilters, value: string) => {
    onChange(key, (filters[key] === value ? "" : value) as CarFilters[typeof key]);
  };

  return (
    <aside className="w-full shrink-0 rounded-xl border border-line bg-white p-5 sm:w-72">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 font-body text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <Section title="Price per day (PKR)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onChange("priceMin", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full  rounded-md border border-line px-2.5 py-1.5 font-mono text-sm text-ink focus:border-brand-500 focus:outline-none"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange("priceMax", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full rounded-md border border-line px-2.5 py-1.5 font-mono text-sm text-ink focus:border-brand-500 focus:outline-none"
          />
        </div>
      </Section>

      <Section title="Vehicle type">
        <div className="flex flex-wrap gap-2">
          {CAR_TYPES.map((t) => (
            <Chip key={t} active={filters.carType === t} onClick={() => toggle("carType", t)}>
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Transmission">
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((t) => (
            <Chip
              key={t}
              active={filters.transmission === t}
              onClick={() => toggle("transmission", t)}
            >
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Fuel type">
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((t) => (
            <Chip key={t} active={filters.fuelType === t} onClick={() => toggle("fuelType", t)}>
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Condition">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((t) => (
            <Chip key={t} active={filters.condition === t} onClick={() => toggle("condition", t)}>
              {t}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Driver">
        <div className="flex flex-wrap gap-2">
          {DRIVER_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={filters.driverOption === o.value}
              onClick={() => toggle("driverOption", o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Seats">
        <div className="flex flex-wrap gap-2">
          {SEATS.map((s) => (
            <Chip
              key={s}
              active={filters.seatingCapacity === s}
              onClick={() => toggle("seatingCapacity", s)}
            >
              {s}
            </Chip>
          ))}
        </div>
      </Section>
    </aside>
  );
}
