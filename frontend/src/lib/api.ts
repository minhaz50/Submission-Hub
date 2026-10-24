const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  errors?: Record<string, string[]>;
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.errors = errors;
  }
}

// Small fetch wrapper: adds the JWT, parses JSON, throws ApiError on failure
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL + path, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!res) throw new ApiError("Cannot reach the server");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message ?? "Request failed", data.errors);
  return data as T;
}
