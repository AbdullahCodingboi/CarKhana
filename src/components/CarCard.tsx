import { useRouter } from "next/navigation";
import { Users, Gauge, Fuel, Cog, MapPin, MessageCircle } from "lucide-react";
import { whatsappLink } from "../lib/api";

const STATUS_STYLES = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  booked: "bg-amber-50 text-amber-700 border-amber-200",
  unavailable: "bg-ink/5 text-ink/50 border-line",
};

export default function CarCard({ car }) {
  const router = useRouter();
  const cover = car.images?.[0]?.imageUrl;

  const handleCardClick = (event) => {
    if (event.target?.closest("a")) {
      return;
    }
    router.push(`/cars/${car._id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(`/cars/${car._id}`);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-mist">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${car.year} ${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-ink/30">
            No photo yet
          </div>
        )}

        {car.images?.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {car.images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}

        <span
          className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold capitalize ${STATUS_STYLES[car.availabilityStatus]}`}
        >
          {car.availabilityStatus}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold leading-tight text-ink">
              {car.brand} {car.model}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 font-body text-xs text-ink/50">
              <MapPin className="h-3 w-3" /> {car.city} · {car.year}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-brand-50 px-2 py-1 font-mono text-[11px] font-semibold text-brand-700">
            {car.driverOption === "with-driver" ? "With driver" : "Self-drive"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 border-y border-line py-3 font-body text-xs text-ink/70">
          <span className="flex flex-col items-center gap-1">
            <Users className="h-4 w-4 text-brand-600" /> {car.seatingCapacity}
          </span>
          <span className="flex flex-col items-center gap-1">
            <Cog className="h-4 w-4 text-brand-600" /> {car.transmission}
          </span>
          <span className="flex flex-col items-center gap-1">
            <Fuel className="h-4 w-4 text-brand-600" /> {car.fuelType}
          </span>
          <span className="flex flex-col items-center gap-1">
            <Gauge className="h-4 w-4 text-brand-600" /> {car.mileage.toLocaleString()}km
          </span>
        </div>

        <p className="mt-3 line-clamp-2 font-body text-xs text-ink/50">{car.description}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-lg font-semibold text-ink">
              ${car.rentalPricePerDay}
              <span className="font-body text-xs font-normal text-ink/40"> /day</span>
            </p>
            <p className="font-body text-[11px] text-ink/40">Posted by @{car.owner?.username}</p>
          </div>
        </div>

        {/* signature: the dashed bridge running from listing to the WhatsApp CTA */}
        <div className="mt-3 h-px bg-bridge-dashes" />

        <a
          href={whatsappLink(car)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          <MessageCircle className="h-4 w-4" />
          Message owner on WhatsApp
        </a>
      </div>
    </article>
  );
}