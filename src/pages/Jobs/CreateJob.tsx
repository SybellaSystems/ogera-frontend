import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useCreateJobMutation, useUpdateJobMutation, useGetJobByIdQuery, type JobQuestion } from "../../services/api/jobsApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BriefcaseIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
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
  status?: "Pending" | "Active" | "Inactive" | "Completed";
  employer_id?: string; // For superadmin only
}

const validationSchema = Yup.object({
  job_title: Yup.string()
    .min(3, "Job title must be at least 3 characters")
    .max(255, "Job title must not exceed 255 characters")
    .required("Job title is required"),
  category: Yup.string()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category must not exceed 100 characters")
    .required("Category is required"),
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
  const { data: profileData } = useGetUserProfileQuery();
  const isEditMode = !!id;

  // Fetch job data if editing
  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id || "", {
    skip: !isEditMode,
  });

  const [createJob, { isLoading: isCreating, isError: isCreateError, error: createError, isSuccess: isCreateSuccess, data: createData }] =
    useCreateJobMutation();
  
  const [updateJob, { isLoading: isUpdating, isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess, data: updateData }] =
    useUpdateJobMutation();

  const job = jobData?.data;
  const [questions, setQuestions] = useState<JobQuestion[]>([]);

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
    status: job?.status || "Active",
    employer_id: "",
  };

  const formik = useFormik<CreateJobFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload: any = {
          job_title: values.job_title.trim(),
          category: values.category.trim(),
          budget: Number(values.budget),
          duration: values.duration.trim(),
          location: values.location.trim(),
          status: values.status || "Pending",
        };

        // Add optional fields if provided
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

        // For superadmin, allow setting employer_id
        if (role === "superadmin" && values.employer_id?.trim()) {
          payload.employer_id = values.employer_id.trim();
        }

        // Add questions if any
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

  // Update form when job data loads
  useEffect(() => {
    if (isEditMode && job && formik.values.job_title === "") {
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
        status: job.status || "Active",
        employer_id: "",
      });
      // Load questions if they exist
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
      }
      navigate("/dashboard/jobs/all");
    }
  }, [isCreateSuccess, createData, isUpdateSuccess, updateData, isEditMode, resetForm, navigate]);

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <BriefcaseIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>{isEditMode ? "Edit Job" : "Create Job"}</Title>
          <Subtitle>
            {isEditMode ? "Update job posting details." : "Create a new job posting."} {role === "employer" ? "This job will be associated with your account." : "You can assign this job to any employer."}
          </Subtitle>
        </Header>

        {/* Employer ID - Only for superadmin */}
        {role === "superadmin" && (
          <FormGroup>
            <Label htmlFor="employer_id">Employer ID (Optional)</Label>
            <Input
              id="employer_id"
              name="employer_id"
              placeholder="Enter employer user ID (leave empty to assign to yourself)"
              value={formik.values.employer_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <HelperText>
              Leave empty to create the job for yourself, or enter an employer's user ID
            </HelperText>
          </FormGroup>
        )}

        {/* Job Title */}
        <FormGroup>
          <Label htmlFor="job_title">Job Title *</Label>
          <Input
            id="job_title"
            name="job_title"
            placeholder="e.g., Full Stack Developer"
            value={formik.values.job_title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.job_title && formik.errors.job_title && (
            <ErrorText>{formik.errors.job_title}</ErrorText>
          )}
        </FormGroup>

        {/* Category */}
        <FormGroup>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            name="category"
            placeholder="e.g., Technology, Marketing, Design"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.category && formik.errors.category && (
            <ErrorText>{formik.errors.category}</ErrorText>
          )}
        </FormGroup>

        {/* Budget */}
        <FormGroup>
          <Label htmlFor="budget">Budget *</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 5000.00"
            value={formik.values.budget}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.budget && formik.errors.budget && (
            <ErrorText>{formik.errors.budget}</ErrorText>
          )}
        </FormGroup>

        {/* Duration */}
        <FormGroup>
          <Label htmlFor="duration">Duration *</Label>
          <Input
            id="duration"
            name="duration"
            placeholder="e.g., 3 months, 6 months, 1 year"
            value={formik.values.duration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.duration && formik.errors.duration && (
            <ErrorText>{formik.errors.duration}</ErrorText>
          )}
        </FormGroup>

        {/* Location */}
        <FormGroup>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g., New York, NY or Remote"
            value={formik.values.location}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.location && formik.errors.location && (
            <ErrorText>{formik.errors.location}</ErrorText>
          )}
        </FormGroup>

        {/* Description */}
        <FormGroup>
          <Label htmlFor="description">Description (Optional)</Label>
          <TextArea
            id="description"
            name="description"
            rows={4}
            placeholder="Enter job description..."
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.description && formik.errors.description && (
            <ErrorText>{formik.errors.description}</ErrorText>
          )}
        </FormGroup>

        {/* Requirements */}
        <FormGroup>
          <Label htmlFor="requirements">Requirements (Optional)</Label>
          <TextArea
            id="requirements"
            name="requirements"
            rows={3}
            placeholder="Enter job requirements..."
            value={formik.values.requirements}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.requirements && formik.errors.requirements && (
            <ErrorText>{formik.errors.requirements}</ErrorText>
          )}
        </FormGroup>

        {/* Skills */}
        <FormGroup>
          <Label htmlFor="skills">Skills (Optional)</Label>
          <Input
            id="skills"
            name="skills"
            placeholder="e.g., React, Node.js, TypeScript"
            value={formik.values.skills}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.skills && formik.errors.skills && (
            <ErrorText>{formik.errors.skills}</ErrorText>
          )}
        </FormGroup>

        {/* Employment Type */}
        <FormGroup>
          <Label htmlFor="employment_type">Employment Type (Optional)</Label>
          <Select
            id="employment_type"
            name="employment_type"
            value={formik.values.employment_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select employment type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </Select>
          {formik.touched.employment_type && formik.errors.employment_type && (
            <ErrorText>{formik.errors.employment_type}</ErrorText>
          )}
        </FormGroup>

        {/* Experience Level */}
        <FormGroup>
          <Label htmlFor="experience_level">Experience Level (Optional)</Label>
          <Select
            id="experience_level"
            name="experience_level"
            value={formik.values.experience_level}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select experience level</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
            <option value="Executive">Executive</option>
          </Select>
          {formik.touched.experience_level && formik.errors.experience_level && (
            <ErrorText>{formik.errors.experience_level}</ErrorText>
          )}
        </FormGroup>

        {/* Status - Only for superadmin */}
        {role === "superadmin" && (
          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <ErrorText>{formik.errors.status}</ErrorText>
            )}
          </FormGroup>
        )}

        {/* Questions Section */}
        <QuestionsSection>
          <QuestionsHeader>
            <Label>Application Questions (Optional)</Label>
            <HelperText>
              Add questions that applicants must answer when applying for this job
            </HelperText>
          </QuestionsHeader>
          
          {questions.map((question, index) => (
            <QuestionCard key={index}>
              <QuestionHeader>
                <QuestionNumber>Question {index + 1}</QuestionNumber>
                <DeleteButton
                  type="button"
                  onClick={() => {
                    const newQuestions = questions.filter((_, i) => i !== index);
                    setQuestions(newQuestions);
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                </DeleteButton>
              </QuestionHeader>
              
              <FormGroup>
                <Label htmlFor={`question_text_${index}`}>Question Text *</Label>
                <Input
                  id={`question_text_${index}`}
                  value={question.question_text}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].question_text = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="e.g., How many years of experience do you have?"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor={`question_type_${index}`}>Question Type *</Label>
                <Select
                  id={`question_type_${index}`}
                  value={question.question_type}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].question_type = e.target.value as JobQuestion["question_type"];
                    if (e.target.value !== "multiple_choice") {
                      delete newQuestions[index].options;
                    }
                    setQuestions(newQuestions);
                  }}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="yes_no">Yes/No</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </Select>
              </FormGroup>

              {question.question_type === "multiple_choice" && (
                <FormGroup>
                  <Label htmlFor={`question_options_${index}`}>
                    Options (comma-separated) *
                  </Label>
                  <Input
                    id={`question_options_${index}`}
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
                    placeholder="e.g., Option 1, Option 2, Option 3"
                  />
                </FormGroup>
              )}

              <FormGroup>
                <CheckboxContainer>
                  <input
                    type="checkbox"
                    id={`question_required_${index}`}
                    checked={question.is_required}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].is_required = e.target.checked;
                      setQuestions(newQuestions);
                    }}
                  />
                  <Label htmlFor={`question_required_${index}`} style={{ margin: 0, cursor: "pointer" }}>
                    Required question
                  </Label>
                </CheckboxContainer>
              </FormGroup>
            </QuestionCard>
          ))}

          <AddQuestionButton
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
          >
            <PlusIcon className="h-5 w-5" />
            Add Question
          </AddQuestionButton>
        </QuestionsSection>

        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isCreating || isUpdating ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Job" : "Create Job")}
          disabled={isCreating || isUpdating || isLoadingJob}
        />
      </FormContainer>
    </Container>
  );
};

