import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { XMarkIcon, DocumentIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { createProfileUpdateValidation } from "../validation/Index";
import { updateUserProfile, type UserProfile } from "../services/api/profileApi";
import { useResendVerificationEmailMutation } from "../services/api/authApi";
import { uploadResume } from "../services/api/resumeApi";
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
  const [_emailChanged, setEmailChanged] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(profileData?.resume_url || null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [_resendVerificationEmail] = useResendVerificationEmailMutation();

  // Initialize form with profile data
  const formik = useFormik({
    initialValues: {
      firstName: profileData?.full_name?.split(" ")[0] || "",
      lastName: profileData?.full_name?.split(" ")[1] || "",
      email: profileData?.email || "",
      mobile_number: profileData?.mobile_number || "",
      national_id_number: profileData?.national_id_number || "",
      business_registration_id: profileData?.business_registration_id || "",
      cover_letter: profileData?.cover_letter || "",
      preferred_location: profileData?.preferred_location || "",
    },
    validationSchema: createProfileUpdateValidation(userRole),
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("Form onSubmit called with values:", values);
        console.log("Resume URL:", resumeUrl);
        setIsUpdating(true);
        setSubmitting(true);

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

        // Add student-specific fields
        if (userRole === "student") {
          // Always include resume_url (null to clear, or URL to set)
          updateData.resume_url = resumeUrl || null;
          // Always include cover_letter and preferred_location (even if empty to allow clearing)
          updateData.cover_letter = values.cover_letter || null;
          updateData.preferred_location = values.preferred_location || null;
        }

        // Add employer-specific fields
        if (userRole === "employer") {
          // Include preferred_location (company location) for employers
          updateData.preferred_location = values.preferred_location || null;
        }

        console.log("Updating profile with data:", updateData);

        const response = await updateUserProfile(updateData);
        console.log("Profile update response:", response);

        if (response && response.success) {
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
        } else {
          throw new Error(response?.message || "Profile update failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Update profile error:", error);
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to update profile. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsUpdating(false);
        setSubmitting(false);
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
          cover_letter: profileData?.cover_letter || "",
          preferred_location: profileData?.preferred_location || "",
        },
      });
      setEmailChanged(false);
      setResumeFile(null);
      setResumeUrl(profileData?.resume_url || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, profileData]);

  // Update resumeUrl when profileData changes
  useEffect(() => {
    if (profileData?.resume_url) {
      setResumeUrl(profileData.resume_url);
    }
  }, [profileData?.resume_url]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file."
      );
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size too large. Please upload a file smaller than 5MB.");
      return;
    }

    setResumeFile(file);

    // Upload resume immediately
    try {
      setIsUploadingResume(true);
      const response = await uploadResume(file);
      setResumeUrl(response.data.resume_url);
      toast.success("Resume uploaded successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to upload resume"
      );
      setResumeFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto my-auto">
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
          {/* Display validation errors */}
          {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {Object.entries(formik.errors).map(([key, value]) => (
                  <li key={key}>{value as string}</li>
                ))}
              </ul>
            </div>
          )}
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
              {formik.values.mobile_number !== profileData?.mobile_number && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ Changing your phone number will require verification
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

            {/* Resume Upload (for students) */}
            {userRole === "student" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume (Optional)
                </label>
                {!resumeFile && !resumeUrl ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="resume"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="resume"
                            name="resume"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                            className="sr-only"
                            disabled={isUploadingResume}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, TXT up to 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {resumeFile?.name || "Resume uploaded"}
                        </p>
                        {isUploadingResume && (
                          <p className="text-xs text-gray-500">Uploading...</p>
                        )}
                        {resumeUrl && !isUploadingResume && (
                          <p className="text-xs text-green-600 font-medium">
                            ✓ Uploaded
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      disabled={isUploadingResume}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter (for students) */}
            {userRole === "student" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="cover_letter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cover Letter (Optional)
                </label>
                <textarea
                  id="cover_letter"
                  name="cover_letter"
                  rows={6}
                  placeholder="Enter your default cover letter that will be used when applying for jobs..."
                  value={formik.values.cover_letter}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-vertical"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This cover letter will be used as default when applying for jobs. You can edit it for each application.
                </p>
              </div>
            )}

            {/* Preferred Location (for students and employers) */}
            {(userRole === "student" || userRole === "employer") && (
              <div className="md:col-span-2">
                <label
                  htmlFor="preferred_location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {userRole === "employer" ? "Company Location" : "Preferred Work Location"} (Optional)
                </label>
                <input
                  id="preferred_location"
                  name="preferred_location"
                  type="text"
                  placeholder={userRole === "employer" ? "e.g., Nairobi, Kenya" : "e.g., New York, Remote, London"}
                  value={formik.values.preferred_location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {userRole === "employer" ? "Where is your company located?" : "Where would you prefer to work?"}
                </p>
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
              disabled={isUpdating || isUploadingResume}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? "Updating..." : isUploadingResume ? "Uploading Resume..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

