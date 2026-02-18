import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import * as Yup from "yup";
import {
  useCreateCourseMutation,
  useUploadCourseVideoMutation,
  type CourseStep,
  type UploadedVideoMeta,
  COURSE_CATEGORIES,
} from "../../services/api/coursesApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface AddCourseFormValues {
  course_name: string;
  type: string;
  tag: string;
  description: string;
  estimated_hours: string;
  category: string;
  is_free: boolean;
  price_amount: string;
  price_currency: string;
  discount_trust_score_min: string;
  discount_percent: string;
  steps: CourseStep[];
}

const validationSchema = Yup.object({
  course_name: Yup.string()
    .min(3, "Course name must be at least 3 characters")
    .max(255, "Course name must not exceed 255 characters")
    .required("Course name is required"),
  type: Yup.string().required("Course type is required"),
  tag: Yup.string()
    .min(2, "Tag must be at least 2 characters")
    .max(100, "Tag must not exceed 100 characters")
    .required("Tag is required"),
  description: Yup.string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  estimated_hours: Yup.number()
    .min(2, "SRS: Micro-courses 2–10 hours")
    .max(10)
    .nullable()
    .transform((v) =>
      v === "" || v === undefined || isNaN(Number(v)) ? undefined : Number(v)
    )
    .optional(),
  category: Yup.string().optional(),
  is_free: Yup.boolean().required(),
  price_amount: Yup.number()
    .min(0)
    .nullable()
    .transform((v) => (v === "" || isNaN(v) ? undefined : v))
    .optional(),
  price_currency: Yup.string().optional(),
  discount_trust_score_min: Yup.number()
    .min(0)
    .nullable()
    .transform((v) => (v === "" || isNaN(v) ? undefined : v))
    .optional(),
  discount_percent: Yup.number()
    .min(0)
    .max(100)
    .nullable()
    .transform((v) => (v === "" || isNaN(v) ? undefined : v))
    .optional(),
});

const isUploadedVideo = (content: string): boolean => {
  if (!content?.trim()) return false;
  try {
    const parsed = JSON.parse(content);
    return !!parsed?.path && !!parsed?.storageType;
  } catch {
    return false;
  }
};

