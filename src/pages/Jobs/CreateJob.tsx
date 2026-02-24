import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useCreateJobMutation, useUpdateJobMutation, useGetJobByIdQuery, type JobQuestion } from "../../services/api/jobsApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
// Work arrangement options
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BriefcaseIcon, PlusIcon, XMarkIcon, HomeIcon, ArrowPathIcon, BuildingOfficeIcon, TruckIcon, TagIcon } from "@heroicons/react/24/outline";
import { useGetAllCategoriesQuery } from "../../services/api/jobCategoriesApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import * as Yup from "yup";
import { useSelector } from "react-redux";

interface CreateJobFormValues {
  job_title: string;
  category: string;
  budget: number | "";
  duration: string;
  location: string;
  description?: string;
  requirements?: string;
  skills?: string;
  employment_type?: string;
  experience_level?: string;
  job_category_id?: string;
  status?: "Pending" | "Active" | "Inactive" | "Completed";
  employer_id?: string;
}

const validationSchema = Yup.object({
  job_title: Yup.string()
    .min(3, "Job title must be at least 3 characters")
    .max(255, "Job title must not exceed 255 characters")
    .required("Job title is required"),
  category: Yup.string()
    .min(2, "Work arrangement must be at least 2 characters")
    .max(100, "Work arrangement must not exceed 100 characters")
    .required("Work arrangement is required"),
  budget: Yup.number()
    .positive("Budget must be a positive number")
    .required("Budget is required"),
  duration: Yup.string()
    .min(2, "Duration must be at least 2 characters")
    .max(100, "Duration must not exceed 100 characters")
    .required("Duration is required"),
  location: Yup.string()
    .min(2, "Location must be at least 2 characters")
    .max(255, "Location must not exceed 255 characters")
    .required("Location is required"),
  description: Yup.string().optional(),
  requirements: Yup.string().optional(),
  skills: Yup.string().optional(),
  employment_type: Yup.string().optional(),
  experience_level: Yup.string().optional(),
  status: Yup.string()
    .oneOf(["Pending", "Active", "Inactive", "Completed"], "Invalid status")
    .optional(),
});

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useSelector((state: any) => state.auth.role);
  const { data: profileData } = useGetUserProfileQuery(undefined);
  const currentUserId = profileData?.data?.user_id;
  const isEditMode = !!id;

  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id || "", {
    skip: !isEditMode,
  });

  // Job categories for auto-categorization
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const jobCategories = categoriesData?.data || [];
  const PREFERRED_CATEGORY_KEY = "employer_preferred_job_category";
  const [autoSelected, setAutoSelected] = useState(false);

  // Work arrangement options with SVG icons
  const workArrangementOptions = [
    { value: "Remote", label: "Remote", icon: HomeIcon },
    { value: "Hybrid", label: "Hybrid", icon: ArrowPathIcon },
    { value: "On-site", label: "On-site", icon: BuildingOfficeIcon },
    { value: "Field", label: "Field Work", icon: TruckIcon },
  ];

  const [createJob, { isLoading: isCreating, isError: isCreateError, error: createError, isSuccess: isCreateSuccess, data: createData }] =
    useCreateJobMutation();

  const [updateJob, { isLoading: isUpdating, isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess, data: updateData }] =
    useUpdateJobMutation();

  const job = jobData?.data;

  // Ownership check: employers can only edit their own jobs
  const isUnauthorized =
    isEditMode &&
    job &&
    currentUserId &&
    role === "employer" &&
    job.employer_id !== currentUserId;

  const [questions, setQuestions] = useState<JobQuestion[]>([]);

  // Auto-populate job category from localStorage or existing job data
  const getDefaultCategoryId = () => {
    if (isEditMode && job?.job_category_id) return job.job_category_id;
    try {
      return localStorage.getItem(PREFERRED_CATEGORY_KEY) || "";
    } catch {
      return "";
    }
  };

  const initialValues: CreateJobFormValues = {
    job_title: job?.job_title || "",
    category: job?.category || "",
    budget: job?.budget || "",
    duration: job?.duration || "",
    location: job?.location || "",
    description: job?.description || "",
    requirements: job?.requirements || "",
    skills: job?.skills || "",
    employment_type: job?.employment_type || "",
    experience_level: job?.experience_level || "",
    job_category_id: getDefaultCategoryId(),
    status: job?.status || "Active",
    employer_id: "",
  };

  const formik = useFormik<CreateJobFormValues>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Additional validation: ensure work arrangement is selected
        if (!values.category || values.category.trim() === "") {
          formik.setFieldError("category", "Please select a work arrangement");
          formik.setFieldTouched("category", true);
          toast.error("Work arrangement is required to create a job");
          return;
        }

        const payload: any = {
          job_title: values.job_title.trim(),
          category: values.category.trim(),
          budget: Number(values.budget),
          duration: values.duration.trim(),
          location: values.location.trim(),
          status: values.status || "Pending",
        };

        if (values.description?.trim()) {
          payload.description = values.description.trim();
        }
        if (values.requirements?.trim()) {
          payload.requirements = values.requirements.trim();
        }
        if (values.skills?.trim()) {
          payload.skills = values.skills.trim();
        }
        if (values.employment_type?.trim()) {
          payload.employment_type = values.employment_type.trim();
        }
        if (values.experience_level?.trim()) {
          payload.experience_level = values.experience_level.trim();
        }
        if (values.job_category_id?.trim()) {
          payload.job_category_id = values.job_category_id.trim();
          // Save employer's preferred category for auto-populate on next job
          try {
            localStorage.setItem(PREFERRED_CATEGORY_KEY, values.job_category_id.trim());
          } catch { /* silent */ }
        }

        if (role === "superadmin" && values.employer_id?.trim()) {
          payload.employer_id = values.employer_id.trim();
        }

        if (questions.length > 0) {
          payload.questions = questions.map((q, index) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
            options: q.options,
            display_order: q.display_order !== undefined ? q.display_order : index,
          }));
        }

        if (isEditMode && id) {
          await updateJob({ id, data: payload }).unwrap();
        } else {
          await createJob(payload).unwrap();
        }
      } catch (err) {
        console.error("Create job error:", err);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (isEditMode && job) {
      formik.setValues({
        job_title: job.job_title || "",
        category: job.category || "",
        budget: job.budget || "",
        duration: job.duration || "",
        location: job.location || "",
        description: job.description || "",
        requirements: job.requirements || "",
        skills: job.skills || "",
        employment_type: job.employment_type || "",
        experience_level: job.experience_level || "",
        job_category_id: job.job_category_id || "",
        status: job.status || "Active",
        employer_id: "",
      });
      if (job.questions && job.questions.length > 0) {
        setQuestions(job.questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          options: q.options,
          display_order: q.display_order || 0,
        })));
      }
    }
  }, [job, isEditMode]);

  // Auto-populate category from localStorage for new jobs
  useEffect(() => {
    if (!isEditMode && jobCategories.length > 0) {
      try {
        const preferred = localStorage.getItem(PREFERRED_CATEGORY_KEY);
        if (preferred && jobCategories.some(c => c.category_id === preferred)) {
          if (!formik.values.job_category_id) {
            formik.setFieldValue("job_category_id", preferred);
          }
          setAutoSelected(true);
        }
      } catch { /* silent */ }
    }
  }, [isEditMode, jobCategories.length]);

  useEffect(() => {
    const error = isCreateError ? createError : updateError;
    if (error) {
      const err = error as FetchBaseQueryError & {
        data?: { error?: string; message?: string };
      };
      toast.error(
        err?.data?.error || err?.data?.message || `Failed to ${isEditMode ? "update" : "create"} job`
      );
    }
  }, [isCreateError, createError, isUpdateError, updateError, isEditMode]);

  useEffect(() => {
    const data = isCreateSuccess ? createData : updateData;
    const isSuccess = isCreateSuccess || isUpdateSuccess;
    if (data && isSuccess) {
      toast.success(data?.message || `Job ${isEditMode ? "updated" : "created"} successfully!`);
      if (!isEditMode) {
        resetForm();
        setQuestions([]);
      }
      navigate("/dashboard/jobs/all");
    }
  }, [isCreateSuccess, createData, isUpdateSuccess, updateData, isEditMode, resetForm, navigate]);

  if (isLoadingJob && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6941C6]"></div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Unauthorized Access</h1>
                  <p className="text-red-100 text-sm">You cannot edit this job</p>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-700 mb-4">
                You can only edit jobs that you created. This job belongs to another employer.
              </p>
              <button
                onClick={() => navigate("/dashboard/jobs/all")}
                className="px-6 py-2.5 bg-[#2d1b69] text-white rounded-lg hover:bg-[#1a1035] transition font-medium"
              >
                Back to All Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={formik.handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d1b69] to-[#1a1035] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {isEditMode ? "Edit Job" : "Create New Job"}
                </h1>
                <p className="text-purple-100 text-sm">
                  {isEditMode ? "Update job posting details" : "Fill in the details to post a new job"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Employer ID - Only for superadmin */}
            {role === "superadmin" && (
              <div>
                <label htmlFor="employer_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Employer ID (Optional)
                </label>
                <input
                  id="employer_id"
                  name="employer_id"
                  type="text"
                  placeholder="Enter employer user ID (leave empty for yourself)"
                  value={formik.values.employer_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to create for yourself</p>
              </div>
            )}

            {/* Two column layout for basic fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="job_title"
                  name="job_title"
                  type="text"
                  placeholder="e.g., Full Stack Developer"
                  value={formik.values.job_title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm ${
                    formik.touched.job_title && formik.errors.job_title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formik.touched.job_title && formik.errors.job_title && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.job_title}</p>
                )}
              </div>

              {/* Work Arrangement (Category) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Arrangement <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {workArrangementOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = formik.values.category === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => formik.setFieldValue("category", option.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#6941C6] bg-[#f5f0fc] text-[#6941C6]"
                            : "border-gray-200 hover:border-[#ddd0ec] hover:bg-[#f5f0fc]/50 text-gray-600"
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${isSelected ? "text-[#6941C6]" : "text-gray-500"}`} />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                {formik.touched.category && formik.errors.category && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.category}</p>
                )}
              </div>

              {/* Job Category */}
              <div className="md:col-span-2">
                <label htmlFor="job_category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <TagIcon className="h-4 w-4 text-[#6941C6]" />
                    Job Category
                  </span>
                </label>
                <select
                  id="job_category_id"
                  name="job_category_id"
                  value={formik.values.job_category_id || ""}
                  onChange={(e) => {
                    formik.setFieldValue("job_category_id", e.target.value);
                    setAutoSelected(false);
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm bg-white cursor-pointer"
                >
                  <option value="">Select a job category</option>
                  {jobCategories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                    </option>
                  ))}
                </select>
                {autoSelected && formik.values.job_category_id && !isEditMode && (
                  <p className="text-xs text-[#6941C6] mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Auto-selected based on your last posting
                  </p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (RWF) <span className="text-red-500">*</span>
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  step="1000"
                  min="0"
                  placeholder="e.g., 500000"
                  value={formik.values.budget}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm ${
                    formik.touched.budget && formik.errors.budget ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formik.touched.budget && formik.errors.budget && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.budget}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm bg-white cursor-pointer ${
                    formik.touched.duration && formik.errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select duration</option>
                  <option value="1 month">1 Month</option>
                  <option value="2 months">2 Months</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                  <option value="2 years">2 Years</option>
                  <option value="Permanent">Permanent</option>
                </select>
                {formik.touched.duration && formik.errors.duration && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.duration}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., Kigali, Rwanda or Remote"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm ${
                    formik.touched.location && formik.errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formik.touched.location && formik.errors.location && (
                  <p className="text-xs text-red-500 mt-1">{formik.errors.location}</p>
                )}
              </div>

              {/* Employment Type */}
              <div>
                <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  id="employment_type"
                  name="employment_type"
                  value={formik.values.employment_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm bg-white cursor-pointer"
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={formik.values.experience_level}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm bg-white cursor-pointer"
                >
                  <option value="">Select level</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the job role, responsibilities, and what you're looking for..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                placeholder="List the requirements and qualifications needed..."
                value={formik.values.requirements}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                placeholder="e.g., React, Node.js, TypeScript (comma-separated)"
                value={formik.values.skills}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm"
              />
            </div>

            {/* Status - Only for superadmin */}
            {role === "superadmin" && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] transition-all text-sm bg-white cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}

            {/* Questions Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Application Questions</h3>
                  <p className="text-xs text-gray-500">Add custom questions for applicants (optional)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuestions([
                      ...questions,
                      {
                        question_text: "",
                        question_type: "text",
                        is_required: false,
                        display_order: questions.length,
                      },
                    ]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f0fc] hover:bg-[#ede7f8] text-[#6941C6] rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              {questions.length > 0 && (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[#6941C6]">Question {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newQuestions = questions.filter((_, i) => i !== index);
                            setQuestions(newQuestions);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={question.question_text}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].question_text = e.target.value;
                            setQuestions(newQuestions);
                          }}
                          placeholder="Enter your question..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] text-sm"
                        />

                        <div className="flex gap-3">
                          <select
                            value={question.question_type}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[index].question_type = e.target.value as JobQuestion["question_type"];
                              if (e.target.value !== "multiple_choice") {
                                delete newQuestions[index].options;
                              }
                              setQuestions(newQuestions);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] text-sm bg-white cursor-pointer"
                          >
                            <option value="text">Text Answer</option>
                            <option value="number">Number</option>
                            <option value="yes_no">Yes/No</option>
                            <option value="multiple_choice">Multiple Choice</option>
                          </select>

                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={question.is_required}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index].is_required = e.target.checked;
                                setQuestions(newQuestions);
                              }}
                              className="w-4 h-4 text-[#6941C6] border-gray-300 rounded focus:ring-[#6941C6] cursor-pointer"
                            />
                            Required
                          </label>
                        </div>

                        {question.question_type === "multiple_choice" && (
                          <input
                            type="text"
                            value={Array.isArray(question.options)
                              ? question.options.join(", ")
                              : typeof question.options === "string"
                                ? question.options
                                : ""}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[index].options = e.target.value;
                              setQuestions(newQuestions);
                            }}
                            placeholder="Options (comma-separated): Option 1, Option 2, Option 3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-[#6941C6] text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {questions.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">No questions added yet</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full px-6 py-3 bg-[#2d1b69] hover:bg-[#1a1035] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {(isCreating || isUpdating) && (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isCreating || isUpdating
                  ? (isEditMode ? "Updating..." : "Creating...")
                  : (isEditMode ? "Update Job" : "Create Job")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
