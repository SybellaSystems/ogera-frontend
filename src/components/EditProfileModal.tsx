import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createProfileUpdateValidation } from "../validation/Index";
import { updateUserProfile, type UserProfile } from "../services/api/profileApi";
import { useResendVerificationEmailMutation } from "../services/api/authApi";
import toast from "react-hot-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: UserProfile | null;
  onUpdateSuccess: () => void;
  userRole: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profileData,
  onUpdateSuccess,
  userRole,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [resendVerificationEmail] = useResendVerificationEmailMutation();

  // Initialize form with profile data
  const formik = useFormik({
    initialValues: {
      firstName: profileData?.full_name?.split(" ")[0] || "",
      lastName: profileData?.full_name?.split(" ")[1] || "",
      email: profileData?.email || "",
      mobile_number: profileData?.mobile_number || "",
      national_id_number: profileData?.national_id_number || "",
      business_registration_id: profileData?.business_registration_id || "",
    },
    validationSchema: createProfileUpdateValidation(userRole),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsUpdating(true);

        // Prepare data for API
        const updateData: any = {
          full_name: `${values.firstName} ${values.lastName}`.trim(),
          mobile_number: values.mobile_number,
        };

        // Check if email changed
        const emailHasChanged = values.email !== profileData?.email;
        if (emailHasChanged) {
          updateData.email = values.email;
        }

        // Add role-specific fields
        if (userRole === "student" && values.national_id_number) {
          updateData.national_id_number = values.national_id_number;
        }

        if (userRole === "employer" && values.business_registration_id) {
          updateData.business_registration_id = values.business_registration_id;
        }

        const response = await updateUserProfile(updateData);

        if (response.success) {
          if (emailHasChanged) {
            toast.success(
              "Profile updated! Please check your email to verify your new email address.",
              { duration: 5000 }
            );
            setEmailChanged(true);
          } else {
            toast.success(response.message || "Profile updated successfully!");
          }
          onUpdateSuccess();
          onClose();
        }
      } catch (error: any) {
        console.error("Update profile error:", error);
        toast.error(
          error?.response?.data?.message ||
            "Failed to update profile. Please try again."
        );
      } finally {
        setIsUpdating(false);
      }
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen && profileData) {
      formik.resetForm({
        values: {
          firstName: profileData?.full_name?.split(" ")[0] || "",
          lastName: profileData?.full_name?.split(" ")[1] || "",
          email: profileData?.email || "",
          mobile_number: profileData?.mobile_number || "",
          national_id_number: profileData?.national_id_number || "",
          business_registration_id: profileData?.business_registration_id || "",
        },
      });
      setEmailChanged(false);
    }
  }, [isOpen, profileData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Edit Profile
          </h2>
          <p className="text-gray-600 text-sm">
            Update your profile information below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter first name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.lastName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="mobile_number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="mobile_number"
                maxLength={10}
                name="mobile_number"
                type="tel"
                placeholder="Enter phone number"
                value={formik.values.mobile_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              {formik.touched.mobile_number && formik.errors.mobile_number && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.mobile_number}
                </p>
              )}
            </div>

            {/* Email (Editable) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
              {formik.values.email !== profileData?.email && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ Changing your email will require verification
                </p>
              )}
            </div>

            {/* National ID (for students) */}
            {userRole === "student" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="national_id_number"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  National ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="national_id_number"
                  name="national_id_number"
                  type="text"
                  placeholder="Enter national ID number"
                  value={formik.values.national_id_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                {formik.touched.national_id_number &&
                  formik.errors.national_id_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.national_id_number}
                    </p>
                  )}
              </div>
            )}

            {/* Business Registration ID (for employers) */}
            {userRole === "employer" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="business_registration_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Business Registration ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="business_registration_id"
                  name="business_registration_id"
                  type="text"
                  placeholder="Enter business registration ID"
                  value={formik.values.business_registration_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                {formik.touched.business_registration_id &&
                  formik.errors.business_registration_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.business_registration_id}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

