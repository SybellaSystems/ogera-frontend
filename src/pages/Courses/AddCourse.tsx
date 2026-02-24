import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpenIcon, PlusIcon, TrashIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import * as Yup from "yup";
import { useCreateCourseMutation, type CourseStep, uploadCourseContent } from "../../services/api/coursesApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useTheme } from "../../context/ThemeContext";

interface AddCourseFormValues {
  course_name: string;
  type: string;
  tag: string;
  description: string;
  steps: CourseStep[];
}

const validationSchema = Yup.object({
  course_name: Yup.string()
    .min(3, "Course name must be at least 3 characters")
    .max(255, "Course name must not exceed 255 characters")
    .required("Course name is required"),
  type: Yup.string()
    .required("Course type is required"),
  tag: Yup.string()
    .min(2, "Tag must be at least 2 characters")
    .max(100, "Tag must not exceed 100 characters")
    .required("Tag is required"),
  description: Yup.string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
});

interface StepUploadState {
  inputType: "url" | "upload"; // Whether using URL or file upload
  file: File | null;
  isUploading: boolean;
  uploadError: string | null;
}

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [steps, setSteps] = useState<CourseStep[]>([]);
  const [stepUploadStates, setStepUploadStates] = useState<Record<number, StepUploadState>>({});
  const [createCourse, { isLoading: isSubmitting,  isSuccess, data }] = useCreateCourseMutation();

  const initialValues: AddCourseFormValues = {
    course_name: "",
    type: "",
    tag: "",
    description: "",
    steps: [],
  };

  const formik = useFormik<AddCourseFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          course_name: values.course_name,
          type: values.type,
          tag: values.tag,
          description: values.description || undefined,
          steps: steps.length > 0 ? steps.map((step, index) => ({
            step_type: step.step_type,
            step_content: step.step_content,
            step_title: step.step_title || undefined,
            step_order: index + 1,
          })) : undefined,
        };

        await createCourse(payload).unwrap();
      } catch (error: any) {
        console.error("Create course error:", error);
        const err = error as FetchBaseQueryError & {
          data?: { message?: string };
        };
        toast.error(err?.data?.message || "Failed to create course");
      }
    },
  });

  // Handle success/error states
  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data?.message || "Course created successfully!");
      formik.resetForm();
      setSteps([]);
      setStepUploadStates({});
      // Stay on the same page instead of navigating
    }
  }, [isSuccess, data]);

  // Initialize upload state for a step
  const initializeStepUploadState = (index: number) => {
    if (!stepUploadStates[index]) {
      setStepUploadStates((prev) => ({
        ...prev,
        [index]: {
          inputType: "url",
          file: null,
          isUploading: false,
          uploadError: null,
        },
      }));
    }
  };

  // Handle file selection
  const handleFileChange = async (index: number, file: File | null, stepType: CourseStep["step_type"]) => {
    if (!file) return;

    // Validate file type
    if (stepType === "pdf" && file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }
    if (stepType === "image" && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Update state
    setStepUploadStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        file,
        isUploading: true,
        uploadError: null,
      },
    }));

    try {
      // Upload file
      const response = await uploadCourseContent(file, stepType as "image" | "pdf");

      if (response.success && response.data.file_url) {
        // Update step content with the uploaded file URL
        const newSteps = [...steps];
        newSteps[index].step_content = response.data.file_url;
        setSteps(newSteps);

        // Update upload state
        setStepUploadStates((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            isUploading: false,
            uploadError: null,
          },
        }));

        toast.success("File uploaded successfully!");
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload file";
      setStepUploadStates((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          isUploading: false,
          uploadError: errorMessage,
        },
      }));
      toast.error(errorMessage);
    }
  };

  // Handle input type change (URL vs Upload)
  const handleInputTypeChange = (index: number, inputType: "url" | "upload") => {
    setStepUploadStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index] || { file: null, isUploading: false, uploadError: null },
        inputType,
      },
    }));

    // Clear step content when switching input types
    const newSteps = [...steps];
    newSteps[index].step_content = "";
    setSteps(newSteps);
  };

  return (
    <Container isDark={isDark}>
      <FormContainer isDark={isDark} onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <BookOpenIcon className="h-8 w-8" style={{ color: isDark ? "#c084fc" : "#7f56d9" }} />
          </IconWrapper>
          <Title isDark={isDark}>Add Course</Title>
          <Subtitle isDark={isDark}>Create a new course with all the necessary details.</Subtitle>
        </Header>

        {/* Course Name */}
        <FormGroup>
          <Label isDark={isDark} htmlFor="course_name">Course Name *</Label>
          <Input
            isDark={isDark}
            id="course_name"
            name="course_name"
            placeholder="e.g., Introduction to Web Development"
            value={formik.values.course_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.course_name && formik.errors.course_name && (
            <ErrorText>{formik.errors.course_name}</ErrorText>
          )}
        </FormGroup>

        {/* Course Type */}
        <FormGroup>
          <Label isDark={isDark} htmlFor="type">Course Type *</Label>
          <Select
            isDark={isDark}
            id="type"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select course type</option>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Self-Paced">Self-Paced</option>
            <option value="Live">Live</option>
            <option value="Recorded">Recorded</option>
          </Select>
          {formik.touched.type && formik.errors.type && (
            <ErrorText>{formik.errors.type}</ErrorText>
          )}
        </FormGroup>

        {/* Tag */}
        <FormGroup>
          <Label isDark={isDark} htmlFor="tag">Tag *</Label>
          <Input
            isDark={isDark}
            id="tag"
            name="tag"
            placeholder="e.g., Programming, Design, Business, Marketing"
            value={formik.values.tag}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText isDark={isDark}>
            Enter a tag to categorize this course (e.g., Technology, Design, Business)
          </HelperText>
          {formik.touched.tag && formik.errors.tag && (
            <ErrorText>{formik.errors.tag}</ErrorText>
          )}
        </FormGroup>

        {/* Description */}
        <FormGroup>
          <Label isDark={isDark} htmlFor="description">Description (Optional)</Label>
          <TextArea
            isDark={isDark}
            id="description"
            name="description"
            rows={6}
            placeholder="Enter course description... (e.g., This course covers the fundamentals of web development including HTML, CSS, and JavaScript)"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText isDark={isDark}>
            Provide a detailed description of what students will learn in this course.
          </HelperText>
          {formik.touched.description && formik.errors.description && (
            <ErrorText>{formik.errors.description}</ErrorText>
          )}
        </FormGroup>

        {/* Course Steps Section */}
        <StepsSection isDark={isDark}>
          <StepsHeader>
            <Label isDark={isDark}>Course Steps (Optional)</Label>
            <HelperText isDark={isDark}>
              Add learning steps for this course. Each step can be a video, link, PDF, image, or text content.
            </HelperText>
          </StepsHeader>

          {steps.map((step, index) => {
            // Initialize upload state if not exists
            if (!stepUploadStates[index]) {
              initializeStepUploadState(index);
            }
            const uploadState = stepUploadStates[index] || { inputType: "url" as const, file: null, isUploading: false, uploadError: null };
            const supportsFileUpload = step.step_type === "pdf" || step.step_type === "image";

            return (
              <StepCard isDark={isDark} key={index}>
                <StepHeader>
                  <StepNumber>Step {index + 1}</StepNumber>
                  <DeleteStepButton
                    isDark={isDark}
                    type="button"
                    onClick={() => {
                      const newSteps = steps.filter((_, i) => i !== index);
                      setSteps(newSteps);
                      // Clean up upload state
                      const newUploadStates = { ...stepUploadStates };
                      delete newUploadStates[index];
                      setStepUploadStates(newUploadStates);
                    }}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </DeleteStepButton>
                </StepHeader>

                <FormGroup>
                  <Label isDark={isDark} htmlFor={`step_title_${index}`}>Step Title (Optional)</Label>
                  <Input
                    isDark={isDark}
                    id={`step_title_${index}`}
                    value={step.step_title || ""}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].step_title = e.target.value;
                      setSteps(newSteps);
                    }}
                    placeholder="e.g., Introduction to HTML"
                  />
                </FormGroup>

                <FormGroup>
                  <Label isDark={isDark} htmlFor={`step_type_${index}`}>Step Type *</Label>
                  <Select
                    isDark={isDark}
                    id={`step_type_${index}`}
                    value={step.step_type}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].step_type = e.target.value as CourseStep["step_type"];
                      newSteps[index].step_content = ""; // Reset content when type changes
                      setSteps(newSteps);
                      // Reset upload state when type changes
                      setStepUploadStates((prev) => ({
                        ...prev,
                        [index]: {
                          inputType: "url",
                          file: null,
                          isUploading: false,
                          uploadError: null,
                        },
                      }));
                    }}
                  >
                    <option value="video">Watch YouTube Video</option>
                    <option value="link">Read Link</option>
                    <option value="pdf">Read PDF</option>
                    <option value="image">View Image</option>
                    <option value="text">Read Text</option>
                  </Select>
                </FormGroup>

                {/* Input Type Selection (URL or Upload) - Only for PDF and Image */}
                {supportsFileUpload && (
                  <FormGroup>
                    <Label isDark={isDark}>Content Source *</Label>
                    <InputTypeContainer>
                      <InputTypeOption isDark={isDark}>
                        <input
                          type="radio"
                          id={`input_type_url_${index}`}
                          name={`input_type_${index}`}
                          checked={uploadState.inputType === "url"}
                          onChange={() => handleInputTypeChange(index, "url")}
                        />
                        <label htmlFor={`input_type_url_${index}`}>Enter URL</label>
                      </InputTypeOption>
                      <InputTypeOption isDark={isDark}>
                        <input
                          type="radio"
                          id={`input_type_upload_${index}`}
                          name={`input_type_${index}`}
                          checked={uploadState.inputType === "upload"}
                          onChange={() => handleInputTypeChange(index, "upload")}
                        />
                        <label htmlFor={`input_type_upload_${index}`}>Upload from Computer</label>
                      </InputTypeOption>
                    </InputTypeContainer>
                  </FormGroup>
                )}

                <FormGroup>
                  <Label isDark={isDark} htmlFor={`step_content_${index}`}>
                    {step.step_type === "video" && "YouTube Video URL *"}
                    {step.step_type === "link" && "Link URL *"}
                    {step.step_type === "pdf" && uploadState.inputType === "url" && "PDF URL *"}
                    {step.step_type === "pdf" && uploadState.inputType === "upload" && "PDF File *"}
                    {step.step_type === "image" && uploadState.inputType === "url" && "Image URL *"}
                    {step.step_type === "image" && uploadState.inputType === "upload" && "Image File *"}
                    {step.step_type === "text" && "Text Content *"}
                  </Label>
                  {step.step_type === "text" ? (
                    <TextArea
                      isDark={isDark}
                      id={`step_content_${index}`}
                      rows={4}
                      value={step.step_content}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].step_content = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder="Enter text content for this step..."
                    />
                  ) : supportsFileUpload && uploadState.inputType === "upload" ? (
                    <FileUploadContainer>
                      <FileInput
                        id={`step_content_${index}`}
                        type="file"
                        accept={step.step_type === "pdf" ? "application/pdf" : "image/*"}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileChange(index, file, step.step_type);
                        }}
                        disabled={uploadState.isUploading}
                      />
                      <FileUploadLabel isDark={isDark} htmlFor={`step_content_${index}`}>
                        {uploadState.isUploading ? (
                          <>
                            <CloudArrowUpIcon className="h-5 w-5 animate-pulse" />
                            Uploading...
                          </>
                        ) : uploadState.file ? (
                          <>
                            <CloudArrowUpIcon className="h-5 w-5" />
                            {uploadState.file.name}
                          </>
                        ) : (
                          <>
                            <CloudArrowUpIcon className="h-5 w-5" />
                            Choose file to upload
                          </>
                        )}
                      </FileUploadLabel>
                      {uploadState.file && !uploadState.isUploading && (
                        <FileInfo isDark={isDark}>
                          {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                        </FileInfo>
                      )}
                      {uploadState.uploadError && (
                        <ErrorText>{uploadState.uploadError}</ErrorText>
                      )}
                      {step.step_content && !uploadState.isUploading && (
                        <SuccessText>✓ File uploaded successfully</SuccessText>
                      )}
                    </FileUploadContainer>
                  ) : (
                    <Input
                      isDark={isDark}
                      id={`step_content_${index}`}
                      type="url"
                      value={step.step_content}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index].step_content = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder={
                        step.step_type === "video"
                          ? "e.g., https://www.youtube.com/watch?v=..."
                          : step.step_type === "link"
                          ? "e.g., https://example.com/article"
                          : step.step_type === "pdf"
                          ? "e.g., https://example.com/document.pdf"
                          : "e.g., https://example.com/image.jpg"
                      }
                    />
                  )}
                  <HelperText isDark={isDark}>
                    {step.step_type === "video" && "Enter a YouTube video URL"}
                    {step.step_type === "link" && "Enter a web page URL"}
                    {step.step_type === "pdf" && uploadState.inputType === "url" && "Enter a PDF document URL"}
                    {step.step_type === "pdf" && uploadState.inputType === "upload" && "Upload a PDF file from your computer (max 10MB)"}
                    {step.step_type === "image" && uploadState.inputType === "url" && "Enter an image URL"}
                    {step.step_type === "image" && uploadState.inputType === "upload" && "Upload an image file from your computer (max 10MB)"}
                    {step.step_type === "text" && "Enter the text content for this step"}
                  </HelperText>
                </FormGroup>
              </StepCard>
            );
          })}

          <AddStepButton
            isDark={isDark}
            type="button"
            onClick={() => {
              setSteps([
                ...steps,
                {
                  step_type: "video",
                  step_content: "",
                  step_title: "",
                  step_order: steps.length + 1,
                },
              ]);
            }}
          >
            <PlusIcon className="h-5 w-5" />
            Add Step
          </AddStepButton>
        </StepsSection>

        {/* Action Buttons */}
        <ButtonContainer isDark={isDark}>
          <Button
            text="Cancel"
            onClick={() => navigate("/dashboard/courses/view")}
            disabled={isSubmitting}
          />
          <Button
            text={isSubmitting ? "Creating..." : "Create Course"}
            onClick={() => formik.handleSubmit()}
            disabled={isSubmitting}
          />
        </ButtonContainer>
      </FormContainer>
    </Container>
  );
};

