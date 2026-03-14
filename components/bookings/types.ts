export type BookingStatus = "NEW" | "HANDLED" | "CANCELLED";
export type BookingFilter = "all" | "new" | "handled" | "cancelled";

export type BookingRequestItem = {
  id: string;
  name: string;
  phone: string;
  weddingDate: string;
  weddingPlace: string;
  status: BookingStatus;
  handledEventId: string | null;
  handledEvent: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
};

export type BookingStats = {
  total: number;
  new: number;
  handled: number;
  cancelled: number;
};

export type BookingResponse = {
  bookings: BookingRequestItem[];
  stats: BookingStats;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

export type ActionResponse = {
  error?: string;
  event?: {
    id: string;
    title: string;
  };
};

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatWeddingDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function statusLabel(status: BookingStatus) {
  if (status === "HANDLED") return "Handled";
  if (status === "CANCELLED") return "Cancelled";
  return "New";
}

export function statusClasses(status: BookingStatus) {
  if (status === "HANDLED") return "border-sky-300 bg-sky-50 text-sky-800";
  if (status === "CANCELLED") return "border-red-300 bg-red-50 text-red-700";
  return "border-amber-300 bg-amber-50 text-amber-800";
}
