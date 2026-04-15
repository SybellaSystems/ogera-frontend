import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { apiSlice } from "../services/api/apiSlice";
import { extendedProfileApi } from "../services/api/extendedProfileApi";

// Load state from localStorage (WITHOUT access token for security)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState);

    // Return state but keep accessToken as null (will be fetched via refresh)
    return {
      auth: {
        ...parsedState,
        accessToken: null, // Never store token in localStorage (XSS protection)
      },
    };
  } catch (err) {
    console.error("Could not load state", err);
    return undefined;
  }
};

// Resolve the cookie Domain attribute so that cookies set by the dashboard
// (app.ogera.sybellasystems.co.rw) are readable by the landing page
// (ogera.sybellasystems.co.rw). Without this, cookies are scoped to the exact
// host and the landing page can't see the logged-in state.
//
// - localhost: no Domain (browsers share localhost cookies across ports)
// - *.ogera.sybellasystems.co.rw: use ".ogera.sybellasystems.co.rw"
// - anything else (Vercel previews, IPs): host-scoped fallback
const resolveCookieDomain = (): string => {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "";
  if (
    host === "ogera.sybellasystems.co.rw" ||
    host.endsWith(".ogera.sybellasystems.co.rw")
  ) {
    return ".ogera.sybellasystems.co.rw";
  }
  return "";
};

const SHARED_COOKIE_NAMES = [
  "ogera_logged_in",
  "ogera_user_name",
  "ogera_user_image",
] as const;

const setSharedCookie = (name: string, value: string, maxAgeSeconds: number) => {
  const domain = resolveCookieDomain();
  const parts = [
    `${name}=${value}`,
    "path=/",
    "SameSite=Lax",
    `max-age=${maxAgeSeconds}`,
  ];
  if (domain) parts.push(`Domain=${domain}`);
  document.cookie = parts.join("; ");
};

const clearSharedCookie = (name: string) => {
  // Clear both host-scoped and domain-scoped variants to handle cookies
  // that may have been set under older rules.
  document.cookie = `${name}=; path=/; max-age=0`;
  const domain = resolveCookieDomain();
  if (domain) {
    document.cookie = `${name}=; path=/; max-age=0; Domain=${domain}`;
  }
};

// Save state to localStorage (WITHOUT access token for security)
const saveState = (state: any) => {
  try {
    // Only save user and role, NOT accessToken
    const stateToSave = {
      user: state.auth.user,
      role: state.auth.role,
      accessToken: null, // Never persist token
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem("authState", serializedState);

    // Cross-app cookies so the landing page can show avatar/name after login
    if (state.auth.user) {
      const name = encodeURIComponent(state.auth.user.full_name || "");
      const image = encodeURIComponent(state.auth.user.profile_image_url || "");
      setSharedCookie("ogera_logged_in", "true", 86400);
      setSharedCookie("ogera_user_name", name, 86400);
      setSharedCookie("ogera_user_image", image, 86400);
    } else {
      SHARED_COOKIE_NAMES.forEach(clearSharedCookie);
    }
  } catch (err) {
    console.error("Could not save state", err);
  }
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(extendedProfileApi.middleware),
  preloadedState: loadState(), // Load persisted state on app start
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
