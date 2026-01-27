import { combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "../services/api/apiSlice";
import { extendedProfileApi } from "../services/api/extendedProfileApi";
import authReducer from "../features/auth/authSlice";

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [extendedProfileApi.reducerPath]: extendedProfileApi.reducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
