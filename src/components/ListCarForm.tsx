"use client";

import { useState } from "react";
import { Upload, X, Camera, Check, ChevronDown } from "lucide-react";
import { createCar, type CreateCarPayload, API_BASE } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-body text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";

const selectClass = inputClass + " appearance-none pr-9";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={selectClass}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

type FormState = Omit<CreateCarPayload, "year" | "seatingCapacity" | "mileage" | "rentalPricePerDay"> & {
  year: string;
  seatingCapacity: string;
  mileage: string;
  rentalPricePerDay: string;
};

const initialForm: FormState = {
  brand: "",
  model: "",
  year: "",
  condition: "Used",
  carType: "Sedan",
  transmission: "Automatic",
  fuelType: "Petrol",
  seatingCapacity: "",
  mileage: "",
  rentalPricePerDay: "",
  city: "",
  availabilityStatus: "available",
  description: "",
  whatsappContact: "",
};

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 font-body text-xs font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-body text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4 " + (className ?? "")}>
      <span className="shrink-0 font-body text-sm font-medium text-slate-900 sm:w-32">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function ListCarForm({ onSuccess, token }: { onSuccess?: () => void; token: string }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const newFiles = files.slice(0, 3 - images.length);
    if (newFiles.length === 0) return;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Add at least one photo of the car before publishing.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const yearValue = Number(form.year);
    const seatingValue = Number(form.seatingCapacity);
    const mileageValue = Number(form.mileage);
    const priceValue = Number(form.rentalPricePerDay);

    if (
      !form.brand ||
      !form.model ||
      !form.city ||
      !form.whatsappContact ||
      !form.year ||
      !form.seatingCapacity ||
      !form.mileage ||
      !form.rentalPricePerDay ||
      Number.isNaN(yearValue) ||
      Number.isNaN(seatingValue) ||
      Number.isNaN(mileageValue) ||
      Number.isNaN(priceValue) ||
      yearValue <= 0 ||
      seatingValue <= 0 ||
      mileageValue < 0 ||
      priceValue <= 0
    ) {
      setError("Please complete the required fields before submitting.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(null);
    try {
      const payload: CreateCarPayload = {
        brand: form.brand,
        model: form.model,
        year: yearValue,
        condition: form.condition,
        carType: form.carType,
        transmission: form.transmission,
        fuelType: form.fuelType,
        seatingCapacity: seatingValue,
        mileage: mileageValue,
        rentalPricePerDay: priceValue,
        city: form.city,
        availabilityStatus: form.availabilityStatus,
        description: form.description,
        whatsappContact: form.whatsappContact,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      images.forEach((file) => {
        formData.append("images", file);
      });

      // If there are images, use XHR to track upload progress.
      if (images.length > 0) {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${API_BASE}/api/cars`);
          if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              let msg = `Upload failed (${xhr.status})`;
              try {
                const data = JSON.parse(xhr.responseText || "{}");
                if (data?.message) msg = data.message;
              } catch {}
              reject(new Error(msg));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        });
      } else {
        await createCar(formData, token);
      }

      setForm(initialForm);
      setImages([]);
      setImagePreviews([]);
      setUploadProgress(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setUploadProgress(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:gap-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Photos */}
      <Section step={1} title="Photos" subtitle="Add up to 3 clear photos — listings with photos rent out faster.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imagePreviews.map((preview, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`Car photo ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove photo"
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {images.length < 3 && (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={
                "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-center transition " +
                (dragActive
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50")
              }
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {images.length === 0 ? (
                <Camera className="h-6 w-6 text-slate-400" />
              ) : (
                <Upload className="h-5 w-5 text-slate-400" />
              )}
              <p className="px-2 text-xs font-medium text-slate-500">
                {images.length === 0 ? "Add photos" : "Add more"}
              </p>
            </label>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {images.length}/3 photos added · JPG or PNG · at least 1 required
        </p>
      </Section>

      {/* Vehicle details */}
      <Section step={2} title="Vehicle details" subtitle="Tell renters what they'll be driving.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Brand" required>
            <input
              value={form.brand}
              onChange={(event) => update("brand", event.target.value)}
              placeholder="Toyota"
              className={inputClass}
            />
          </Field>
          <Field label="Model" required>
            <input
              value={form.model}
              onChange={(event) => update("model", event.target.value)}
              placeholder="Corolla"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Year" required>
            <input
              type="number"
              min={1990}
              max={new Date().getFullYear()}
              value={form.year}
              onChange={(event) => update("year", event.target.value)}
              placeholder="2024"
              className={inputClass}
            />
          </Field>
          <Field label="Condition" required>
            <Select value={form.condition} onChange={(event) => update("condition", event.target.value)}>
              <option>Used</option>
              <option>New</option>
            </Select>
          </Field>
          <Field label="Seats" required>
            <input
              type="number"
              min={1}
              value={form.seatingCapacity}
              onChange={(event) => update("seatingCapacity", event.target.value)}
              placeholder="4"
              className={inputClass}
            />
          </Field>
          <Field label="Transmission" required>
            <Select value={form.transmission} onChange={(event) => update("transmission", event.target.value)}>
              <option>Automatic</option>
              <option>Manual</option>
            </Select>
          </Field>
          <Field label="Fuel type" required>
            <Select value={form.fuelType} onChange={(event) => update("fuelType", event.target.value)}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </Select>
          </Field>
          <Field label="Mileage (km)" required>
            <input
              type="number"
              min={0}
              value={form.mileage}
              onChange={(event) => update("mileage", event.target.value)}
              placeholder="100000"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Pricing & availability */}
      <Section step={3} title="Pricing & location" subtitle="Set your daily rate and where the car is based.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Price / day" required>
            <input
              type="number"
              min={0}
              value={form.rentalPricePerDay}
              onChange={(event) => update("rentalPricePerDay", event.target.value)}
              placeholder="2000 (PKR)"
              className={inputClass}
            />
          </Field>
          <Field label="City" required>
            <input
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
              placeholder="Karachi"
              className={inputClass}
            />
          </Field>
          <Field label="Availability" required>
            <Select
              value={form.availabilityStatus}
              onChange={(event) =>
                update("availabilityStatus", event.target.value as CreateCarPayload["availabilityStatus"])
              }
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </Field>
          <Field label="WhatsApp" required>
            <input
              value={form.whatsappContact}
              onChange={(event) => update("whatsappContact", event.target.value)}
              placeholder="+92 3xx xxxxxxx"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Description */}
      <Section step={4} title="Description" subtitle="Add a quick note about features, pickup, or rental terms.">
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
          placeholder="e.g. Well maintained, AC works great, free delivery within city limits."
          className={inputClass}
        />
      </Section>

      {uploadProgress !== null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-body text-slate-500">
            <span>Uploading photos…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-brand-600 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-self-start"
      >
        {submitting ? (
          "Publishing…"
        ) : (
          <>
            <Check className="h-4 w-4" />
            Publish listing
          </>
        )}
      </button>
    </form>
  );
}