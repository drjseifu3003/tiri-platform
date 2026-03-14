import { baseApi } from "@/lib/api/base-api";

type BookingActionInput = {
  bookingId: string;
  action: "accept" | "cancel";
};

type StudioEventParams = {
  page?: number;
  pageSize?: number;
  filter?: string;
  search?: string;
  dateFilter?: string;
  dateFrom?: string;
  dateTo?: string;
};

function toSearchParams(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const normalized = String(value).trim();
    if (normalized.length === 0) continue;
    params.set(key, normalized);
  }

  return params.toString();
}

export const studioApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStudioEvents: build.query<unknown, StudioEventParams>({
      query: (params) => {
        const queryString = toSearchParams({
          page: params.page,
          pageSize: params.pageSize,
          filter: params.filter,
          search: params.search,
          dateFilter: params.dateFilter,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        });

        return {
          url: queryString.length > 0 ? `api/studio/events?${queryString}` : "api/studio/events",
          method: "GET",
        };
      },
    }),
    createStudioEvent: build.mutation<unknown, unknown>({
      query: (payload) => ({
        url: "api/studio/events",
        method: "POST",
        body: payload,
      }),
    }),
    getStudioBookings: build.query<unknown, { page: number; pageSize: number; filter: string; search?: string }>({
      query: (params) => {
        const queryString = toSearchParams({
          page: params.page,
          pageSize: params.pageSize,
          filter: params.filter,
          search: params.search,
        });

        return {
          url: `api/studio/bookings?${queryString}`,
          method: "GET",
        };
      },
    }),
    studioBookingAction: build.mutation<unknown, BookingActionInput>({
      query: ({ bookingId, action }) => ({
        url: `api/studio/bookings/${bookingId}`,
        method: "POST",
        body: { action },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetStudioEventsQuery,
  useCreateStudioEventMutation,
  useLazyGetStudioBookingsQuery,
  useStudioBookingActionMutation,
} = studioApi;
