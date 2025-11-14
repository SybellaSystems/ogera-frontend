import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const AUTH_API = "http://localhost:5000/api/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (values) => ({
        url: "/register",
        method: "POST",
        body: values,
      }),
    }),
    loginUser: builder.mutation({
      query: (values) => ({
        url: "/login",
        method: "POST",
        body: values,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (values) => ({
        url: "/forgot-password",
        method: "POST",
        body: values,
      })
    })
  }),
});

export const {useRegisterUserMutation,useLoginUserMutation, useForgotPasswordMutation} = authApi;
