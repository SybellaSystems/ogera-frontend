import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface RoutePermission {
  route: string;
  permission: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface AuthState {
  user: any | null;
  accessToken: string | null;
  role: string | null;
  permissions: RoutePermission[] | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  role: null,
  permissions: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: any;
        accessToken: string;
        role: string;
        permissions?: RoutePermission[] | null;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions || null;
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },

    setUser: (state, action: PayloadAction<any>) => {
      // Merge new user data with existing user data (or create new if null)
      state.user = state.user
        ? { ...state.user, ...action.payload }
        : action.payload;
      // Note: localStorage is automatically updated via store.subscribe() in store.tsx
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.permissions = null;
      // Clear localStorage on logout
      localStorage.removeItem("authState");
    },
  },
});

export const { setCredentials, setAccessToken, setRole, setUser, logout } =
  authSlice.actions;

export default authSlice.reducer;