export default AddCourse;

// ─── Theme prop type ─────────────────────────────────────
interface ThemeProps {
  isDark?: boolean;
}

const sfp = { shouldForwardProp: (prop: string) => prop !== "isDark" };

// ─── Styled Components ───────────────────────────────────
const Container = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  padding: 24,
  minHeight: "100vh",
  background: isDark
    ? "linear-gradient(to bottom right, #0f0a1a, #1a1528)"
    : "#f9fafb",
  "@media (min-width: 640px)": { padding: 32 },
  "@media (min-width: 1024px)": { padding: 48 },
}));

const FormContainer = styled("form", sfp)<ThemeProps>(({ isDark }) => ({
  maxWidth: 800,
  margin: "0 auto",
  background: isDark ? "#1e1833" : "white",
  borderRadius: 12,
  padding: 32,
  boxShadow: isDark
    ? "0 1px 3px rgba(0,0,0,0.3)"
    : "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
  border: isDark ? "1px solid rgba(45,27,105,0.5)" : "none",
  "@media (min-width: 640px)": { padding: 40 },
}));

const Header = styled("div")`
  text-align: center;
  margin-bottom: 32px;
`;

const IconWrapper = styled("div")`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Title = styled("h1", sfp)<ThemeProps>(({ isDark }) => ({
  fontSize: 24,
  fontWeight: 700,
  color: isDark ? "#f3f4f6" : "#111827",
  marginBottom: 8,
  "@media (min-width: 640px)": { fontSize: 28 },
}));

const Subtitle = styled("p", sfp)<ThemeProps>(({ isDark }) => ({
  fontSize: 12,
  color: isDark ? "#9ca3af" : "#6b7280",
  margin: 0,
  "@media (min-width: 640px)": { fontSize: 14 },
}));

const FormGroup = styled("div")`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled("label", sfp)<ThemeProps>(({ isDark }) => ({
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 500,
  color: isDark ? "#d1d5db" : "#374151",
}));

