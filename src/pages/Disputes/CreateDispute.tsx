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

  // Fetch user's jobs (for students: jobs they applied to, for employers: jobs they posted)
  const { data: jobsData, isLoading: isLoadingJobs } = useGetAllJobsQuery();
  const { data: profileData } = useGetUserProfileQuery(undefined);
  const { data: studentApplications } = useGetStudentApplicationsQuery(undefined, {
    skip: role !== "student",
  });

  const allJobs = jobsData?.data || [];
  // Get user_id from multiple sources - profileData is most reliable, then user object from Redux
  const currentUserId = profileData?.data?.user_id || user?.user_id;

  // Filter jobs based on role - use useMemo to recalculate when dependencies change
  const jobs = React.useMemo(() => {
    if (role === "student") {
      // For students: show jobs they've applied to
      const appliedJobIds = new Set(
        (studentApplications?.data || []).map((app: any) => app.job_id)
      );
      return allJobs.filter((job: any) => appliedJobIds.has(job.job_id));
    } else if (role === "employer") {
      // For employers: show jobs they posted
      if (currentUserId) {
        return allJobs.filter((job: any) => {
          // employer_id should be directly on the job object
          return job.employer_id === currentUserId;
        });
      } else {
        // If user_id is not available yet, show empty array
        return [];
      }
    } else {
      // For admins: show all jobs
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


  // Show loader while jobs or profile data is loading (for employers, we need profileData to filter jobs)
  if (isLoadingJobs || (role === "employer" && !profileData && !user)) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          File a Dispute
        </h1>
        <p className="text-gray-500 mt-2">
          Submit a formal complaint about a job issue. A moderator will review your case.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Job Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Job <span className="text-red-500">*</span>
            </label>
            <select
              name="job_id"
              value={formik.values.job_id}
              onChange={(e) => {
                formik.handleChange(e);
                // Reset job_application_id when job changes (for employers)
                if (role === "employer") {
                  formik.setFieldValue("job_application_id", "");
                }
              }}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                formik.touched.job_id && formik.errors.job_id
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
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
              <p className="mt-1 text-sm text-red-600">{formik.errors.job_id}</p>
            )}
          </div>

          {/* Job Application Selection (for employers only, optional) */}
          {role === "employer" && formik.values.job_id && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Student Application (Optional)
              </label>
              <select
                name="job_application_id"
                value={formik.values.job_application_id || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <p className="mt-1 text-xs text-gray-500">
                If not specified, the system will automatically select the first accepted or hired student for this job.
              </p>
            </div>
          )}

          {/* Dispute Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dispute Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                formik.touched.type && formik.errors.type
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="Payment">Payment Issue</option>
              <option value="Contract Violation">Contract Violation</option>
              <option value="Quality Issue">Quality Issue</option>
              <option value="Timeline">Timeline Issue</option>
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.type}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formik.values.type === "Payment" && "Payment disputes are automatically set to High priority"}
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formik.values.priority || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                formik.touched.priority && formik.errors.priority
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">-- Select priority --</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {formik.touched.priority && formik.errors.priority && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.priority}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dispute Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Payment not received for completed work"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={6}
              placeholder="Provide detailed information about the dispute..."
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum 20 characters. Be as detailed as possible.
            </p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition">
              <input
                type="file"
                id="evidence-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="evidence-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <PaperClipIcon className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority (auto-set, but can be overridden) */}
          {formik.values.priority && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Priority:</strong> {formik.values.priority}
                {formik.values.type === "Payment" && " (Auto-set for payment disputes)"}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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