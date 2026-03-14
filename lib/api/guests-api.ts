import { baseApi } from "@/lib/api/base-api";
import type { InvitationGuestsResponse } from "@/lib/api/types";
import { store } from "@/lib/store";

export const guestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStudioGuests: build.query<unknown, { scope?: string }>({
      query: ({ scope }) => ({
        url: scope ? `api/studio/guests?scope=${encodeURIComponent(scope)}` : "api/studio/guests",
        method: "GET",
      }),
    }),
    createStudioGuest: build.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/guests",
        method: "POST",
        body,
      }),
    }),
    updateStudioGuest: build.mutation<unknown, { guestId: string; body: Record<string, unknown> }>({
      query: ({ guestId, body }) => ({
        url: `api/studio/guests/${guestId}`,
        method: "PATCH",
        body,
      }),
    }),
    deleteStudioGuest: build.mutation<unknown, { guestId: string }>({
      query: ({ guestId }) => ({
        url: `api/studio/guests/${guestId}`,
        method: "DELETE",
      }),
    }),
    createStudioGuestsBulk: build.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/guests/bulk",
        method: "POST",
        body,
      }),
    }),
    getInvitationGuests: build.query<InvitationGuestsResponse, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `api/invitations/guests?eventId=${encodeURIComponent(eventId)}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudioGuestsQuery,
  useLazyGetStudioGuestsQuery,
  useCreateStudioGuestMutation,
  useUpdateStudioGuestMutation,
  useDeleteStudioGuestMutation,
  useCreateStudioGuestsBulkMutation,
  useGetInvitationGuestsQuery,
  useLazyGetInvitationGuestsQuery,
} = guestsApi;

export async function apiGetStudioGuests(scope = "studio") {
  return store.dispatch(guestsApi.endpoints.getStudioGuests.initiate({ scope }, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiCreateStudioGuest(body: Record<string, unknown>) {
  return store.dispatch(guestsApi.endpoints.createStudioGuest.initiate(body, { track: false })).unwrap();
}

export async function apiUpdateStudioGuest(guestId: string, body: Record<string, unknown>) {
  return store.dispatch(guestsApi.endpoints.updateStudioGuest.initiate({ guestId, body }, { track: false })).unwrap();
}

export async function apiDeleteStudioGuest(guestId: string) {
  return store.dispatch(guestsApi.endpoints.deleteStudioGuest.initiate({ guestId }, { track: false })).unwrap();
}

export async function apiCreateStudioGuestsBulk(body: Record<string, unknown>) {
  return store.dispatch(guestsApi.endpoints.createStudioGuestsBulk.initiate(body, { track: false })).unwrap();
}

export async function apiGetInvitationGuests(eventId: string) {
  return store.dispatch(guestsApi.endpoints.getInvitationGuests.initiate({ eventId }, { subscribe: false, forceRefetch: true })).unwrap();
}
