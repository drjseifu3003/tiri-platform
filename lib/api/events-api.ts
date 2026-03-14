import { baseApi } from "@/lib/api/base-api";
import { store } from "@/lib/store";
import type { StudioEventsResponse } from "@/lib/api/types";

type StudioEventQueryParams = {
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

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStudioEvents: build.query<StudioEventsResponse, StudioEventQueryParams>({
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
    getStudioEventDetail: build.query<unknown, string>({
      query: (eventId) => ({
        url: `api/studio/events/${eventId}`,
        method: "GET",
      }),
    }),
    createStudioEvent: build.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/events",
        method: "POST",
        body,
      }),
    }),
    updateStudioEvent: build.mutation<unknown, { eventId: string; body: Record<string, unknown> }>({
      query: ({ eventId, body }) => ({
        url: `api/studio/events/${eventId}`,
        method: "PATCH",
        body,
      }),
    }),
    uploadInvitationCard: build.mutation<unknown, { eventId: string; body: FormData }>({
      query: ({ eventId, body }) => ({
        url: `api/studio/events/${eventId}/invitation-card`,
        method: "POST",
        body,
      }),
    }),
    deleteInvitationCard: build.mutation<unknown, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `api/studio/events/${eventId}/invitation-card`,
        method: "DELETE",
      }),
    }),
    uploadEventAvatar: build.mutation<unknown, { eventId: string; body: FormData }>({
      query: ({ eventId, body }) => ({
        url: `api/studio/events/${eventId}/avatar`,
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudioEventsQuery,
  useLazyGetStudioEventsQuery,
  useGetStudioEventDetailQuery,
  useLazyGetStudioEventDetailQuery,
  useCreateStudioEventMutation,
  useUpdateStudioEventMutation,
  useUploadInvitationCardMutation,
  useDeleteInvitationCardMutation,
  useUploadEventAvatarMutation,
} = eventsApi;

export async function apiGetStudioEvents(params: StudioEventQueryParams) {
  return store.dispatch(eventsApi.endpoints.getStudioEvents.initiate(params, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiGetStudioEventDetail(eventId: string) {
  return store.dispatch(eventsApi.endpoints.getStudioEventDetail.initiate(eventId, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiCreateStudioEvent(body: Record<string, unknown>) {
  return store.dispatch(eventsApi.endpoints.createStudioEvent.initiate(body, { track: false })).unwrap();
}

export async function apiUpdateStudioEvent(eventId: string, body: Record<string, unknown>) {
  return store.dispatch(eventsApi.endpoints.updateStudioEvent.initiate({ eventId, body }, { track: false })).unwrap();
}

export async function apiUploadInvitationCard(eventId: string, body: FormData) {
  return store.dispatch(eventsApi.endpoints.uploadInvitationCard.initiate({ eventId, body }, { track: false })).unwrap();
}

export async function apiDeleteInvitationCard(eventId: string) {
  return store.dispatch(eventsApi.endpoints.deleteInvitationCard.initiate({ eventId }, { track: false })).unwrap();
}

export async function apiUploadEventAvatar(eventId: string, body: FormData) {
  return store.dispatch(eventsApi.endpoints.uploadEventAvatar.initiate({ eventId, body }, { track: false })).unwrap();
}