export default CreateJob;

const Container = styled("div")`
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 16px;
  background: #f9fafb;

  @media (min-width: 640px) {
    padding: 40px 20px;
  }
`;

const FormContainer = styled("form")`
  max-width: 700px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (min-width: 640px) {
    border-radius: 16px;
    padding: 40px;
  }
`;

const Header = styled("div")`
  text-align: center;
  margin-bottom: 32px;
`;

const IconWrapper = styled("div")`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Title = styled("h1")`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;

  @media (min-width: 640px) {
    font-size: 28px;
  }
`;

const Subtitle = styled("p")`
  font-size: 12px;
  color: #6b7280;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 14px;
  }
`;

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled("label")`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }
`;

const TextArea = styled("textarea")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }
`;

const Select = styled("select")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #7f56d9;
  }

  option {
    padding: 8px;
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const HelperText = styled("div")`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const QuestionsSection = styled("div")`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e5e7eb;
`;

const QuestionsHeader = styled("div")`
  margin-bottom: 20px;
`;

const QuestionCard = styled("div")`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
`;

const QuestionHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const QuestionNumber = styled("span")`
  font-weight: 600;
  color: #7f56d9;
  font-size: 14px;
`;

const DeleteButton = styled("button")`
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;

  &:hover {
    background: #fecaca;
  }
`;

const CheckboxContainer = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #7f56d9;
  }
`;

const AddQuestionButton = styled("button")`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #e5e7eb;
    border-color: #7f56d9;
    color: #7f56d9;
  }
`;

