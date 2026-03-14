import { baseApi } from "@/lib/api/base-api";
import { store } from "@/lib/store";
import type { InvitePayload, TelegramInviteResponse, WhatsAppBatchInviteResponse } from "@/lib/api/types";

export const invitationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createWhatsappLink: build.mutation<{ whatsappLink: string; guestName: string }, { eventId: string; guestId: string }>({
      query: (body) => ({
        url: "api/invitations/whatsapp-link",
        method: "POST",
        body,
      }),
    }),
    createWhatsappBatch: build.mutation<WhatsAppBatchInviteResponse, { eventId: string; guestIds: string[] }>({
      query: (body) => ({
        url: "api/invitations/whatsapp-batch",
        method: "POST",
        body,
      }),
    }),
    sendTelegramBatch: build.mutation<TelegramInviteResponse, { eventId: string; guestIds: string[] }>({
      query: (body) => ({
        url: "api/invitations/telegram/send",
        method: "POST",
        body,
      }),
    }),
    getRsvpByToken: build.query<InvitePayload, { token: string }>({
      query: ({ token }) => ({
        url: `api/invitations/rsvp/${encodeURIComponent(token)}`,
        method: "GET",
      }),
    }),
    submitRsvpByToken: build.mutation<unknown, { token: string; status: "ATTENDING" | "NOT_ATTENDING"; plusOne: number }>({
      query: ({ token, ...body }) => ({
        url: `api/invitations/rsvp/${encodeURIComponent(token)}`,
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateWhatsappLinkMutation,
  useCreateWhatsappBatchMutation,
  useSendTelegramBatchMutation,
  useGetRsvpByTokenQuery,
  useLazyGetRsvpByTokenQuery,
  useSubmitRsvpByTokenMutation,
} = invitationsApi;

export async function apiCreateWhatsappLink(eventId: string, guestId: string) {
  return store.dispatch(invitationsApi.endpoints.createWhatsappLink.initiate({ eventId, guestId }, { track: false })).unwrap();
}

export async function apiCreateWhatsappBatch(eventId: string, guestIds: string[]) {
  return store.dispatch(invitationsApi.endpoints.createWhatsappBatch.initiate({ eventId, guestIds }, { track: false })).unwrap();
}

export async function apiSendTelegramBatch(eventId: string, guestIds: string[]) {
  return store.dispatch(invitationsApi.endpoints.sendTelegramBatch.initiate({ eventId, guestIds }, { track: false })).unwrap();
}

export async function apiGetRsvpByToken(token: string) {
  return store.dispatch(invitationsApi.endpoints.getRsvpByToken.initiate({ token }, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiSubmitRsvpByToken(token: string, status: "ATTENDING" | "NOT_ATTENDING", plusOne: number) {
  return store.dispatch(invitationsApi.endpoints.submitRsvpByToken.initiate({ token, status, plusOne }, { track: false })).unwrap();
}
