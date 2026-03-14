import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { markUnauthenticated } from "@/lib/session/session-slice";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/",
  credentials: "include",
});

const authAwareBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch(markUnauthenticated());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: authAwareBaseQuery,
  endpoints: () => ({}),
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "status" in error) {
    const data = (error as FetchBaseQueryError).data as ApiErrorPayload | string | undefined;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      if (typeof data.error === "string" && data.error.trim().length > 0) {
        return data.error;
      }

      if (typeof data.message === "string" && data.message.trim().length > 0) {
        return data.message;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
