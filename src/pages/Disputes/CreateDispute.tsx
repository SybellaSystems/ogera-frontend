import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon, XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { createDispute, type CreateDisputeRequest } from "../../services/api/disputesApi";
import { useGetAllJobsQuery } from "../../services/api/jobsApi";
import { useGetStudentApplicationsQuery, useGetJobApplicationsQuery } from "../../services/api/jobApplicationApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";

const validationSchema = Yup.object({
  job_id: Yup.string().required("Job is required"),
  type: Yup.string()
    .oneOf(["Payment", "Contract Violation", "Quality Issue", "Timeline"], "Invalid dispute type")
    .required("Dispute type is required"),
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must not exceed 255 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .required("Description is required"),
  priority: Yup.string().oneOf(["High", "Medium", "Low"]).optional(),
});

const CreateDispute: React.FC = () => {
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const user = useSelector((state: any) => state.auth.user);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Fetch user's jobs (for students: jobs they applied to, for employers: jobs they posted)
  const { data: jobsData, isLoading: isLoadingJobs } = useGetAllJobsQuery();
  const { data: profileData } = useGetUserProfileQuery(undefined);
  const { data: studentApplications } = useGetStudentApplicationsQuery(undefined, {
    skip: role !== "student",
  });

  const allJobs = jobsData?.data || [];
  const currentUserId = profileData?.data?.user_id || user?.user_id;

  // Filter jobs based on role
  const jobs = React.useMemo(() => {
    if (role === "student") {
      const appliedJobIds = new Set(
        (studentApplications?.data || []).map((app: any) => app.job_id)
      );
      return allJobs.filter((job: any) => appliedJobIds.has(job.job_id));
    } else if (role === "employer") {
      if (currentUserId) {
        return allJobs.filter((job: any) => job.employer_id === currentUserId);
      } else {
        return [];
      }
    } else {
      return allJobs;
    }
  }, [role, allJobs, currentUserId, studentApplications?.data]);

  const formik = useFormik<CreateDisputeRequest>({
    initialValues: {
      job_id: "",
      job_application_id: "",
      type: "Payment" as const,
      title: "",
      description: "",
      priority: undefined,
      evidence_files: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const disputeData: CreateDisputeRequest = {
          ...values,
          evidence_files: selectedFiles.length > 0 ? selectedFiles : undefined,
        };
        await createDispute(disputeData);
        toast.success("Dispute created successfully! A moderator will review it soon.");
        navigate("/dashboard/disputes/my-disputes");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to create dispute");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // For employers: fetch job applications when a job is selected
  const { data: jobApplicationsData } = useGetJobApplicationsQuery(formik.values.job_id, {
    skip: role !== "employer" || !formik.values.job_id,
  });

  // Auto-set priority based on type (but allow user to change it)
  useEffect(() => {
    if (formik.values.type === "Payment" && !formik.values.priority) {
      formik.setFieldValue("priority", "High");
    } else if (!formik.values.priority) {
      formik.setFieldValue("priority", "Medium");
    }
  }, [formik.values.type]);

  if (isLoadingJobs || (role === "employer" && !profileData && !user)) {
    return (
      <div aria-busy="true" aria-label="Loading dispute form">
        <Loader />
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#ffffff",
    border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
    color: isDark ? "#f3f4f6" : "#1f2937",
  };

  const inputErrorStyle = {
    ...inputStyle,
    border: isDark ? "1px solid rgba(220,38,38,0.5)" : "1px solid #ef4444",
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-4 animate-fadeIn"
      style={{
        background: isDark ? "linear-gradient(135deg, #0f0a1a 0%, #1a1528 100%)" : "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
        minHeight: "100%",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      <div>
        <h1
          className="text-xl font-bold flex items-center gap-2"
          style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
        >
          <ExclamationTriangleIcon className="h-6 w-6" style={{ color: isDark ? "#f87171" : "#dc2626" }} />
          File a Dispute
        </h1>
        <p className="text-xs mt-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
          Submit a formal complaint about a job issue. A moderator will review your case.
        </p>
      </div>

      <div
        className="rounded-lg p-4 md:p-6"
        style={{
          backgroundColor: isDark ? "#1e1833" : "#ffffff",
          border: isDark ? "1px solid rgba(45,27,105,0.5)" : "1px solid #ede7f8",
        }}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Job Selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
              Select Job <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
            </label>
            <select
              name="job_id"
              value={formik.values.job_id}
              onChange={(e) => {
                formik.handleChange(e);
                if (role === "employer") {
                  formik.setFieldValue("job_application_id", "");
                }
              }}
              onBlur={formik.handleBlur}
              aria-required="true"
              className="w-full px-3 py-2 rounded-lg text-xs"
              style={formik.touched.job_id && formik.errors.job_id ? inputErrorStyle : inputStyle}
            >
              <option value="">-- Select a job --</option>
              {isLoadingJobs ? (
                <option value="" disabled>Loading jobs...</option>
              ) : jobs.length === 0 && role === "employer" ? (
                <option value="" disabled>
                  {currentUserId
                    ? "No jobs found. Please create a job first."
                    : "Loading user information..."}
                </option>
              ) : jobs.length === 0 && role === "student" ? (
                <option value="" disabled>No jobs found. Please apply to a job first.</option>
              ) : (
                jobs.map((job: any) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.job_title} - {job.location} (${job.budget})
                  </option>
                ))
              )}
            </select>
            {formik.touched.job_id && formik.errors.job_id && (
              <p className="mt-1 text-xs" style={{ color: isDark ? "#f87171" : "#dc2626" }}>{formik.errors.job_id}</p>
            )}
          </div>

          {/* Job Application Selection (for employers only, optional) */}
          {role === "employer" && formik.values.job_id && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                Select Student Application (Optional)
              </label>
              <select
                name="job_application_id"
                value={formik.values.job_application_id || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 rounded-lg text-xs"
                style={inputStyle}
              >
                <option value="">-- Auto-select first accepted/hired student --</option>
                {(jobApplicationsData?.data || [])
                  .filter((app: any) => app.status === "Accepted" || app.status === "Hired")
                  .map((app: any) => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.student?.full_name || "Student"} - {app.status} (Applied: {new Date(app.applied_at).toLocaleDateString()})
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                If not specified, the system will automatically select the first accepted or hired student for this job.
              </p>
            </div>
          )}

          {/* Dispute Type */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
              Dispute Type <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
            </label>
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-required="true"
              className="w-full px-3 py-2 rounded-lg text-xs"
              style={formik.touched.type && formik.errors.type ? inputErrorStyle : inputStyle}
            >
              <option value="Payment">Payment Issue</option>
              <option value="Contract Violation">Contract Violation</option>
              <option value="Quality Issue">Quality Issue</option>
              <option value="Timeline">Timeline Issue</option>
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className="mt-1 text-xs" style={{ color: isDark ? "#f87171" : "#dc2626" }}>{formik.errors.type}</p>
            )}
            <p className="mt-1 text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              {formik.values.type === "Payment" && "Payment disputes are automatically set to High priority"}
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
              Priority <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
            </label>
            <select
              name="priority"
              value={formik.values.priority || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-required="true"
              className="w-full px-3 py-2 rounded-lg text-xs"
              style={formik.touched.priority && formik.errors.priority ? inputErrorStyle : inputStyle}
            >
              <option value="">-- Select priority --</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {formik.touched.priority && formik.errors.priority && (
              <p className="mt-1 text-xs" style={{ color: isDark ? "#f87171" : "#dc2626" }}>{formik.errors.priority}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
              Dispute Title <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Payment not received for completed work"
              aria-required="true"
              className="w-full px-3 py-2 rounded-lg text-xs"
              style={formik.touched.title && formik.errors.title ? inputErrorStyle : inputStyle}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="mt-1 text-xs" style={{ color: isDark ? "#f87171" : "#dc2626" }}>{formik.errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
              Description <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={6}
              placeholder="Provide detailed information about the dispute..."
              aria-required="true"
              className="w-full px-3 py-2 rounded-lg text-xs resize-none"
              style={formik.touched.description && formik.errors.description ? inputErrorStyle : inputStyle}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-xs" style={{ color: isDark ? "#f87171" : "#dc2626" }}>{formik.errors.description}</p>
            )}
            <p className="mt-1 text-[10px]" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              Minimum 20 characters. Be as detailed as possible.
            </p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
              Upload Evidence (Optional)
            </label>
            <div
              className="rounded-lg p-4 text-center transition"
              style={{
                border: isDark ? "2px dashed rgba(45,27,105,0.5)" : "2px dashed #d1d5db",
              }}
            >
              <input
                type="file"
                id="evidence-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload evidence files"
              />
              <label
                htmlFor="evidence-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <PaperClipIcon className="h-8 w-8 mb-1" style={{ color: isDark ? "#6b7280" : "#9ca3af" }} />
                <span className="text-xs" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                  Click to upload files or drag and drop
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                  PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f9fafb" }}
                  >
                    <span className="text-xs truncate flex-1" style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove file ${file.name}`}
                      className="ml-2"
                    >
                      <XMarkIcon className="h-4 w-4" style={{ color: isDark ? "#f87171" : "#dc2626" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority info banner */}
          {formik.values.priority && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "#eff6ff",
                border: isDark ? "1px solid rgba(59,130,246,0.3)" : "1px solid #bfdbfe",
              }}
            >
              <p className="text-xs" style={{ color: isDark ? "#93c5fd" : "#1e40af" }}>
                <strong>Priority:</strong> {formik.values.priority}
                {formik.values.type === "Payment" && " (Auto-set for payment disputes)"}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition"
              style={{
                backgroundColor: isDark ? "rgba(45,27,105,0.2)" : "#f3f4f6",
                color: isDark ? "#d1d5db" : "#374151",
                border: isDark ? "1px solid rgba(45,27,105,0.4)" : "1px solid #d1d5db",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Submit dispute"
              className="px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isDark ? "#7F56D9" : "#2d1b69", color: "#ffffff" }}
            >
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDispute;
