import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpenIcon, PlusIcon, TrashIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import * as Yup from "yup";
import { useCreateCourseMutation, type CourseStep, uploadCourseContent } from "../../services/api/coursesApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        toast.error(err?.data?.message || t("courses.failedToCreateCourse"));
      }
    },
  });

  // Handle success/error states
  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data?.message || t("courses.courseCreatedSuccess"));
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
      const response = await uploadCourseContent(file, stepType === "image" || stepType === "pdf" ? stepType : "image");
      
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
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <BookOpenIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>{t("courses.addTitle")}</Title>
          <Subtitle>{t("courses.addSubtitle")}</Subtitle>
        </Header>

        {/* Course Name */}
        <FormGroup>
          <Label htmlFor="course_name">{t("courses.courseNameLabel")}</Label>
          <Input
            id="course_name"
            name="course_name"
            placeholder={t("courses.courseNamePlaceholder")}
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
          <Label htmlFor="type">{t("courses.courseTypeLabel")}</Label>
          <Select
            id="type"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">{t("courses.selectCourseType")}</option>
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
          <Label htmlFor="tag">{t("courses.tagLabel")}</Label>
          <Input
            id="tag"
            name="tag"
            placeholder={t("courses.tagPlaceholder")}
            value={formik.values.tag}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText>
            {t("courses.tagHelper")}
          </HelperText>
          {formik.touched.tag && formik.errors.tag && (
            <ErrorText>{formik.errors.tag}</ErrorText>
          )}
        </FormGroup>

        {/* Description */}
        <FormGroup>
          <Label htmlFor="description">{t("courses.descriptionLabel")}</Label>
          <TextArea
            id="description"
            name="description"
            rows={6}
            placeholder={t("courses.descriptionPlaceholder")}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText>
            {t("courses.descriptionHelper")}
          </HelperText>
          {formik.touched.description && formik.errors.description && (
            <ErrorText>{formik.errors.description}</ErrorText>
          )}
        </FormGroup>

        {/* Course Steps Section */}
        <StepsSection>
          <StepsHeader>
            <Label>{t("courses.courseStepsLabel")}</Label>
            <HelperText>
              {t("courses.courseStepsHelper")}
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
              <StepCard key={index}>
                <StepHeader>
                  <StepNumber>Step {index + 1}</StepNumber>
                  <DeleteStepButton
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
                  <Label htmlFor={`step_title_${index}`}>Step Title (Optional)</Label>
                  <Input
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
                  <Label htmlFor={`step_type_${index}`}>Step Type *</Label>
                  <Select
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
                    <Label>Content Source *</Label>
                    <InputTypeContainer>
                      <InputTypeOption>
                        <input
                          type="radio"
                          id={`input_type_url_${index}`}
                          name={`input_type_${index}`}
                          checked={uploadState.inputType === "url"}
                          onChange={() => handleInputTypeChange(index, "url")}
                        />
                        <label htmlFor={`input_type_url_${index}`}>Enter URL</label>
                      </InputTypeOption>
                      <InputTypeOption>
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
                  <Label htmlFor={`step_content_${index}`}>
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
                      <FileUploadLabel htmlFor={`step_content_${index}`}>
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
                        <FileInfo>
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
                  <HelperText>
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
        <ButtonContainer>
          <Button
            text={t("courses.cancel")}
            onClick={() => navigate("/dashboard/courses/view")}
            disabled={isSubmitting}
          />
          <Button
            text={isSubmitting ? t("courses.creating") : t("courses.createCourseButton")}
            onClick={() => formik.handleSubmit()}
            disabled={isSubmitting}
          />
        </ButtonContainer>
      </FormContainer>
    </Container>
  );
};

export default AddCourse;

// Styled Components - theme-aware for dark mode
const Container = styled("div")`
  padding: 24px;
  min-height: 100vh;
  background: var(--theme-page-bg);
  transition: background 0.35s ease;

  @media (min-width: 640px) {
    padding: 32px;
  }

  @media (min-width: 1024px) {
    padding: 48px;
  }
`;

const FormContainer = styled("form")`
  max-width: 800px;
  margin: 0 auto;
  background: var(--theme-card-bg);
  color: var(--theme-text-primary);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid var(--theme-border);
  transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;

  @media (min-width: 640px) {
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
  color: var(--theme-text-primary);
  margin-bottom: 8px;
  transition: color 0.35s ease;

  @media (min-width: 640px) {
    font-size: 28px;
  }
`;

const Subtitle = styled("p")`
  font-size: 12px;
  color: var(--theme-text-secondary);
  margin: 0;
  transition: color 0.35s ease;

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
  color: var(--theme-text-secondary);
  transition: color 0.35s ease;
`;

const Input = styled("input")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  font-size: 14px;
  background: var(--theme-input-bg);
  color: var(--theme-text-primary);
  transition: border-color 0.2s, background 0.35s ease, color 0.35s ease;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
  }

  &::placeholder {
    color: var(--theme-text-secondary);
    opacity: 0.8;
  }
`;

const TextArea = styled("textarea")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  font-size: 14px;
  background: var(--theme-input-bg);
  color: var(--theme-text-primary);
  transition: border-color 0.2s, background 0.35s ease, color 0.35s ease;
  resize: vertical;
  font-family: inherit;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
  }

  &::placeholder {
    color: var(--theme-text-secondary);
    opacity: 0.8;
  }
`;

const Select = styled("select")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  font-size: 14px;
  background: var(--theme-input-bg);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: border-color 0.2s, background 0.35s ease, color 0.35s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
  }

  option {
    padding: 8px;
    background: var(--theme-card-bg);
    color: var(--theme-text-primary);
  }
`;

const ErrorText = styled("div")`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const HelperText = styled("div")`
  font-size: 12px;
  color: var(--theme-text-secondary);
  margin-top: 4px;
  transition: color 0.35s ease;
`;

const ButtonContainer = styled("div")`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--theme-border);
  transition: border-color 0.35s ease;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    
    button {
      width: 100%;
    }
  }
`;

const StepsSection = styled("div")`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid var(--theme-border);
  transition: border-color 0.35s ease;
`;

const StepsHeader = styled("div")`
  margin-bottom: 20px;
`;

const StepCard = styled("div")`
  background: var(--theme-table-header-bg);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: background 0.35s ease, border-color 0.35s ease;
`;

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

const DeleteStepButton = styled("button")`
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

const AddStepButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: var(--theme-table-header-bg);
  border: 2px dashed var(--theme-border);
  border-radius: 8px;
  color: var(--theme-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #7f56d9;
    color: #7f56d9;
  }
`;

const InputTypeContainer = styled("div")`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const InputTypeOption = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #7f56d9;
  }

  label {
    font-size: 14px;
    color: var(--theme-text-secondary);
    cursor: pointer;
    user-select: none;
    transition: color 0.35s ease;
  }
`;

const FileUploadContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileInput = styled("input")`
  display: none;
`;

const FileUploadLabel = styled("label")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--theme-table-header-bg);
  border: 2px dashed var(--theme-border);
  border-radius: 8px;
  color: var(--theme-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #7f56d9;
    color: #7f56d9;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FileInfo = styled("div")`
  font-size: 12px;
  color: #6b7280;
  margin-top: -4px;
`;

const SuccessText = styled("div")`
  font-size: 12px;
  color: #10b981;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