const VideoStepInput: React.FC<{
  step: CourseStep;
  index: number;
  steps: CourseStep[];
  setSteps: React.Dispatch<React.SetStateAction<CourseStep[]>>;
  uploadVideo: (file: File) => Promise<any>;
  isUploading: boolean;
}> = ({ step, index, steps, setSteps, uploadVideo, isUploading }) => {
  const youtubeUrl = !isUploadedVideo(step.step_content) ? step.step_content : "";
  const hasUpload = isUploadedVideo(step.step_content);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadVideo(file);
      const meta = (result as any)?.data?.data as UploadedVideoMeta;
      if (meta?.path && meta?.storageType) {
        const newSteps = [...steps];
        newSteps[index].step_content = JSON.stringify(meta);
        setSteps(newSteps);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Video upload failed");
    }
    e.target.value = "";
  };
  return (
    <VideoInputWrapper>
      <Input
        type="url"
        value={youtubeUrl}
        onChange={(e) => {
          const newSteps = [...steps];
          newSteps[index].step_content = e.target.value;
          setSteps(newSteps);
        }}
        placeholder="e.g., https://www.youtube.com/watch?v=..."
      />
      <UploadDivider>— or upload from computer —</UploadDivider>
      <UploadArea>
        <input
          type="file"
          id={`video-upload-${index}`}
          accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={isUploading}
        />
        <label htmlFor={`video-upload-${index}`}>
          <CloudArrowUpIcon className="h-6 w-6" />
          {hasUpload ? "Replace video" : isUploading ? "Uploading..." : "Choose video file"}
        </label>
      </UploadArea>
      {hasUpload && <UploadedBadge>✓ Video uploaded</UploadedBadge>}
    </VideoInputWrapper>
  );
};

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<CourseStep[]>([]);
  const [createCourse, { isLoading: isSubmitting, isSuccess, data }] =
    useCreateCourseMutation();
  const [uploadVideo, { isLoading: isUploadingVideo }] =
    useUploadCourseVideoMutation();

  const initialValues: AddCourseFormValues = {
    course_name: "",
    type: "",
    tag: "",
    description: "",
    estimated_hours: "",
    category: "",
    is_free: true,
    price_amount: "",
    price_currency: "RWF",
    discount_trust_score_min: "",
    discount_percent: "",
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
          estimated_hours: values.estimated_hours
            ? Number(values.estimated_hours)
            : undefined,
          category: values.category || undefined,
          is_free: values.is_free,
          price_amount:
            !values.is_free && values.price_amount
              ? Number(values.price_amount)
              : undefined,
          price_currency: values.price_currency || "RWF",
          discount_trust_score_min: values.discount_trust_score_min
            ? Number(values.discount_trust_score_min)
            : undefined,
          discount_percent: values.discount_percent
            ? Number(values.discount_percent)
            : undefined,
          steps:
            steps.length > 0
              ? steps.map((step, index) => ({
                  step_type: step.step_type,
                  step_content: step.step_content,
                  step_title: step.step_title || undefined,
                  step_order: index + 1,
                }))
              : undefined,
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
      // Stay on the same page instead of navigating
    }
  }, [isSuccess, data]);

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <BookOpenIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>Add Course</Title>
          <Subtitle>
            Create a new course with all the necessary details.
          </Subtitle>
        </Header>

        {/* Course Name */}
        <FormGroup>
          <Label htmlFor="course_name">Course Name *</Label>
          <Input
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
          <Label htmlFor="type">Course Type *</Label>
          <Select
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
          <Label htmlFor="tag">Tag *</Label>
          <Input
            id="tag"
            name="tag"
            placeholder="e.g., Programming, Design, Business, Marketing"
            value={formik.values.tag}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText>
            Enter a tag to categorize this course (e.g., Technology, Design,
            Business)
          </HelperText>
          {formik.touched.tag && formik.errors.tag && (
            <ErrorText>{formik.errors.tag}</ErrorText>
          )}
        </FormGroup>

        {/* Category - SRS: Trending topics Rwanda */}
        <FormGroup>
          <Label htmlFor="category">Category (Trending topics)</Label>
          <Select
            id="category"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select category</option>
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <HelperText>
            e.g. Digital Marketing, Data Entry/Analysis, CV Writing (free hook)
          </HelperText>
        </FormGroup>

        {/* Estimated hours - SRS: Micro-courses 2–10 hours */}
        <FormGroup>
          <Label htmlFor="estimated_hours">Estimated hours (2–10)</Label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            min={2}
            max={10}
            placeholder="e.g., 5"
            value={formik.values.estimated_hours}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText>Micro-courses: 2–10 hours total</HelperText>
          {formik.touched.estimated_hours && formik.errors.estimated_hours && (
            <ErrorText>{formik.errors.estimated_hours}</ErrorText>
          )}
        </FormGroup>

        {/* Pricing - SRS: Free vs paid RWF 2,000–10,000 */}
        <FormGroup>
          <Label>
            <input
              type="checkbox"
              name="is_free"
              checked={formik.values.is_free}
              onChange={(e) =>
                formik.setFieldValue("is_free", e.target.checked)
              }
            />
            <span style={{ marginLeft: 8 }}>Free course</span>
          </Label>
          <HelperText>
            Free: Digital Literacy, CV Writing. Paid: RWF 2,000–10,000 (e.g.
            Data Analysis, Digital Marketing)
          </HelperText>
        </FormGroup>

        {!formik.values.is_free && (
          <>
            <FormGroup>
              <Label htmlFor="price_amount">Price amount (RWF) *</Label>
              <Input
                id="price_amount"
                name="price_amount"
                type="number"
                min={2000}
                max={100000}
                placeholder="e.g., 5000"
                value={formik.values.price_amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.price_amount && formik.errors.price_amount && (
                <ErrorText>{formik.errors.price_amount}</ErrorText>
              )}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="discount_trust_score_min">
                Discount: TrustScore ≥ (e.g. 500)
              </Label>
              <Input
                id="discount_trust_score_min"
                name="discount_trust_score_min"
                type="number"
                min={0}
                placeholder="500"
                value={formik.values.discount_trust_score_min}
                onChange={formik.handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="discount_percent">Discount % (e.g. 50)</Label>
              <Input
                id="discount_percent"
                name="discount_percent"
                type="number"
                min={0}
                max={100}
                placeholder="50"
                value={formik.values.discount_percent}
                onChange={formik.handleChange}
              />
            </FormGroup>
          </>
        )}

        {/* Description */}
        <FormGroup>
          <Label htmlFor="description">Description (Optional)</Label>
          <TextArea
            id="description"
            name="description"
            rows={6}
            placeholder="Enter course description... (e.g., This course covers the fundamentals of web development including HTML, CSS, and JavaScript)"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <HelperText>
            Provide a detailed description of what students will learn in this
            course.
          </HelperText>
          {formik.touched.description && formik.errors.description && (
            <ErrorText>{formik.errors.description}</ErrorText>
          )}
        </FormGroup>

        {/* Course Steps Section */}
        <StepsSection>
          <StepsHeader>
            <Label>Course Steps (Optional)</Label>
            <HelperText>
              Add learning steps for this course. Each step can be a video,
              link, PDF, image, or text content.
            </HelperText>
          </StepsHeader>

          {steps.map((step, index) => (
            <StepCard key={index}>
              <StepHeader>
                <StepNumber>Step {index + 1}</StepNumber>
                <DeleteStepButton
                  type="button"
                  onClick={() => {
                    const newSteps = steps.filter((_, i) => i !== index);
                    setSteps(newSteps);
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                </DeleteStepButton>
              </StepHeader>

              <FormGroup>
                <Label htmlFor={`step_title_${index}`}>
                  Step Title (Optional)
                </Label>
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
                    newSteps[index].step_type = e.target
                      .value as CourseStep["step_type"];
                    newSteps[index].step_content = ""; // Reset content when type changes
                    setSteps(newSteps);
                  }}
                >
                  <option value="video">Video (YouTube or upload)</option>
                  <option value="quiz">Quiz</option>
                  <option value="link">Read Link</option>
                  <option value="pdf">Read PDF</option>
                  <option value="image">View Image</option>
                  <option value="text">Read Text</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor={`step_content_${index}`}>
                  {step.step_type === "video" && "Video source *"}
                  {step.step_type === "link" && "Link URL *"}
                  {step.step_type === "pdf" && "PDF URL *"}
                  {step.step_type === "image" && "Image URL *"}
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
                ) : step.step_type === "video" ? (
                  <VideoStepInput
                    step={step}
                    index={index}
                    steps={steps}
                    setSteps={setSteps}
                    uploadVideo={uploadVideo}
                    isUploading={isUploadingVideo}
                  />
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
                      step.step_type === "link"
                        ? "e.g., https://example.com/article"
                        : step.step_type === "pdf"
                        ? "e.g., https://example.com/document.pdf"
                        : "e.g., https://example.com/image.jpg"
                    }
                  />
                )}
                <HelperText>
                  {step.step_type === "video" &&
                    "Enter a YouTube URL or upload a video file (MP4, WebM, OGG, MOV)"}
                  {step.step_type === "link" && "Enter a web page URL"}
                  {step.step_type === "pdf" && "Enter a PDF document URL"}
                  {step.step_type === "image" && "Enter an image URL"}
                  {step.step_type === "text" &&
                    "Enter the text content for this step"}
                </HelperText>
              </FormGroup>
            </StepCard>
          ))}

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

// Styled Components
const Container = styled("div")`
  padding: 24px;
  min-height: 100vh;
  background: #f9fafb;

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
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

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
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
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
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
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
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
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

const ButtonContainer = styled("div")`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;

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
  border-top: 2px solid #e5e7eb;
`;

const StepsHeader = styled("div")`
  margin-bottom: 20px;
`;

const StepCard = styled("div")`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
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

const VideoInputWrapper = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UploadDivider = styled("span")`
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
`;

const UploadArea = styled("div")`
  label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f3f4f6;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #6b7280;
    transition: all 0.2s;
  }
  label:hover {
    background: #e5e7eb;
    border-color: #7f56d9;
    color: #7f56d9;
  }
`;

const UploadedBadge = styled("span")`
  font-size: 12px;
  color: #059669;
  font-weight: 500;
`;

const AddStepButton = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    border-color: #7f56d9;
    color: #7f56d9;
  }
`;
