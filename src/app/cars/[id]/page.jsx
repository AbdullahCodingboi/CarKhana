"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Gauge,
  Fuel,
  Cog,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
} from "lucide-react";
import { fetchCarById, whatsappLink } from "@/lib/api";

const STATUS_STYLES = {
  available: "bg-emerald-50 text-emerald-700",
  booked: "bg-amber-50 text-amber-700",
  unavailable: "bg-ink/5 text-ink/40",
};

function Gallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const hasImages = images && images.length > 0;

  const go = (dir) => {
    if (!hasImages) return;
    setIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-surface sm:aspect-[16/10]">
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[index].imageUrl}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-ink/25">
            No photos yet
          </div>
        )}

        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl transition ${
                i === index ? "ring-2 ring-brand-500" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-surface p-3.5">
      <Icon className="h-4 w-4 text-brand-600" />
      <p className="mt-2 font-body text-[11px] font-medium uppercase tracking-wide text-ink/35">
        {label}
      </p>
      <p className="mt-0.5 font-display text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchCarById(id)
      .then((res) => {
        if (active) setCar(res.car);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load listing.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-6 w-32 rounded-full bg-line" />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="aspect-[16/10] w-full rounded-3xl bg-line" />
            </div>
            <div className="h-64 rounded-2xl bg-line" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !car) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-card">
          <p className="font-display text-lg font-bold text-ink">
            {error === "Listing not found" ? "This listing isn't available" : "Something went wrong"}
          </p>
          <p className="mt-1.5 font-body text-sm text-muted">
            {error || "Please try again in a moment."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to browsing
          </Link>
        </div>
      </main>
    );
  }

  const postedDate = car.datePosted || car.createdAt;

  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-muted transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browsing
        </Link>

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left — gallery + details */}
          <div className="lg:col-span-2">
            <Gallery images={car.images} alt={`${car.year} ${car.brand} ${car.model}`} />

            <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  {car.brand} {car.model}
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {car.city}
                  </span>
                  {postedDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Posted {new Date(postedDate).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </p>
              </div>
              <p className="font-mono text-2xl font-bold text-brand-700">
                ${car.rentalPricePerDay}
                <span className="font-body text-sm font-normal text-muted"> /day</span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 font-body text-xs font-semibold capitalize ${STATUS_STYLES[car.availabilityStatus]}`}
              >
                {car.availabilityStatus}
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 font-body text-xs font-semibold text-brand-700">
                {car.driverOption === "with-driver" ? "With driver" : "Self-drive"}
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 font-body text-xs font-semibold text-brand-700">
                {car.condition}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec icon={Calendar} label="Year" value={car.year} />
              <Spec icon={Cog} label="Transmission" value={car.transmission} />
              <Spec icon={Fuel} label="Fuel" value={car.fuelType} />
              <Spec icon={Users} label="Seats" value={car.seatingCapacity} />
              <Spec icon={Gauge} label="Mileage" value={`${car.mileage.toLocaleString()} km`} />
              <Spec icon={Sparkles} label="Type" value={car.carType} />
              {car.maxTravelDistance && (
                <Spec icon={MapPin} label="Max distance" value={car.maxTravelDistance} />
              )}
            </div>

            {car.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {car.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-3 py-1 font-body text-xs font-medium text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-ink">Description</h2>
              <p className="mt-2 whitespace-pre-line font-body text-sm leading-relaxed text-muted">
                {car.description}
              </p>
            </div>

            {car.details && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-bold text-ink">Additional details</h2>
                <p className="mt-2 whitespace-pre-line font-body text-sm leading-relaxed text-muted">
                  {car.details}
                </p>
              </div>
            )}
          </div>

          {/* Right — owner + contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display text-base font-bold text-white">
                  {car.owner?.name?.[0]?.toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-ink">
                    {car.owner?.name || "Owner"}
                  </p>
                  {car.owner?.city && (
                    <p className="flex items-center gap-1 font-body text-xs text-muted">
                      <MapPin className="h-3 w-3" /> {car.owner.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {car.owner?.phone && (
                  <button
                    onClick={() => setShowPhone(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line py-2.5 font-body text-sm font-semibold text-ink transition hover:border-brand-300"
                  >
                    <Phone className="h-4 w-4 text-brand-600" />
                    {showPhone ? (
                      <a href={`tel:${car.owner.phone}`} className="text-brand-700">
                        {car.owner.phone}
                      </a>
                    ) : (
                      "Show phone number"
                    )}
                  </button>
                )}

                <a
                  href={whatsappLink(car)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 py-2.5 font-body text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message on WhatsApp
                </a>

                {car.owner?.email && (
                  <a
                    href={`mailto:${car.owner.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line py-2.5 font-body text-sm font-semibold text-ink transition hover:border-brand-300"
                  >
                    <Mail className="h-4 w-4 text-brand-600" />
                    Email owner
                  </a>
                )}
              </div>

              <p className="mt-4 border-t border-line pt-4 font-body text-[11px] leading-relaxed text-ink/35">
                CarKhana Rent A Car doesn't process payments or bookings. Arrange dates,
                handover, and payment directly with the owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}