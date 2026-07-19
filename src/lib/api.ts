// Matches cms-backend: GET /api/cars, models Car / User / Image

export const API_BASE = "https://zeeshan-rent-a-car.vercel.app";

export type CarImage = {
  imageUrl: string;
  publicId: string;
};

export type CarOwner = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
};

export type Car = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  carType: string;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  mileage: number;
  rentalPricePerDay: number;
  city: string;
  maxTravelDistance?: string;
  availabilityStatus: "available" | "booked" | "unavailable";
  description: string;
  tags: string[];
  details?: string;
  driverOption: "with-driver" | "without-driver";
  whatsappContact: string;
  owner: CarOwner;
  images: CarImage[];
  datePosted?: string;
  createdAt?: string;
  isVerified?: boolean;
};

export type CarsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  cars: Car[];
};

export type CarFilters = {
  search?: string;
  brand?: string;
  model?: string;
  carType?: string;
  city?: string;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  driverOption?: string;
  seatingCapacity?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: "newest" | "oldest" | "lowestPrice" | "highestPrice" | "mileage" | "year";
  page?: number;
  limit?: number;
};

export type AdminUser = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
};

function getJsonResponse(response: Response) {
  return response.json().catch(() => ({}));
}

function createApiError(response: Response, data: any) {
  const error = new Error(data?.message || `Request failed (${response.status})`);
  (error as any).status = response.status;
  return error;
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("zrac_token");
    window.localStorage.removeItem("zrac_user");
  }
}

export function isAuthError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const status = (error as any).status;
  if (status === 401 || status === 403) {
    return true;
  }

  const message = String((error as any).message || "").toLowerCase();
  return message.includes("unauthorized") || message.includes("token") || message.includes("expired");
}

export async function fetchCars(filters: CarFilters): Promise<CarsResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE}/api/cars?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw createApiError(res, await getJsonResponse(res));
  }

  return res.json();
}

/** Builds a wa.me deep link with a prefilled message, using the listing's own contact number. */
export function whatsappLink(car: Car): string {
  const digits = car.whatsappContact.replace(/[^\d]/g, "");
  const message = `Hi ${car.owner?.name || ""}, I saw your ${car.year} ${car.brand} ${car.model} on CarKhana Rent A Car and I'm interested.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export async function signupUser(payload: any) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await getJsonResponse(res);
  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

export async function loginUser(payload: any) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await getJsonResponse(res);
  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

export async function fetchCarById(id: string) {
  const res = await fetch(`${API_BASE}/api/cars/${id}`, { cache: "no-store" });
  const data = await getJsonResponse(res);

  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

export type CreateCarPayload = {
  brand: string;
  model: string;
  year: number;
  condition: string;
  carType: string;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  mileage: number;
  rentalPricePerDay: number;
  city: string;
  availabilityStatus: "available" | "booked" | "unavailable";
  description: string;
  whatsappContact: string;
};

export async function fetchMyCars(token: string) {
  const res = await fetch(`${API_BASE}/api/cars/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await getJsonResponse(res);
  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

export async function createCar(payload: CreateCarPayload | FormData, token?: string) {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/cars`, {
    method: "POST",
    headers: payload instanceof FormData ? headers : { ...headers, "Content-Type": "application/json" },
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });

  const data = await getJsonResponse(res);

  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

export async function deleteCar(carId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/cars/${carId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await getJsonResponse(res);

  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

/** Update car by id. Accepts partial car fields. Uses PUT per backend spec. */
export async function updateCar(carId: string, payload: Partial<Car> | FormData, token?: string) {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/cars/${carId}`, {
    method: "PUT",
    headers: payload instanceof FormData ? headers : { ...headers, "Content-Type": "application/json" },
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });

  const data = await getJsonResponse(res);
  if (!res.ok) {
    throw createApiError(res, data);
  }

  return data;
}

/** Toggle a car's availability. Pass "unavailable" to unlist, "available" to relist. */
export async function unlistCar(carId: string, token: string, targetStatus: "available" | "unavailable" = "unavailable") {
  return updateCar(carId, { availabilityStatus: targetStatus }, token);
}

// ─── Admin API ───────────────────────────────────────────────────────────────

/** GET /api/admin/cars — all cars regardless of verification. */
export async function fetchAdminCars(
  token: string,
  params: { verified?: boolean; page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.verified !== undefined) qs.set("verified", String(params.verified));
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE}/api/admin/cars?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}

/** GET /api/admin/cars/pending — unverified cars pending approval. */
export async function fetchPendingCars(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/cars/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}

/** PATCH /api/admin/cars/:id/approve */
export async function approveCar(carId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/cars/${carId}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}

/** PATCH /api/admin/cars/:id/reject */
export async function rejectCar(carId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/cars/${carId}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}

/** DELETE /api/admin/cars/:id — hard-delete from admin panel. */
export async function adminDeleteCar(carId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/cars/${carId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}

/** GET /api/admin/users */
export async function fetchAdminUsers(
  token: string,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE}/api/admin/users?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}

/** DELETE /api/admin/users/:id */
export async function adminDeleteUser(userId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await getJsonResponse(res);
  if (!res.ok) throw createApiError(res, data);
  return data;
}