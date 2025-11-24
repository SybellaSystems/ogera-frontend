import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  accessToken: string | null;
  role: string | null;   
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  role: null,           
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
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;   
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;     
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;             
    },
  },
});

export const { setCredentials, setAccessToken, setRole, logout } =
  authSlice.actions;

export default authSlice.reducer;
