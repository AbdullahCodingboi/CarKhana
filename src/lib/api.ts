// Matches cms-backend: GET /api/cars, models Car / User / Image

export const API_BASE ="https://zeeshan-rent-a-car.vercel.app";

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
export async function signupUser(payload) {
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

export async function loginUser(payload) {
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