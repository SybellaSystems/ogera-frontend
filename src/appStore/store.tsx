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

    // Set a cross-app cookie so the landing page knows the user is logged in.
    // Cookies on localhost are shared across ports (no port in domain matching per RFC 6265).
    if (state.auth.user) {
      const name = encodeURIComponent(state.auth.user.full_name || "");
      const image = encodeURIComponent(state.auth.user.profile_image_url || "");
      document.cookie = `ogera_logged_in=true; path=/; SameSite=Lax; max-age=86400`;
      document.cookie = `ogera_user_name=${name}; path=/; SameSite=Lax; max-age=86400`;
      document.cookie = `ogera_user_image=${image}; path=/; SameSite=Lax; max-age=86400`;
    } else {
      document.cookie = "ogera_logged_in=; path=/; max-age=0";
      document.cookie = "ogera_user_name=; path=/; max-age=0";
      document.cookie = "ogera_user_image=; path=/; max-age=0";
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
