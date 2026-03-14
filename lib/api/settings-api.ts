import { baseApi } from "@/lib/api/base-api";
import { store } from "@/lib/store";
import type { AccountSettingsResponse, TeamResponse } from "@/lib/api/types";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountSettings: build.query<AccountSettingsResponse, void>({
      query: () => ({ url: "api/studio/settings/account", method: "GET" }),
    }),
    updateAccountSettings: build.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/settings/account",
        method: "PATCH",
        body,
      }),
    }),
    uploadAccountLogo: build.mutation<{ url: string }, FormData>({
      query: (body) => ({
        url: "api/studio/settings/account/logo",
        method: "POST",
        body,
      }),
    }),
    getTeamSettings: build.query<TeamResponse, void>({
      query: () => ({ url: "api/studio/settings/team", method: "GET" }),
    }),
    createTeamMember: build.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/settings/team",
        method: "POST",
        body,
      }),
    }),
    updateTeamMember: build.mutation<unknown, { userId: string; body: Record<string, unknown> }>({
      query: ({ userId, body }) => ({
        url: `api/studio/settings/team/${userId}`,
        method: "PATCH",
        body,
      }),
    }),
    deleteTeamMember: build.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `api/studio/settings/team/${userId}`,
        method: "DELETE",
      }),
    }),
    getWebsiteSettings: build.query<unknown, void>({
      query: () => ({ url: "api/studio/settings/website", method: "GET" }),
    }),
    updateWebsiteSettings: build.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/settings/website",
        method: "PUT",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAccountSettingsQuery,
  useUpdateAccountSettingsMutation,
  useUploadAccountLogoMutation,
  useGetTeamSettingsQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
} = settingsApi;

export async function apiGetAccountSettings() {
  return store.dispatch(settingsApi.endpoints.getAccountSettings.initiate(undefined, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiUpdateAccountSettings(body: Record<string, unknown>) {
  return store.dispatch(settingsApi.endpoints.updateAccountSettings.initiate(body, { track: false })).unwrap();
}

export async function apiUploadAccountLogo(body: FormData) {
  return store.dispatch(settingsApi.endpoints.uploadAccountLogo.initiate(body, { track: false })).unwrap();
}

export async function apiGetTeamSettings() {
  return store.dispatch(settingsApi.endpoints.getTeamSettings.initiate(undefined, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiCreateTeamMember(body: Record<string, unknown>) {
  return store.dispatch(settingsApi.endpoints.createTeamMember.initiate(body, { track: false })).unwrap();
}

export async function apiUpdateTeamMember(userId: string, body: Record<string, unknown>) {
  return store.dispatch(settingsApi.endpoints.updateTeamMember.initiate({ userId, body }, { track: false })).unwrap();
}

export async function apiDeleteTeamMember(userId: string) {
  return store.dispatch(settingsApi.endpoints.deleteTeamMember.initiate({ userId }, { track: false })).unwrap();
}

export async function apiGetWebsiteSettings() {
  return store.dispatch(settingsApi.endpoints.getWebsiteSettings.initiate(undefined, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiUpdateWebsiteSettings(body: Record<string, unknown>) {
  return store.dispatch(settingsApi.endpoints.updateWebsiteSettings.initiate(body, { track: false })).unwrap();
}
