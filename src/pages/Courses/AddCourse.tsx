import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpenIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { styled } from "@mui/material/styles";
import Button from "../../components/button";
import * as Yup from "yup";
import { useCreateCourseMutation, type CourseStep } from "../../services/api/coursesApi";
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

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<CourseStep[]>([]);
  const [createCourse, { isLoading: isSubmitting, isSuccess, data }] = useCreateCourseMutation();

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
          <Subtitle>Create a new course with all the necessary details.</Subtitle>
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
            Enter a tag to categorize this course (e.g., Technology, Design, Business)
          </HelperText>
          {formik.touched.tag && formik.errors.tag && (
            <ErrorText>{formik.errors.tag}</ErrorText>
          )}
        </FormGroup>

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
            Provide a detailed description of what students will learn in this course.
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
              Add learning steps for this course. Each step can be a video, link, PDF, image, or text content.
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
                  }}
                >
                  <option value="video">Watch YouTube Video</option>
                  <option value="link">Read Link</option>
                  <option value="pdf">Read PDF</option>
                  <option value="image">View Image</option>
                  <option value="text">Read Text</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor={`step_content_${index}`}>
                  {step.step_type === "video" && "YouTube Video URL *"}
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
                  {step.step_type === "pdf" && "Enter a PDF document URL"}
                  {step.step_type === "image" && "Enter an image URL"}
                  {step.step_type === "text" && "Enter the text content for this step"}
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
