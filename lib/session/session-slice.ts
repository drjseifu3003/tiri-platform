import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { LoginPayload, SessionData } from "@/lib/session/types";

type SessionStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type SessionState = {
  status: SessionStatus;
  data: SessionData | null;
  error: string | null;
};

const initialState: SessionState = {
  status: "idle",
  data: null,
  error: null,
};

type AuthApiError = {
  error?: string;
};

async function readApiError(response: Response) {
  const body = (await response.json().catch(() => null)) as AuthApiError | null;
  return body?.error ?? "Request failed";
}

export const fetchSession = createAsyncThunk<SessionData, void, { rejectValue: string }>(
  "session/fetchSession",
  async (_, { rejectWithValue }) => {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return rejectWithValue(await readApiError(response));
    }

    return (await response.json()) as SessionData;
  }
);

export const login = createAsyncThunk<SessionData, LoginPayload, { rejectValue: string }>(
  "session/login",
  async (payload, { rejectWithValue }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return rejectWithValue(await readApiError(response));
    }

    return (await response.json()) as SessionData;
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "session/logout",
  async (_, { rejectWithValue }) => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return rejectWithValue(await readApiError(response));
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSessionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.data = null;
        state.error = action.payload ?? "Unable to load session";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.data = null;
        state.error = action.payload ?? "Login failed";
      })
      .addCase(logout.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "unauthenticated";
        state.data = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.data = null;
        state.error = action.payload ?? "Logout failed";
      });
  },
});

export const { clearSessionError } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
