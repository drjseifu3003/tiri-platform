import { baseApi } from "@/lib/api/base-api";
import { store } from "@/lib/store";

type InsightsQueryParams = {
  mode: "general" | "anniversary";
  year?: number;
  granularity?: "yearly" | "monthly";
  month?: number;
  page?: number;
  pageSize?: number;
  range?: string;
  milestone?: string;
  search?: string;
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

export const insightsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStudioInsights: build.query<unknown, InsightsQueryParams>({
      query: (params) => {
        const query = toSearchParams({
          mode: params.mode,
          year: params.year,
          granularity: params.granularity,
          month: params.month,
          page: params.page,
          pageSize: params.pageSize,
          range: params.range,
          milestone: params.milestone,
          search: params.search,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        });

        return {
          url: `api/studio/insights?${query}`,
          method: "GET",
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudioInsightsQuery,
  useLazyGetStudioInsightsQuery,
} = insightsApi;

export async function apiGetStudioInsights(params: InsightsQueryParams) {
  return store.dispatch(insightsApi.endpoints.getStudioInsights.initiate(params, { subscribe: false, forceRefetch: true })).unwrap();
}
