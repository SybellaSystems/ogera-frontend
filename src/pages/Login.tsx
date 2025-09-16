import loginImage from "../assets/login.png";
import logo from "../assets/Logo.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { loginValidationSchema } from "../validation/Index";
import type { LoginFormValues } from "../type/Index";
import ReuseButton from "../components/button";
import { useLoginUserMutation } from "../features/api/authApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [loginUser, { data, isError, isLoading, isSuccess, error }] =
    useLoginUserMutation();

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
      terms: false,
      privacy: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        await loginUser(values).unwrap();
      } catch (error) {
        console.error("Login error:", error);
      }
    },
  });

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & {
        data?: { message?: string };
      };
      toast.error(err?.data?.message || "Something went wrong");
    }

    if (data && isSuccess) {
      toast.success(data?.message || "You're Logged In Successfully !");
      formik.resetForm();
      navigate("/auth/register");
    }
  }, [isError, error, data, isSuccess]);

  return (
    <div className="w-screen h-screen flex flex-col sm:flex-row font-inter">
      {/* Left Section */}
      <div className="w-full sm:w-1/2 h-screen bg-white flex items-center justify-center p-5">
        <div className="w-3/4 flex flex-col items-start gap-8 sm:w-3/4 sm:gap-6">
          {/* Logo */}
          <img
            src={logo}
            alt="Ogera Logo"
            className="h-10 mb-5 object-contain"
          />

          {/* Welcome Text */}
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-semibold text-gray-900 sm:text-lg">
              Welcome to Ogera 👋
            </p>
            <p className="text-sm text-gray-600 sm:text-xs">
              Sign in to access your Ogera account and continue earning while
              you learn.
            </p>
          </div>

          {/* Form */}
          <form
            className="flex flex-col gap-5 w-full"
            onSubmit={formik.handleSubmit}
          >
            {/* Email */}
            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-900"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                className="px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <TextField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                variant="outlined"
                fullWidth
                size="small"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  style: { borderRadius: "8px", fontSize: "14px" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <a
              href="/auth/forgot-password"
              className="text-xs text-indigo-600 hover:underline self-end"
            >
              Forgot Password?
            </a>

            {/* Terms & Privacy */}
            <div className="flex flex-col gap-3 my-4">
              <div className="flex items-start gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formik.values.terms}
                  onChange={formik.handleChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="terms" className="leading-5">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Terms of Service
                  </a>
                </label>
              </div>
              {formik.touched.terms && formik.errors.terms && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.terms}
                </div>
              )}

              <div className="flex items-start gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={formik.values.privacy}
                  onChange={formik.handleChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="privacy" className="leading-5">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {formik.touched.privacy && formik.errors.privacy && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.privacy}
                </div>
              )}
            </div>

            {/* Submit */}
            <ReuseButton
              backgroundcolor="#7f56d9"
              type="submit"
              text={isLoading ? "Please Wait ..." : "Sign In"}
              disabled={isLoading}
            />

            {/* Sign up */}
            <p className="text-sm text-gray-600 text-center mt-3">
              Don’t have an account?{" "}
              <a
                href="/auth/register"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="hidden sm:block w-1/2 h-screen relative rounded-tl-3xl rounded-bl-3xl overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${loginImage})` }}
      >
        <div className="absolute inset-0 bg-indigo-600 opacity-50" />
        <div className="relative text-white p-16 flex flex-col justify-center items-center h-full">
          <div className="bg-black/30 p-5 rounded-lg max-w-md text-left">
            <h2 className="text-3xl font-extrabold mb-3">
              Empowering <br />
              Africa&apos;s Students
            </h2>
            <p className="text-sm leading-relaxed">
              Ogera is Africa’s premier student job platform that connects
              ambitious students with flexible, trusted part-time opportunities
              while ensuring academic excellence through performance tracking
              and instant mobile money payments.
            </p>
          </div>

          <p className="mt-12 text-m opacity-70 max-w-md text-left">
            Ogera is dedicated to solving the critical challenge facing African
            students
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
