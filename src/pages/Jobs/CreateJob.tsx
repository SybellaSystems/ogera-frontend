import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useCreateJobMutation, useUpdateJobMutation, useGetJobByIdQuery, type JobQuestion } from "../../services/api/jobsApi";
import { useGetUserProfileQuery } from "../../services/api/authApi";
import { useGetAllCategoriesQuery } from "../../services/api/jobCategoriesApi";
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
  budget: string;
  duration: string;
  duration_start: string;
  duration_end: string;
  location: string;
  description?: string;
  requirements?: string;
  skills?: string;
  employment_type?: string;
  experience_level?: string;
  status?: "Pending" | "Active" | "Inactive" | "Completed";
  employer_id?: string; // For superadmin only
}

const renderLabel = (text: string) => {
  if (!text.includes("*")) return text;
  const labelText = text.replaceAll("*", "").trim();
  return (
    <>
      {labelText} <RequiredMark>*</RequiredMark>
    </>
  );
};

const CreateJob: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useSelector((state: any) => state.auth.role);
  const [durationStart, setDurationStart] = useState("");
  const [durationEnd, setDurationEnd] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);

  const validationSchema = Yup.object({
    job_title: Yup.string()
      .min(3, t("pages.jobs.validationJobTitleMin"))
      .max(255, t("pages.jobs.validationJobTitleMax"))
      .required(t("pages.jobs.validationJobTitleRequired")),
    category: Yup.string()
      .required(t("pages.jobs.validationCategoryRequired"))
      .test("not-empty", t("pages.jobs.pleaseSelectCategory"), (value) => value !== "" && value !== undefined),
    budget: Yup.string()
      .required(t("pages.jobs.validationBudgetRequired"))
      .matches(/^\d{1,10}$/, t("pages.jobs.validationBudgetNumbersOnlyMax10"))
      .test("positive", t("pages.jobs.validationBudgetPositive"), (value) => {
        if (!value) return false;
        const n = Number(value);
        return Number.isFinite(n) && n > 0;
      }),
    duration_start: Yup.string().required(t("pages.jobs.validationDurationStartRequired")),
    duration_end: Yup.string()
      .required(t("pages.jobs.validationDurationEndRequired"))
      .test("end-after-start", t("pages.jobs.validationDurationEndAfterStart"), function (value) {
        const start = this.parent.duration_start as string | undefined;
        if (!start || !value) return true;
        // Compare date strings (YYYY-MM-DD). Lexicographic compare works.
        return value >= start;
      }),
    duration: Yup.string()
      .min(2, t("pages.jobs.validationDurationMin"))
      .max(100, t("pages.jobs.validationDurationMax"))
      .required(t("pages.jobs.validationDurationRequired")),
    location: Yup.string()
      .min(2, t("pages.jobs.validationLocationMin"))
      .max(15, t("pages.jobs.validationLocationMax15"))
      .matches(/^[A-Za-z\s]+$/, t("pages.jobs.validationLocationLettersOnly"))
      .required(t("pages.jobs.validationLocationRequired")),
    description: Yup.string().optional(),
    requirements: Yup.string().optional(),
    skills: Yup.string().optional(),
    employment_type: Yup.string().optional(),
    experience_level: Yup.string().optional(),
    status: Yup.string()
      .oneOf(["Pending", "Active", "Inactive", "Completed"], t("pages.jobs.validationInvalidStatus"))
      .optional(),
  });
  useGetUserProfileQuery(undefined);
  const { data: categoriesResponse, isLoading: isLoadingCategories, isError: isCategoriesError } = useGetAllCategoriesQuery();
  const isEditMode = !!id;

  // Fetch job data if editing
  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id || "", {
    skip: !isEditMode,
  });

  const categories = categoriesResponse?.data || [];

  const [createJob, { isLoading: isCreating, isError: isCreateError, error: createError, isSuccess: isCreateSuccess, data: createData }] =
    useCreateJobMutation();
  
  const [updateJob, { isLoading: isUpdating, isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess, data: updateData }] =
    useUpdateJobMutation();

  const job = jobData?.data;
  const [questions, setQuestions] = useState<JobQuestion[]>([]);

  const initialValues: CreateJobFormValues = {
    job_title: job?.job_title || "",
    category: job?.category || "",
    budget: job?.budget != null ? String(job.budget) : "",
    duration: job?.duration || "",
    duration_start: "",
    duration_end: "",
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
        // Additional validation: ensure category is selected
        if (!values.category || values.category.trim() === "") {
          formik.setFieldError("category", t("pages.jobs.pleaseSelectCategory"));
          formik.setFieldTouched("category", true);
          toast.error(t("pages.jobs.categoryRequiredToast"));
          return;
        }

        // Ensure categories are available
        if (categories.length === 0) {
          toast.error(t("pages.jobs.noCategoriesCreateFirst"));
          return;
        }

        // Verify selected category exists in the available categories
        const categoryExists = categories.some((c: any) => c.name === values.category.trim());
        if (!categoryExists) {
          formik.setFieldError("category", t("pages.jobs.selectedCategoryUnavailable"));
          toast.error(t("pages.jobs.selectAnotherCategory"));
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
        budget: job.budget != null ? String(job.budget) : "",
        duration: job.duration || "",
        duration_start: "",
        duration_end: "",
        location: job.location || "",
        description: job.description || "",
        requirements: job.requirements || "",
        skills: job.skills || "",
        employment_type: job.employment_type || "",
        experience_level: job.experience_level || "",
        status: job.status || "Active",
        employer_id: "",
      });

      // Populate duration start/end if the stored duration contains a range.
      // Expected formats we support loosely: "start - end" or "start to end".
      const rawDuration = (job.duration || "").trim();
      const parts = rawDuration.includes(" - ")
        ? rawDuration.split(" - ")
        : rawDuration.toLowerCase().includes(" to ")
          ? rawDuration.split(/ to /i)
          : [];
      if (parts.length === 2) {
        setDurationStart(parts[0].trim());
        setDurationEnd(parts[1].trim());
        formik.setFieldValue("duration_start", parts[0].trim());
        formik.setFieldValue("duration_end", parts[1].trim());
      }
      // Populate skills chips (comma separated string)
      const rawSkills = (job.skills || "").trim();
      if (rawSkills) {
        const nextSkills = rawSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setSkillsList(Array.from(new Set(nextSkills)));
      }

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
        err?.data?.error || err?.data?.message || (isEditMode ? t("pages.jobs.failedToUpdateJob") : t("pages.jobs.failedToCreateJob"))
      );
    }
  }, [isCreateError, createError, isUpdateError, updateError, isEditMode, t]);

  useEffect(() => {
    const data = isCreateSuccess ? createData : updateData;
    const isSuccess = isCreateSuccess || isUpdateSuccess;
    if (data && isSuccess) {
      toast.success(data?.message || (isEditMode ? t("pages.jobs.jobUpdatedSuccess") : t("pages.jobs.jobCreatedSuccess")));
      if (!isEditMode) {
        resetForm();
      }
      navigate("/dashboard/jobs/unfunded");
    }
  }, [isCreateSuccess, createData, isUpdateSuccess, updateData, isEditMode, resetForm, navigate, t]);

  const syncSkillsToFormik = (next: string[]) => {
    setSkillsList(next);
    formik.setFieldValue("skills", next.join(", "));
  };

  const addSkill = (raw: string) => {
    const skill = raw.trim();
    if (!skill) return;
    const exists = skillsList.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (exists) return;
    syncSkillsToFormik([...skillsList, skill]);
  };

  const removeSkill = (skill: string) => {
    syncSkillsToFormik(skillsList.filter((s) => s !== skill));
  };

  return (
    <Container>
      <FormContainer onSubmit={formik.handleSubmit}>
        <Header>
          <IconWrapper>
            <BriefcaseIcon className="h-8 w-8 text-purple-600" />
          </IconWrapper>
          <Title>{isEditMode ? t("pages.jobs.editJob") : t("pages.jobs.createJob")}</Title>
          <Subtitle>
            {isEditMode ? t("pages.jobs.editJobSubtitle") : t("pages.jobs.createJobSubtitle")} {role === "employer" ? t("pages.jobs.createJobEmployerNote") : t("pages.jobs.createJobSuperadminNote")}
          </Subtitle>
        </Header>

        {/* Employer ID - Only for superadmin */}
        {role === "superadmin" && (
          <FormGroup>
            <Label htmlFor="employer_id">{renderLabel(t("pages.jobs.employerIdOptional"))}</Label>
            <Input
              id="employer_id"
              name="employer_id"
              placeholder={t("pages.jobs.employerIdPlaceholder")}
              value={formik.values.employer_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <HelperText>
              {t("pages.jobs.employerIdHelper")}
            </HelperText>
          </FormGroup>
        )}

        {/* Job Title */}
        <FormGroup>
          <Label htmlFor="job_title">{renderLabel(t("pages.jobs.jobTitleLabel"))}</Label>
          <Input
            id="job_title"
            name="job_title"
            placeholder={t("pages.jobs.jobTitlePlaceholder")}
            value={formik.values.job_title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.job_title && formik.errors.job_title && (
            <ErrorText>{formik.errors.job_title}</ErrorText>
          )}
        </FormGroup>

        <InputRow>
          {/* Category */}
          <FormGroup>
          <Label htmlFor="category">
            {renderLabel(t("pages.jobs.categoryLabel"))}
          </Label>
          {isLoadingCategories ? (
            <div>
              <Select id="category" name="category" disabled>
                <option value="">{t("pages.jobs.loadingCategories")}</option>
              </Select>
              <HelperText>{t("pages.jobs.pleaseWaitCategories")}</HelperText>
            </div>
          ) : isCategoriesError ? (
            <div>
              <Select id="category" name="category" disabled>
                <option value="">{t("pages.jobs.errorLoadingCategories")}</option>
              </Select>
              <ErrorText>{t("pages.jobs.failedToLoadCategories")}</ErrorText>
            </div>
          ) : categories.length === 0 ? (
            <div>
              <Select id="category" name="category" disabled style={{background: '#fef2f2', borderColor: '#fca5a5'}}>
                <option value="">{t("pages.jobs.noCategoriesAvailable")}</option>
              </Select>
              <ErrorText>
                {t("pages.jobs.noCategoriesCreateFirst")}
              </ErrorText>
              <HelperText>
                {t("pages.jobs.onlySuperadminCreateCategories")}
              </HelperText>
            </div>
          ) : (
            <div>
              <Select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={(e) => {
                  formik.handleChange(e);
                  if (formik.errors.category) {
                    formik.setFieldTouched("category", true);
                  }
                }}
                onBlur={formik.handleBlur}
                required
                aria-required="true"
                aria-describedby={formik.errors.category ? "category-error" : undefined}
              >
                <option value="">{t("pages.jobs.selectCategory")}</option>
                {categories.map((category: any) => (
                  <option key={category.category_id} value={category.name}>
                    {category.icon || "💼"} {category.name}
                  </option>
                ))}
              </Select>
              {formik.touched.category && formik.errors.category && (
                <ErrorText id="category-error" role="alert">
                   {formik.errors.category}
                </ErrorText>
              )}
              {!formik.errors.category && formik.values.category && (
                <HelperText style={{color: '#16a34a', fontWeight: 500}}>
                  {t("pages.jobs.categorySelected")}
                </HelperText>
              )}
              <HelperText>
                {t("pages.jobs.selectCategoryHelper")}
              </HelperText>
            </div>
          )}
          </FormGroup>

          {/* Budget (moved next to Category) */}
          <FormGroup>
            <Label htmlFor="budget">{renderLabel(t("pages.jobs.budgetLabel"))}</Label>
            <Input
              id="budget"
              name="budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={t("pages.jobs.budgetPlaceholder")}
              value={formik.values.budget}
              onChange={(e) => {
                // Only allow digits (no alphabets/symbols)
                const digitsOnly = e.target.value.replace(/[^\d]/g, "").slice(0, 10);
                formik.setFieldValue("budget", digitsOnly);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.budget && formik.errors.budget && (
              <ErrorText>{formik.errors.budget}</ErrorText>
            )}
          </FormGroup>
        </InputRow>

        {/* Duration (moved below Category+Budget) */}
        <FormGroup>
          <Label>{renderLabel(t("pages.jobs.durationLabel"))}</Label>
          <DurationGrid>
            <div>
              <DurationLabel htmlFor="duration_start">Start</DurationLabel>
              <Input
                id="duration_start"
                name="duration_start"
                type="date"
                value={durationStart}
                onChange={(e) => {
                  const next = e.target.value;
                  setDurationStart(next);
                  formik.setFieldValue("duration_start", next);
                  const durationString = next && durationEnd ? `${next} - ${durationEnd}` : next || durationEnd;
                  formik.setFieldValue("duration", durationString || "");
                }}
                onBlur={() => {
                  formik.setFieldTouched("duration", true);
                  formik.setFieldTouched("duration_start", true);
                }}
              />
              {formik.touched.duration_start && formik.errors.duration_start && (
                <ErrorText>{formik.errors.duration_start}</ErrorText>
              )}
            </div>
            <div>
              <DurationLabel htmlFor="duration_end">End</DurationLabel>
              <Input
                id="duration_end"
                name="duration_end"
                type="date"
                value={durationEnd}
                onChange={(e) => {
                  const next = e.target.value;
                  setDurationEnd(next);
                  formik.setFieldValue("duration_end", next);
                  const durationString = durationStart && next ? `${durationStart} - ${next}` : durationStart || next;
                  formik.setFieldValue("duration", durationString || "");
                }}
                onBlur={() => {
                  formik.setFieldTouched("duration", true);
                  formik.setFieldTouched("duration_end", true);
                }}
              />
              {formik.touched.duration_end && formik.errors.duration_end && (
                <ErrorText>{formik.errors.duration_end}</ErrorText>
              )}
            </div>
          </DurationGrid>
          {formik.touched.duration && formik.errors.duration && (
            <ErrorText>{formik.errors.duration}</ErrorText>
          )}
        </FormGroup>

        {/* Status - Only for superadmin */}
        {role === "superadmin" && (
          <FormGroup>
            <Label htmlFor="status">{renderLabel(t("pages.jobs.statusLabel"))}</Label>
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

        {/* Location */}
        <FormGroup>
          <Label htmlFor="location">{renderLabel(t("pages.jobs.locationLabel"))}</Label>
          <Input
            id="location"
            name="location"
            placeholder={t("pages.jobs.locationPlaceholder")}
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
          <Label htmlFor="description">{renderLabel(t("pages.jobs.descriptionOptional"))}</Label>
          <TextArea
            id="description"
            name="description"
            rows={4}
            placeholder={t("pages.jobs.descriptionPlaceholder")}
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
          <Label htmlFor="requirements">{renderLabel(t("pages.jobs.requirementsOptional"))}</Label>
          <TextArea
            id="requirements"
            name="requirements"
            rows={3}
            placeholder={t("pages.jobs.requirementsPlaceholder")}
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
          <Label htmlFor="skills">{renderLabel(t("pages.jobs.skillsOptional"))}</Label>
          <SkillsWrapper>
            <SkillsChips>
              {skillsList.map((s) => (
                <SkillChip key={s}>
                  <ChipDot />
                  <span>{s}</span>
                  <ChipRemove type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                    ×
                  </ChipRemove>
                </SkillChip>
              ))}
              <SkillInput
                id="skills"
                name="skills"
                placeholder={skillsList.length ? "" : t("pages.jobs.skillsPlaceholder")}
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onBlur={() => {
                  formik.setFieldTouched("skills", true);
                  if (skillsInput.trim()) {
                    addSkill(skillsInput);
                    setSkillsInput("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSkill(skillsInput);
                    setSkillsInput("");
                  }
                  if (e.key === "Backspace" && !skillsInput && skillsList.length > 0) {
                    removeSkill(skillsList[skillsList.length - 1]);
                  }
                }}
              />
            </SkillsChips>
          </SkillsWrapper>
          {formik.touched.skills && formik.errors.skills && (
            <ErrorText>{formik.errors.skills}</ErrorText>
          )}
        </FormGroup>

        {/* Employment Type */}
                <InputRow>
        <FormGroup>
          <Label htmlFor="employment_type">{renderLabel(t("pages.jobs.employmentTypeOptional"))}</Label>
          <Select
            id="employment_type"
            name="employment_type"
            value={formik.values.employment_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">{t("pages.jobs.selectEmploymentType")}</option>
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
          <Label htmlFor="experience_level">{renderLabel(t("pages.jobs.experienceLevelOptional"))}</Label>
          <Select
            id="experience_level"
            name="experience_level"
            value={formik.values.experience_level}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">{t("pages.jobs.selectExperienceLevel")}</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
            <option value="Executive">Executive</option>
          </Select>
          {formik.touched.experience_level && formik.errors.experience_level && (
            <ErrorText>{formik.errors.experience_level}</ErrorText>
          )}
        </FormGroup>
                </InputRow>

        {/* Questions Section */}
        <QuestionsSection>
          <QuestionsHeader>
            <Label>{renderLabel(t("pages.jobs.applicationQuestionsOptional"))}</Label>
            <HelperText>
              {t("pages.jobs.applicationQuestionsHelper")}
            </HelperText>
          </QuestionsHeader>
          
          {questions.map((question, index) => (
            <QuestionCard key={index}>
              <QuestionHeader>
                <QuestionNumber>{t("pages.jobs.questionNumber", { number: index + 1 })}</QuestionNumber>
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
                <Label htmlFor={`question_text_${index}`}>{renderLabel(t("pages.jobs.questionText"))}</Label>
                <Input
                  id={`question_text_${index}`}
                  value={question.question_text}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].question_text = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder={t("pages.jobs.questionTextPlaceholder")}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor={`question_type_${index}`}>{renderLabel(t("pages.jobs.questionType"))}</Label>
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
                    {renderLabel(t("pages.jobs.optionsCommaSeparated"))}
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
                    placeholder={t("pages.jobs.optionsPlaceholder")}
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
                    {t("pages.jobs.requiredQuestion")}
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
            {t("pages.jobs.addQuestion")}
          </AddQuestionButton>
        </QuestionsSection>

       <ActionContainer>
        <Button
          backgroundcolor="#7f56d9"
          type="submit"
          text={isCreating || isUpdating ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Job" : "Create Job")}
          disabled={isCreating || isUpdating || isLoadingJob || isLoadingCategories || categories.length === 0 || isCategoriesError}
        />
        </ActionContainer>
      </FormContainer>
    </Container>
  );
};

export default CreateJob;

const ActionContainer = styled("div")`
  margin-top: 40px; /* Adjust this value to slide it further down */
  display: flex;
  justify-content: flex-end; /* Optional: Aligns button to the right for a dashboard look */
  padding-bottom: 20px;
`;

const Container = styled("div")`
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 16px;
  background: var(--theme-page-bg);
  transition: background 0.35s ease;

  @media (min-width: 640px) {
    padding: 40px 20px;
  }
`;

const FormContainer = styled("form")`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: var(--theme-card-bg);
  color: var(--theme-text-primary);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;

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
  font-weight: 650;
  color: var(--theme-text-primary);
  transition: color 0.35s ease;
`;

const RequiredMark = styled("span")`
  color: #ef4444;
  font-weight: 800;
`;

// Change: Add a grid helper for side-by-side inputs
const InputRow = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns */
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack on mobile */
  }
`;

const Input = styled("input")`
  height: 40px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(100, 116, 139, 0.7);
  font-size: 14px;
  background: var(--theme-input-bg);
  color: var(--theme-text-primary);
  transition: border-color 0.2s, background 0.35s ease, color 0.35s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.18);
  }

  &::placeholder {
    color: var(--theme-text-secondary);
    opacity: 0.8;
  }
`;

const TextArea = styled("textarea")`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(100, 116, 139, 0.7);
  font-size: 14px;
  background: var(--theme-input-bg);
  color: var(--theme-text-primary);
  transition: border-color 0.2s, background 0.35s ease, color 0.35s ease;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.18);
  }

  &::placeholder {
    color: var(--theme-text-secondary);
    opacity: 0.8;
  }
`;

const Select = styled("select")`
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(100, 116, 139, 0.7);
  font-size: 14px;
  background: var(--theme-input-bg);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: border-color 0.2s, background 0.35s ease, color 0.35s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.18);
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

const DurationGrid = styled("div")`
  display: flex;
  gap: 0px;
  margin-top: -2px;
  max-width: 520px;

  & > div {
    flex: 1 1 0;
    min-width: 0;
  }

  /* Visually join start/end inputs (no gap, no double border). */
  & > div:first-of-type input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  & > div:last-of-type input {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
  }
`;

const DurationLabel = styled("label")`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--theme-text-secondary);
  margin-bottom: 4px;
`;

const SkillsWrapper = styled("div")`
  border: 1px solid rgba(100, 116, 139, 0.7);
  background: var(--theme-input-bg);
  border-radius: 8px;
  padding: 8px 10px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #7f56d9;
    box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.18);
  }
`;

const SkillsChips = styled("div")`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const SkillChip = styled("span")`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(124, 58, 237, 0.10);
  border: 1px solid rgba(124, 58, 237, 0.25);
  color: var(--theme-text-primary);
  border-radius: 999px;
  font-size: 13px;
  line-height: 1;
`;

const ChipDot = styled("span")`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7c3aed;
  display: inline-block;
`;

const ChipRemove = styled("button")`
  border: none;
  background: transparent;
  color: rgba(100, 116, 139, 0.9);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;

  &:hover {
    color: #ef4444;
  }
`;

const SkillInput = styled("input")`
  border: none;
  outline: none;
  background: transparent;
  color: var(--theme-text-primary);
  font-size: 14px;
  min-width: 180px;
  height: 30px;

  &::placeholder {
    color: var(--theme-text-secondary);
    opacity: 0.8;
  }
`;

const QuestionsSection = styled("div")`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid var(--theme-border);
  transition: border-color 0.35s ease;
`;

const QuestionsHeader = styled("div")`
  margin-bottom: 20px;
`;

const QuestionCard = styled("div")`
  background: var(--theme-table-header-bg);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: background 0.35s ease, border-color 0.35s ease;
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
  background: var(--theme-table-header-bg);
  border: 2px dashed var(--theme-border);
  border-radius: 8px;
  color: var(--theme-text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    border-color: #7f56d9;
    color: #7f56d9;
  }
`;

