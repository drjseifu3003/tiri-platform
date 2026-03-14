import { baseApi } from "@/lib/api/base-api";
import { store } from "@/lib/store";
import type { StudioMediaResponse } from "@/lib/api/types";

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStudioMedia: build.query<StudioMediaResponse, { scope?: string }>({
      query: ({ scope }) => ({
        url: scope ? `api/studio/media?scope=${encodeURIComponent(scope)}` : "api/studio/media",
        method: "GET",
      }),
    }),
    createStudioMedia: build.mutation<unknown, FormData | Record<string, unknown>>({
      query: (body) => ({
        url: "api/studio/media",
        method: "POST",
        body,
      }),
    }),
    deleteStudioMedia: build.mutation<unknown, { mediaId: string }>({
      query: ({ mediaId }) => ({
        url: `api/studio/media/${mediaId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudioMediaQuery,
  useLazyGetStudioMediaQuery,
  useCreateStudioMediaMutation,
  useDeleteStudioMediaMutation,
} = mediaApi;

export async function apiGetStudioMedia(scope = "studio") {
  return store.dispatch(mediaApi.endpoints.getStudioMedia.initiate({ scope }, { subscribe: false, forceRefetch: true })).unwrap();
}

export async function apiCreateStudioMedia(body: FormData | Record<string, unknown>) {
  return store.dispatch(mediaApi.endpoints.createStudioMedia.initiate(body, { track: false })).unwrap();
}

export async function apiDeleteStudioMedia(mediaId: string) {
  return store.dispatch(mediaApi.endpoints.deleteStudioMedia.initiate({ mediaId }, { track: false })).unwrap();
}
