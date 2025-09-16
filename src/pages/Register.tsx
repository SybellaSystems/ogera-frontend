import { useEffect, useState } from "react";
import logo from "../assets/logoWhite.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { registerValidationSchema } from "../validation/Index";
import type { RegisterFormValues } from "../type/Index";
import { useFormik } from "formik";
import Button from "../components/button";
import { useRegisterUserMutation } from "../features/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [registerUser, { data, isError, isLoading, isSuccess, error }] =
    useRegisterUserMutation();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const initialValues: RegisterFormValues = {
    accountType: "student",
    full_name: "",
    email: "",
    password: "",
    national_id_number: "",
    businessId: "",
    mobile_number: "",
    terms: false,
    privacy: false,
  };

  const formik = useFormik<RegisterFormValues>({
    initialValues,
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        await registerUser(values).unwrap();
      } catch (err) {
        console.error("Registration error:", err);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (isError && error) {
      const err = error as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong");
    }

    if (data && isSuccess) {
      toast.success(data?.message || "You're Registered Successfully!");
      resetForm();
      navigate("/auth/login");
    }
  }, [isError, error, data, isSuccess, resetForm, navigate]);

  return (
    <div className="w-screen min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Section */}
      <div className="hidden md:flex flex-col justify-between bg-[#7f56d9] rounded-2xl m-1 w-2/5 p-6 text-white">
        {/* Logo */}
        <div
          className="h-10 w-24 bg-contain bg-no-repeat"
          style={{ backgroundImage: `url(${logo})` }}
        />

        {/* Hero Text */}
        <div className="flex flex-col items-center text-center mt-20 gap-4">
          <h1 className="text-4xl font-bold w-3/4">
            Your Success Story Starts Here
          </h1>
          <p className="text-gray-200 w-4/5 text-base">
            Connect with trusted employers, earn money instantly via mobile
            payments, and maintain your academic excellence – all in one
            platform designed for African students.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="bg-[rgba(32,15,163,0.5)] rounded-xl p-4 mt-20 shadow-lg max-w-md mx-auto">
          <p className="text-white mb-3 text-sm">
            I earned $500 last month while maintaining my 3.8 GPA! Ogera's
            academic tracking kept me focused.
          </p>
          <div className="flex items-center gap-3">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User testimonial"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Daphne Park</span>
              <span className="text-xs text-gray-300">
                Computer Science Student
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-start w-full md:w-3/5 p-6 md:p-12 overflow-y-auto">
        <form
          onSubmit={formik.handleSubmit}
          className="w-full max-w-lg flex flex-col"
        >
          <p className="text-2xl font-semibold mb-2">
            Create your account with us below
          </p>
          <p className="text-sm text-gray-600 mb-5">
            Already have an account?{" "}
            <a href="/auth/login" className="text-[#7f56d9] hover:underline">
              Sign In
            </a>
          </p>

          {/* Account Type Toggle */}
          <div className="flex gap-3 mb-5">
            {(["student", "employer"] as const).map((type) => (
              <label
                key={type}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition
                  ${
                    formik.values.accountType === type
                      ? "bg-purple-50 border-[#7f56d9] font-semibold text-[#7f56d9]"
                      : "bg-white border-gray-300 text-gray-600"
                  }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={type}
                  checked={formik.values.accountType === type}
                  onChange={formik.handleChange}
                  className="hidden"
                />
                {type === "student" ? "As a Student" : "As an Employer"}
              </label>
            ))}
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              placeholder="Enter your full name"
              className="w-full p-3 border rounded-lg text-sm"
              value={formik.values.full_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.full_name && formik.errors.full_name && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.full_name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg text-sm"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Password</label>
            <TextField
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create your password"
              fullWidth
              size="small"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              InputProps={{
                style: { borderRadius: "8px", fontSize: "14px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      type="button"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Conditional Fields */}
          {formik.values.accountType === "student" ? (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                National ID Number
              </label>
              <input
                id="national_id_number"
                name="national_id_number"
                placeholder="Enter your national ID number"
                className="w-full p-3 border rounded-lg text-sm"
                value={formik.values.national_id_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.national_id_number &&
                formik.errors.national_id_number && (
                  <p className="text-xs text-red-500 mt-1">
                    {formik.errors.national_id_number}
                  </p>
                )}
            </div>
          ) : (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                Business Registration ID
              </label>
              <input
                id="businessId"
                name="businessId"
                placeholder="Enter your business registration ID"
                className="w-full p-3 border rounded-lg text-sm"
                value={formik.values.businessId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.businessId && formik.errors.businessId && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.businessId}
                </p>
              )}
            </div>
          )}

          {/* Mobile Number */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Mobile Number
            </label>
            <input
              id="mobile_number"
              name="mobile_number"
              placeholder="Enter your mobile number"
              className="w-full p-3 border rounded-lg text-sm"
              value={formik.values.mobile_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.mobile_number && formik.errors.mobile_number && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.mobile_number}
              </p>
            )}
          </div>

          {/* Terms & Privacy */}
          <div className="flex flex-col gap-3 mb-4">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formik.values.terms}
                onChange={formik.handleChange}
                className="mt-1"
              />
              I agree to the{" "}
              <a
                href="#"
                className="text-[#7f56d9] font-medium hover:underline"
              >
                Terms of Service
              </a>
            </label>
            {formik.touched.terms && formik.errors.terms && (
              <p className="text-xs text-red-500">{formik.errors.terms}</p>
            )}

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                checked={formik.values.privacy}
                onChange={formik.handleChange}
                className="mt-1"
              />
              I agree to the{" "}
              <a
                href="#"
                className="text-[#7f56d9] font-medium hover:underline"
              >
                Privacy Policy
              </a>
            </label>
            {formik.touched.privacy && formik.errors.privacy && (
              <p className="text-xs text-red-500">{formik.errors.privacy}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            backgroundcolor="#7f56d9"
            type="submit"
            text={isLoading ? "Submitting..." : "Create Account"}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default Register;
