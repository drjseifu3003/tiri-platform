import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/lib/api/base-api";
import { sessionReducer } from "@/lib/session/session-slice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