const Input = styled("input", sfp)<ThemeProps>(({ isDark }) => ({
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
  fontSize: 14,
  transition: "border-color 0.2s",
  background: isDark ? "#0f0a1a" : "white",
  color: isDark ? "#f3f4f6" : "#111827",
  "&:focus": {
    outline: "none",
    borderColor: "#7f56d9",
    boxShadow: "0 0 0 3px rgba(127,86,217,0.1)",
  },
  "&::placeholder": {
    color: isDark ? "#6b7280" : "#9ca3af",
  },
}));

const TextArea = styled("textarea", sfp)<ThemeProps>(({ isDark }) => ({
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
  fontSize: 14,
  transition: "border-color 0.2s",
  resize: "vertical" as const,
  fontFamily: "inherit",
  minHeight: 120,
  background: isDark ? "#0f0a1a" : "white",
  color: isDark ? "#f3f4f6" : "#111827",
  "&:focus": {
    outline: "none",
    borderColor: "#7f56d9",
    boxShadow: "0 0 0 3px rgba(127,86,217,0.1)",
  },
  "&::placeholder": {
    color: isDark ? "#6b7280" : "#9ca3af",
  },
}));

const Select = styled("select", sfp)<ThemeProps>(({ isDark }) => ({
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
  fontSize: 14,
  background: isDark ? "#0f0a1a" : "white",
  color: isDark ? "#f3f4f6" : "#111827",
  cursor: "pointer",
  transition: "border-color 0.2s",
  width: "100%",
  "&:focus": {
    outline: "none",
    borderColor: "#7f56d9",
    boxShadow: "0 0 0 3px rgba(127,86,217,0.1)",
  },
  "& option": {
    padding: 8,
    background: isDark ? "#1e1833" : "white",
    color: isDark ? "#f3f4f6" : "#111827",
  },
}));

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const HelperText = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  fontSize: 12,
  color: isDark ? "#9ca3af" : "#6b7280",
  marginTop: 4,
}));

