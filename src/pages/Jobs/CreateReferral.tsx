import type { JobReferral } from "../../type/jobs/referral";
import { saveReferral } from "../../services/referralStorage";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateReferral: React.FC = () => {
  const navigate = useNavigate();

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

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const referral: JobReferral = {
    id: `REF-${Date.now()}`,
    title: formData.title,
    company: formData.company,
    location: formData.location,
    type: formData.type,
    category: formData.category,
    description: formData.description,
    source: formData.source,
    originalUrl: formData.originalUrl,

    verificationStatus: formData.verificationStatus as JobReferral["verificationStatus"],
    permissionStatus: formData.permissionStatus as JobReferral["permissionStatus"],

    verificationNotes: formData.verificationNotes,
    expiryDate: formData.expiryDate,

    status: "draft",

    createdAt: new Date().toISOString(),
    createdBy: "admin",
    views: 0,
applyClicks: 0,
reportedApplications: 0,
  };

  saveReferral(referral);

  navigate("/dashboard/jobs/referrals");
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard/jobs/referrals")}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Job Referrals
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Job Referral
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add an external opportunity that has been found and will be
            reviewed before being shared with students.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Basic information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Opportunity Information
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Nigeria Recruitment Intern"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company
                </label>

                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="e.g. One Acre Fund"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>

                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Minna, Niger State, Nigeria"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>

                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Recruitment"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source
                </label>

                <input
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g. One Acre Fund Careers"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Original Job URL
              </label>

              <input
                type="url"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the opportunity..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Verification */}
          <section className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Verification
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  <option>Not Required</option>
                  <option>Unknown</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Verification Notes
              </label>

              <textarea
                name="verificationNotes"
                value={formData.verificationNotes}
                onChange={handleChange}
                rows={4}
                placeholder="Record how the vacancy was verified..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Expiry */}
          <section className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Availability
            </h2>

            <div className="mt-4 max-w-sm">
              <label className="block text-sm font-medium text-gray-700">
                Expected Closing / Expiry Date
              </label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/jobs/referrals")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReferral;