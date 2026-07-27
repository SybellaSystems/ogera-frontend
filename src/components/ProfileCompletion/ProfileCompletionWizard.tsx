import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import {
  XMarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  DocumentTextIcon,
  SparklesIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentIcon,
  EnvelopeIcon,
  PhoneIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  useGetFullProfileQuery,
  useUpdateExtendedProfileMutation,
  useAddBulkSkillsMutation,
  useAddEducationMutation,
  useAddEmploymentMutation,
} from "../../services/api/extendedProfileApi";
import { useResendVerificationEmailMutation } from "../../services/api/authApi";
import { uploadProfileImage } from "../../services/api/profileImageApi";
import { uploadResume } from "../../services/api/resumeApi";
import { updateUserProfile } from "../../services/api/profileApi";
import { useCalculateTrustScoreMutation } from "../../services/api/trustScoreApi";

import { getUserProfile } from "../../services/api/profileApi";
import toast from "react-hot-toast";

interface WizardStep {
  field: string;
  title: string;
  description: string;
  icon: string;
}

interface ProfileCompletionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  camera: CameraIcon,
  "document-text": DocumentTextIcon,
  sparkles: SparklesIcon,
  "academic-cap": AcademicCapIcon,
  briefcase: BriefcaseIcon,
  document: DocumentIcon,
  mail: EnvelopeIcon,
  phone: PhoneIcon,
};

const ALL_STUDENT_STEPS: WizardStep[] = [
  {
    field: "profile_image",
    title: "Add a Profile Photo",
    description: "A profile photo makes you 3x more likely to be noticed.",
    icon: "camera",
  },
  {
    field: "bio",
    title: "Write a Bio",
    description: "Tell employers about yourself (minimum 20 characters).",
    icon: "document-text",
  },
  {
    field: "skills",
    title: "Add Your Skills",
    description: "Add at least 3 key skills to stand out.",
    icon: "sparkles",
  },
  {
    field: "education",
    title: "Add Education",
    description:
      "Your education background helps employers understand your qualifications.",
    icon: "academic-cap",
  },
  {
    field: "employment",
    title: "Add Work Experience",
    description: "Share your work history to strengthen your profile.",
    icon: "briefcase",
  },
  {
    field: "resume",
    title: "Upload Your Resume",
    description: "A resume makes applications faster and easier.",
    icon: "document",
  },
  {
    field: "email_verified",
    title: "Verify Your Email",
    description: "Verified emails build trust with employers.",
    icon: "mail",
  },
  {
    field: "phone_verified",
    title: "Verify Your Phone",
    description: "A verified phone number adds credibility.",
    icon: "phone",
  },
];

const ALL_EMPLOYER_STEPS: WizardStep[] = [
  {
    field: "profile_image",
    title: "Add a Company Logo",
    description: "A logo makes your company more recognizable.",
    icon: "camera",
  },
  {
    field: "bio",
    title: "Write a Company Description",
    description: "Describe your company (minimum 20 characters).",
    icon: "document-text",
  },
  {
    field: "email_verified",
    title: "Verify Your Email",
    description: "Verified email builds trust with students.",
    icon: "mail",
  },
  {
    field: "phone_verified",
    title: "Verify Your Phone",
    description: "A verified phone adds credibility.",
    icon: "phone",
  },
];

const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const roleRaw = useSelector((state: any) => state.auth.role);
  const role = roleRaw ? String(roleRaw).toLowerCase().trim() : "student";

  const { data: fullProfileData, refetch: refetchFullProfile } =
    useGetFullProfileQuery();
  const [updateExtendedProfile] = useUpdateExtendedProfileMutation();
  const [addBulkSkills] = useAddBulkSkillsMutation();
  const [addEducation] = useAddEducationMutation();
  const [addEmployment] = useAddEmploymentMutation();
  const [calculateTrustScore] = useCalculateTrustScoreMutation();

  const [resendVerificationEmail] = useResendVerificationEmailMutation();

  const [profileData, setProfileData] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState("");
  const [bioError, setBioError] = useState("");
  const [skills, setSkills] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [educationForm, setEducationForm] = useState({
    institution_name: "",
    degree: "",
    field_of_study: "",
    start_year: new Date().getFullYear(),
    end_year: undefined as number | undefined,
    is_current: true,
    description: "",
  });
  const [educationErrors, setEducationErrors] = useState({
    institution_name: "",
    degree: "",
    start_year: "",
    end_year: "",
  });

  const [employmentForm, setEmploymentForm] = useState({
    company_name: "",
    job_title: "",
    employment_type: "full_time" as
      | "full_time"
      | "part_time"
      | "contract"
      | "internship"
      | "freelance",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });
  const [employmentErrors, setEmploymentErrors] = useState({
    company_name: "",
    job_title: "",
    start_date: "",
    end_date: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      getUserProfile()
        .then((res) => setProfileData(res.data))
        .catch(() => {});
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const getMissingSteps = (): WizardStep[] => {
    if (!profileData) return [];

    const allSteps =
      role === "employer" ? ALL_EMPLOYER_STEPS : ALL_STUDENT_STEPS;
    const allSkills = fullProfileData?.data?.skills || [];
    const keySkills = allSkills.filter(
      (s: any) => s.skill_type === "key_skill",
    );
    const educations = fullProfileData?.data?.educations || [];
    const employments = fullProfileData?.data?.employments || [];

    return allSteps.filter((step) => {
      switch (step.field) {
        case "profile_image":
          return !profileData.profile_image_url;
        case "bio":
          return (
            !fullProfileData?.data?.extendedProfile?.profile_summary ||
            fullProfileData.data.extendedProfile.profile_summary.trim()
              .length <= 20
          );
        case "skills":
          return keySkills.length < 3;
        case "education":
          return educations.length < 1;
        case "employment":
          return employments.length < 1;
        case "resume":
          return !profileData.resume_url;
        case "email_verified":
          return !profileData.email_verified;
        case "phone_verified":
          return !profileData.phone_verified;
        default:
          return false;
      }
    });
  };

  const wizardSteps = getMissingSteps();
  const currentStep = wizardSteps[currentStepIndex];
  const totalSteps = wizardSteps.length;

  if (!isOpen || !profileData || totalSteps === 0) {
    return null;
  }

  const refreshData = async () => {
    try {
      const res = await getUserProfile();
      setProfileData(res.data);
      await refetchFullProfile();
    } catch {
      // silently fail
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (currentStep) {
        switch (currentStep.field) {
          case "profile_image":
            if (profileImageFile) {
              const result = await uploadProfileImage(profileImageFile);
              const newUrl = result?.data?.profile_image_url;
              if (newUrl && user && accessToken && role) {
                const cacheBustedUrl = `${newUrl}?t=${Date.now()}`;
                dispatch(
                  setCredentials({
                    user: { ...user, profile_image_url: cacheBustedUrl },
                    accessToken,
                    role,
                  }),
                );
              }
              toast.success("Profile image updated!");
            }
            break;
          case "bio":
            if (bio.trim().length > 20) {
              setBioError("");

              await updateExtendedProfile({
                profile_summary: bio,
              }).unwrap();

              toast.success("Bio updated!");
            } else {
              setBioError("Bio must be at least 20 characters");
              setIsSubmitting(false);
              return; 
            }
            break;
          case "skills": {
            const skillNames = skills
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);

            if (skillNames.length >= 3) {
              setSkillsError("");

              const skillsArray = skillNames.map((name) => ({
                skill_name: name,
                skill_type: "key_skill" as const,
              }));

              await addBulkSkills({ skills: skillsArray }).unwrap();
              toast.success("Skills added!");
            } else {
              setSkillsError("Please add at least 3 skills");
              setIsSubmitting(false);
              return;
            }

            break;
          }
          case "education": {
            const currentYear = new Date().getFullYear();

            const errors = {
              institution_name: "",
              degree: "",
              start_year: "",
              end_year: "",
            };

            if (!educationForm.institution_name.trim()) {
              errors.institution_name = "Institution name is required";
            }

            if (!educationForm.degree.trim()) {
              errors.degree = "Degree is required";
            }

            if (!educationForm.start_year) {
              errors.start_year = "Start year is required";
            } else if (educationForm.start_year > currentYear) {
              errors.start_year =
                "Start year cannot be greater than the current year";
            }

            if (
              educationForm.end_year &&
              educationForm.end_year < educationForm.start_year
            ) {
              errors.end_year =
                "End year cannot be earlier than the start year";
            }

            setEducationErrors(errors);

            if (Object.values(errors).some((error) => error !== "")) {
              setIsSubmitting(false);
              return;
            }

            await addEducation(educationForm).unwrap();
            toast.success("Education added!");
            break;
          }
          case "employment": {
            const today = new Date().toISOString().split("T")[0];

            const errors = {
              company_name: "",
              job_title: "",
              start_date: "",
              end_date: "",
            };

            if (!employmentForm.company_name.trim()) {
              errors.company_name = "Company name is required";
            }

            if (!employmentForm.job_title.trim()) {
              errors.job_title = "Job title is required";
            }

            if (!employmentForm.start_date) {
              errors.start_date = "Joining date is required";
            } else if (employmentForm.start_date > today) {
              errors.start_date = "Joining date cannot be in the future";
            }

            if (!employmentForm.is_current && employmentForm.end_date) {
              if (employmentForm.end_date > today) {
                errors.end_date = "End date cannot be in the future";
              } else if (employmentForm.end_date < employmentForm.start_date) {
                errors.end_date = "End date cannot be earlier than join date";
              }
            }

            setEmploymentErrors(errors);

            if (Object.values(errors).some((error) => error !== "")) {
              setIsSubmitting(false);
              return;
            }

            await addEmployment(employmentForm).unwrap();
            toast.success("Employment added!");
            break;
          }
          case "email_verified":
            await resendVerificationEmail(profileData.email).unwrap();
            toast.success("Verification email sent. Please check your inbox.");
            break;

          default:
            break;
        }
      }

      await refreshData();

      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        toast.success("Profile completed! Check your achievements!");
        onComplete?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    toast.success("Image selected! Click Next to save.");
  };

  // const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   try {
  //     setIsSubmitting(true);
  //     await uploadResume(file);
  //     toast.success("Resume uploaded!");
  //     await refreshData();
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message || "Failed to upload resume");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setIsSubmitting(true);

      const response = await uploadResume(file);

      if (response?.data?.resume_url) {
        await updateUserProfile({
          resume_url: response.data.resume_url,
        });

        if (profileData?.user_id) {
          await calculateTrustScore(profileData.user_id).unwrap();
        }
      }

      toast.success("Resume uploaded successfully!");

      await refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = currentStep
    ? stepIcons[currentStep.icon] || CheckCircleIcon
    : CheckCircleIcon;

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.field) {
      case "profile_image":
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#f5f3ff]"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-300">
                  <CameraIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-[#f5f3ff] text-[#7f56d9] rounded-lg hover:bg-[#b794f4] transition-colors flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Upload Photo
              </button>
            </div>
          </div>
        );

      case "bio":
        return (
          <div className="space-y-2">
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);

                if (bioError) {
                  setBioError("");
                }
              }}
              placeholder="Tell us about yourself... (minimum 20 characters)"
              rows={5}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none resize-none ${
                bioError ? "border-red-500" : "border-gray-300"
              }`}
            />

            {bioError && <p className="text-sm text-red-500">{bioError}</p>}

            <p className="text-sm text-gray-500">
              {bio.length}/20 characters minimum
            </p>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-2">
            <textarea
              value={skills}
              onChange={(e) => {
                setSkills(e.target.value);

                if (skillsError) {
                  setSkillsError("");
                }
              }}
              placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Node.js)"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none resize-none ${
                skillsError ? "border-red-500" : "border-gray-300"
              }`}
            />

            {skillsError && (
              <p className="text-sm text-red-500">{skillsError}</p>
            )}

            <p className="text-sm text-gray-500">
              {skills.split(",").filter((s) => s.trim()).length}
              /3 skills minimum
            </p>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            {/* Institution */}
            <div>
              <input
                type="text"
                value={educationForm.institution_name}
                onChange={(e) => {
                  setEducationForm({
                    ...educationForm,
                    institution_name: e.target.value,
                  });

                  if (educationErrors.institution_name) {
                    setEducationErrors({
                      ...educationErrors,
                      institution_name: "",
                    });
                  }
                }}
                placeholder="Institution Name *"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                  educationErrors.institution_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {educationErrors.institution_name && (
                <p className="mt-1 text-sm text-red-500">
                  {educationErrors.institution_name}
                </p>
              )}
            </div>

            {/* Degree */}
            <div>
              <input
                type="text"
                value={educationForm.degree}
                onChange={(e) => {
                  setEducationForm({
                    ...educationForm,
                    degree: e.target.value,
                  });

                  if (educationErrors.degree) {
                    setEducationErrors({
                      ...educationErrors,
                      degree: "",
                    });
                  }
                }}
                placeholder="Degree *"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                  educationErrors.degree ? "border-red-500" : "border-gray-300"
                }`}
              />
              {educationErrors.degree && (
                <p className="mt-1 text-sm text-red-500">
                  {educationErrors.degree}
                </p>
              )}
            </div>

            {/* Field of Study */}
            <input
              type="text"
              value={educationForm.field_of_study}
              onChange={(e) =>
                setEducationForm({
                  ...educationForm,
                  field_of_study: e.target.value,
                })
              }
              placeholder="Field of Study"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Start Year */}
              <div>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={educationForm.start_year}
                  onChange={(e) => {
                    setEducationForm({
                      ...educationForm,
                      start_year: parseInt(e.target.value) || 0,
                    });

                    if (educationErrors.start_year) {
                      setEducationErrors({
                        ...educationErrors,
                        start_year: "",
                      });
                    }
                  }}
                  placeholder="Start Year"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                    educationErrors.start_year
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {educationErrors.start_year && (
                  <p className="mt-1 text-sm text-red-500">
                    {educationErrors.start_year}
                  </p>
                )}
              </div>

              {/* End Year */}
              <div>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  value={educationForm.end_year || ""}
                  onChange={(e) => {
                    setEducationForm({
                      ...educationForm,
                      end_year: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    });

                    if (educationErrors.end_year) {
                      setEducationErrors({
                        ...educationErrors,
                        end_year: "",
                      });
                    }
                  }}
                  placeholder="End Year (optional)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                    educationErrors.end_year
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {educationErrors.end_year && (
                  <p className="mt-1 text-sm text-red-500">
                    {educationErrors.end_year}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "employment":
        return (
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <input
                type="text"
                value={employmentForm.company_name}
                onChange={(e) => {
                  setEmploymentForm({
                    ...employmentForm,
                    company_name: e.target.value,
                  });

                  if (employmentErrors.company_name) {
                    setEmploymentErrors({
                      ...employmentErrors,
                      company_name: "",
                    });
                  }
                }}
                placeholder="Company Name *"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                  employmentErrors.company_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {employmentErrors.company_name && (
                <p className="mt-1 text-sm text-red-500">
                  {employmentErrors.company_name}
                </p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <input
                type="text"
                value={employmentForm.job_title}
                onChange={(e) => {
                  setEmploymentForm({
                    ...employmentForm,
                    job_title: e.target.value,
                  });

                  if (employmentErrors.job_title) {
                    setEmploymentErrors({
                      ...employmentErrors,
                      job_title: "",
                    });
                  }
                }}
                placeholder="Job Title *"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                  employmentErrors.job_title
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {employmentErrors.job_title && (
                <p className="mt-1 text-sm text-red-500">
                  {employmentErrors.job_title}
                </p>
              )}
            </div>

            {/* Description */}
            <textarea
              value={employmentForm.description}
              onChange={(e) =>
                setEmploymentForm({
                  ...employmentForm,
                  description: e.target.value,
                })
              }
              placeholder="Job Description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none resize-none"
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <input
                  type="date"
                  value={employmentForm.start_date}
                  onChange={(e) => {
                    setEmploymentForm({
                      ...employmentForm,
                      start_date: e.target.value,
                    });

                    if (employmentErrors.start_date) {
                      setEmploymentErrors({
                        ...employmentErrors,
                        start_date: "",
                      });
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none ${
                    employmentErrors.start_date
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {employmentErrors.start_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {employmentErrors.start_date}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div>
                <input
                  type="date"
                  value={employmentForm.end_date}
                  onChange={(e) => {
                    setEmploymentForm({
                      ...employmentForm,
                      end_date: e.target.value,
                    });

                    if (employmentErrors.end_date) {
                      setEmploymentErrors({
                        ...employmentErrors,
                        end_date: "",
                      });
                    }
                  }}
                  disabled={employmentForm.is_current}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7f56d9] focus:border-transparent outline-none disabled:bg-gray-100 ${
                    employmentErrors.end_date
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {employmentErrors.end_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {employmentErrors.end_date}
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={employmentForm.is_current}
                onChange={(e) =>
                  setEmploymentForm({
                    ...employmentForm,
                    is_current: e.target.checked,
                    end_date: e.target.checked ? "" : employmentForm.end_date,
                  })
                }
                className="w-4 h-4 text-[#7f56d9] rounded focus:ring-[#7f56d9]"
              />
              <span className="text-sm text-gray-600">
                I currently work here
              </span>
            </label>
          </div>
        );

      case "resume":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7f56d9] transition-colors">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload your resume</p>
              <input
                type="file"
                onChange={handleResumeUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="wizard-resume-upload"
              />
              <label
                htmlFor="wizard-resume-upload"
                className="px-4 py-2 bg-[#7f56d9] text-white rounded-lg hover:bg-[#5b3ba5] transition-colors cursor-pointer inline-block"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-2">
                PDF, DOC, DOCX up to 5MB
              </p>
            </div>
          </div>
        );

      case "email_verified":
      case "phone_verified":
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {currentStep.field === "email_verified"
                ? "Please check your email inbox and click the verification link."
                : "Please verify your phone number from your profile settings."}
            </p>
            <p className="text-sm text-gray-500">
              You can skip this step and complete it later.
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">
              Complete this step from your profile page.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#7f56d9] to-[#5b3ba5] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Complete Your Profile</h2>
                <p className="text-sm text-[#b794f4]">
                  Step {currentStepIndex + 1} of {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-6">
          {currentStep && (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h3>
              <p className="text-gray-600 mb-6">{currentStep.description}</p>
            </>
          )}
          {renderStepContent()}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#7f56d9] text-white rounded-lg hover:bg-[#5b3ba5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                "Saving..."
              ) : currentStepIndex === totalSteps - 1 ? (
                "Complete"
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionWizard;
