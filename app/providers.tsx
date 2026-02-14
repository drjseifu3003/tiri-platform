"use client";

import { SessionProvider } from "@/lib/session-context";
import { store } from "@/lib/store";
import { Provider } from "react-redux";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>{children}</SessionProvider>
    </Provider>
  );
}
