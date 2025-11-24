import { combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "../services/api/apiSlice";
import authReducer from "../features/auth/authSlice";

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
