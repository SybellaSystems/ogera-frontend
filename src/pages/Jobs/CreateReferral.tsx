
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCreateJobReferralMutation } from "../../services/api/jobReferralsApi";

const CreateReferral: React.FC = () => {
  const navigate = useNavigate();

  const [createJobReferral, { isLoading }] = useCreateJobReferralMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Internship",
    category: "",
    description: "",
    source: "",
    originalUrl: "",
    verificationStatus: "Not Checked",
    permissionStatus: "Not Asked",
    verificationNotes: "",
    expiryDate: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
console.log(formData, "formData");
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  /**
   * Convert the existing frontend verification values
   * to the backend values.
   *
   * UI remains unchanged.
   */
  const mapVerificationStatus = (
    status: string,
  ): "Pending" | "Verified" | "Rejected" => {
    switch (status) {
      case "Confirmed":
        return "Verified";

      case "Could Not Confirm":
      case "Vacancy Closed":
        return "Rejected";

      case "Contact Attempted":
      case "Not Checked":
      default:
        return "Pending";
    }
  };

  /**
   * Convert the existing frontend permission values
   * to the backend values.
   *
   * UI remains unchanged.
   */
  const mapPermissionStatus = (
    status: string,
  ): "Pending" | "Approved" | "Rejected" => {
    switch (status) {
      case "Granted":
        return "Approved";

      case "Declined":
        return "Rejected";

      case "Not Asked":
      case "Pending":
      default:
        return "Pending";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Job Title
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Job title must be at least 3 characters.";
    } else if (formData.title.trim().length > 150) {
      newErrors.title = "Job title must not exceed 150 characters.";
    }

    // Company
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    } else if (formData.company.trim().length < 2) {
      newErrors.company = "Company must be at least 2 characters.";
    } else if (formData.company.trim().length > 100) {
      newErrors.company = "Company must not exceed 100 characters.";
    }

    // Location
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location.trim().length < 2) {
      newErrors.location = "Please enter a valid location.";
    }

    // Job Type
    if (!formData.type.trim()) {
      newErrors.type = "Job type is required";
    }

    // Category
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    // Source
    if (!formData.source.trim()) {
      newErrors.source = "Source is required";
    }

    // Job URL
    if (!formData.originalUrl.trim()) {
      newErrors.originalUrl = "Job URL is required";
    } else {
      try {
        const url = new URL(formData.originalUrl.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          newErrors.originalUrl = "Please enter a valid HTTP or HTTPS URL.";
        }
      } catch {
        newErrors.originalUrl = "Please enter a valid URL.";
      }
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters.";
    }

    // Verification Status
    if (!formData.verificationStatus.trim()) {
      newErrors.verificationStatus = "Verification status is required";
    }

    // Permission Status
    if (!formData.permissionStatus.trim()) {
      newErrors.permissionStatus = "Permission status is required";
    }

    // Verification Notes
    if (!formData.verificationNotes.trim()) {
      newErrors.verificationNotes = "Verification notes are required";
    }

    // Expiry Date
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(formData.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        newErrors.expiryDate = "Expiry date cannot be in the past.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      return;
    }
    try {
      await createJobReferral({
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        employment_type: formData.type,
        category: formData.category.trim(),
        description: formData.description.trim() || null,
        source: formData.source.trim() || null,
        original_url: formData.originalUrl.trim() || null,
        verification_status: mapVerificationStatus(formData.verificationStatus),
        permission_status: mapPermissionStatus(formData.permissionStatus),
        verification_notes: formData.verificationNotes.trim() || null,
        expiry_date: formData.expiryDate || null,
        status: "Pending",
      }).unwrap();
// Show success toast
    toast.success("Job referral created successfully!");

    // Navigate after a short delay so the toast is visible
    setTimeout(() => {
      navigate("/dashboard/jobs/referrals");
    }, 800);
    } catch (error: any) {
      console.error("Create job referral error:", error);

      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to create job referral";

      toast.error(message);
    }
  };

  return (
    // <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto max-w-6xl">
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Create Job Referral
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add an external opportunity that has been found and will be reviewed
          before being shared with students.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl mt-3 border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Basic information */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            Opportunity Information
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Job Title
                <span className="text-sm text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Nigeria Recruitment Intern"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Company
                <span className="text-sm text-red-500">*</span>
              </label>

              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. One Acre Fund"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.company && (
                <p className="mt-1 text-xs text-red-500">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Location
                <span className="text-sm text-red-500">*</span>
              </label>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Minna, Niger State, Nigeria"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-500">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Job Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option>Internship</option>
                <option>Part-time</option>
                <option>Full-time</option>
                <option>Contract</option>
                <option>Volunteer</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-red-500">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Category
                <span className="text-sm text-red-500">*</span>
              </label>

              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Recruitment"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.category && (
                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Source
                <span className="text-sm text-red-500">*</span>
              </label>

              <input
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g. One Acre Fund Careers"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.source && (
                <p className="mt-1 text-xs text-red-500">{errors.source}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              Job URL
              <span className="text-sm text-red-500">*</span>
            </label>

            <input
              type="text"
              name="originalUrl"
              value={formData.originalUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            {errors.originalUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.originalUrl}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              Description
              <span className="text-sm text-red-500">*</span>
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the opportunity..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>
        </section>

        {/* Verification */}
        <section className=" mt-2">
          <h2 className="text-lg font-semibold text-gray-900">Verification</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Verification Status
              </label>

              <select
                name="verificationStatus"
                value={formData.verificationStatus}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option>Not Checked</option>
                <option>Contact Attempted</option>
                <option>Confirmed</option>
                <option>Could Not Confirm</option>
                <option>Vacancy Closed</option>
              </select>
              {errors.verificationStatus && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.verificationStatus}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Permission Status
              </label>

              <select
                name="permissionStatus"
                value={formData.permissionStatus}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option>Not Asked</option>
                <option>Granted</option>
                <option>Declined</option>
              </select>
              {errors.permissionStatus && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.permissionStatus}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              Verification Notes
              <span className="text-sm text-red-500">*</span>
            </label>

            <textarea
              name="verificationNotes"
              value={formData.verificationNotes}
              onChange={handleChange}
              rows={4}
              placeholder="Record how the vacancy was verified..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            {errors.verificationNotes && (
              <p className="mt-1 text-xs text-red-500">
                {errors.verificationNotes}
              </p>
            )}
          </div>
        </section>

        {/* Expiry */}
        <section className="mt-2">
          <h2 className="text-lg font-semibold text-gray-900">Availability</h2>

          <div className="mt-4 max-w-sm">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              Expected Closing / Expiry Date
              <span className="text-sm text-red-500">*</span>
            </label>

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            {errors.expiryDate && (
              <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>
            )}
          </div>
        </section>
        <div className="flex items-center justify-end gap-3 ">
          <button
            type="button"
            onClick={() => navigate("/dashboard/jobs/referrals")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-[#9333EA] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7E22CE] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Referral"}
          </button>
        </div>
        {/* Actions */}
      </form>
    </div>
    // </div>
  );
};

export default CreateReferral;