const ButtonContainer = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  marginTop: 32,
  paddingTop: 24,
  borderTop: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
  "@media (max-width: 640px)": {
    flexDirection: "column-reverse",
    "& button": { width: "100%" },
  },
}));

const StepsSection = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  marginTop: 32,
  paddingTop: 32,
  borderTop: `2px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
}));

const StepsHeader = styled("div")`
  margin-bottom: 20px;
`;

const StepCard = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  background: isDark ? "#0f0a1a" : "#f9fafb",
  border: `1px solid ${isDark ? "rgba(45,27,105,0.5)" : "#e5e7eb"}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
}));

const StepHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const StepNumber = styled("span")`
  font-weight: 600;
  color: #7f56d9;
  font-size: 14px;
`;

const DeleteStepButton = styled("button", sfp)<ThemeProps>(({ isDark }) => ({
  background: isDark ? "rgba(220,38,38,0.2)" : "#fee2e2",
  color: "#dc2626",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "background 0.2s",
  "&:hover": {
    background: isDark ? "rgba(220,38,38,0.3)" : "#fecaca",
  },
}));

const AddStepButton = styled("button", sfp)<ThemeProps>(({ isDark }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  padding: 12,
  background: isDark ? "rgba(45,27,105,0.15)" : "#f3f4f6",
  border: `2px dashed ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
  borderRadius: 8,
  color: isDark ? "#9ca3af" : "#6b7280",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: isDark ? "rgba(45,27,105,0.25)" : "#e5e7eb",
    borderColor: "#7f56d9",
    color: "#7f56d9",
  },
}));

const InputTypeContainer = styled("div")`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const InputTypeOption = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  "& input[type='radio']": {
    width: 18,
    height: 18,
    cursor: "pointer",
    accentColor: "#7f56d9",
  },
  "& label": {
    fontSize: 14,
    color: isDark ? "#d1d5db" : "#374151",
    cursor: "pointer",
    userSelect: "none" as const,
  },
}));

const FileUploadContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileInput = styled("input")`
  display: none;
`;

const FileUploadLabel = styled("label", sfp)<ThemeProps>(({ isDark }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: 12,
  background: isDark ? "#0f0a1a" : "#f9fafb",
  border: `2px dashed ${isDark ? "rgba(45,27,105,0.5)" : "#d1d5db"}`,
  borderRadius: 8,
  color: isDark ? "#9ca3af" : "#6b7280",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: isDark ? "rgba(45,27,105,0.15)" : "#f3f4f6",
    borderColor: "#7f56d9",
    color: "#7f56d9",
  },
  "& svg": {
    width: 20,
    height: 20,
  },
}));

const FileInfo = styled("div", sfp)<ThemeProps>(({ isDark }) => ({
  fontSize: 12,
  color: isDark ? "#9ca3af" : "#6b7280",
  marginTop: -4,
}));

const SuccessText = styled("div")`
  font-size: 12px;
  color: #10b981;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
