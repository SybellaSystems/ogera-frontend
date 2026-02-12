import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice";
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
import { useGetProfileCompletionQuery, useUpdateProfileImageMutation } from "../../services/api/profileCompletionApi";
import { useUpdateExtendedProfileMutation, useAddBulkSkillsMutation, useAddEducationMutation, useAddEmploymentMutation } from "../../services/api/extendedProfileApi";
import { uploadResume } from "../../services/api/resumeApi";
import toast from "react-hot-toast";

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

const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const dispatch = useDispatch();
  const { data, refetch } = useGetProfileCompletionQuery();
  const [updateProfileImage] = useUpdateProfileImageMutation();
  const [updateExtendedProfile] = useUpdateExtendedProfileMutation();
  const [addBulkSkills] = useAddBulkSkillsMutation();
  const [addEducation] = useAddEducationMutation();
  const [addEmployment] = useAddEmploymentMutation();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for different steps
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  // Education form
  const [educationForm, setEducationForm] = useState({
    institution_name: "",
    degree: "",
    field_of_study: "",
    start_year: new Date().getFullYear(),
    end_year: undefined as number | undefined,
    is_current: true,
    description: "",
  });

  // Employment form
  const [employmentForm, setEmploymentForm] = useState({
    company_name: "",
    job_title: "",
    employment_type: "full_time" as "full_time" | "part_time" | "contract" | "internship" | "freelance",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  const completion = data?.data;
  const wizardSteps = completion?.wizardSteps || [];
  const currentStep = wizardSteps[currentStepIndex];
  const totalSteps = wizardSteps.length;

  if (!isOpen || !completion || completion.is_complete) {
    return null;
  }

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      // Handle submission based on current step field
      if (currentStep) {
        switch (currentStep.field) {
          case "profile_image":
            if (profileImageUrl) {
              const result = await updateProfileImage({ profile_image_url: profileImageUrl }).unwrap();
              // Sync to Redux so Header updates immediately
              dispatch(setUser({ profile_image_url: result.data.profile_image_url }));
              toast.success("Profile image updated!");
            }
            break;

          case "bio":
            if (bio.trim().length > 20) {
              await updateExtendedProfile({ profile_summary: bio }).unwrap();
              toast.success("Bio updated!");
            } else {
              toast.error("Bio must be at least 20 characters");
              setIsSubmitting(false);
              return;
            }
            break;

          case "skills":
            const skillNames = skills.split(",").map(s => s.trim()).filter(s => s);
            if (skillNames.length >= 3) {
              const skillsArray = skillNames.map(name => ({
                skill_name: name,
                skill_type: "key_skill" as const,
              }));
              await addBulkSkills({ skills: skillsArray }).unwrap();
              toast.success("Skills added!");
            } else {
              toast.error("Please add at least 3 skills");
              setIsSubmitting(false);
              return;
            }
            break;

          case "education":
            if (educationForm.institution_name && educationForm.degree) {
              await addEducation(educationForm).unwrap();
              toast.success("Education added!");
            } else {
              toast.error("Please fill in required education fields");
              setIsSubmitting(false);
              return;
            }
            break;

          case "employment":
            if (employmentForm.company_name && employmentForm.job_title) {
              await addEmployment(employmentForm).unwrap();
              toast.success("Employment added!");
            }
            break;

          default:
            break;
        }
      }

      // Move to next step or complete
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        await refetch();
      } else {
        await refetch();
        toast.success("Profile completed! Check your new badges!");
        if (onComplete) {
          onComplete();
        }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, create a temporary URL - in production, upload to cloud storage
    const tempUrl = URL.createObjectURL(file);
    setProfileImageUrl(tempUrl);
    toast.success("Image selected! Click Next to save.");
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      await uploadResume(file);
      toast.success("Resume uploaded!");
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = currentStep ? stepIcons[currentStep.icon] || CheckCircleIcon : CheckCircleIcon;

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.field) {
      case "profile_image":
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
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
                className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Upload Photo
              </button>
            </div>
          </div>
        );

      case "bio":
        return (
          <div className="space-y-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself... (minimum 20 characters)"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-sm text-gray-500">
              {bio.length}/20 characters minimum
            </p>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Node.js)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-sm text-gray-500">
              {skills.split(",").filter(s => s.trim()).length}/3 skills minimum
            </p>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={educationForm.institution_name}
              onChange={(e) => setEducationForm({ ...educationForm, institution_name: e.target.value })}
              placeholder="Institution Name *"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={educationForm.degree}
              onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
              placeholder="Degree *"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={educationForm.field_of_study}
              onChange={(e) => setEducationForm({ ...educationForm, field_of_study: e.target.value })}
              placeholder="Field of Study"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear() + 5}
                value={educationForm.start_year}
                onChange={(e) => setEducationForm({ ...educationForm, start_year: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="Start Year"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear() + 10}
                value={educationForm.end_year || ""}
                onChange={(e) => setEducationForm({ ...educationForm, end_year: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="End Year (optional)"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        );

      case "employment":
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={employmentForm.company_name}
              onChange={(e) => setEmploymentForm({ ...employmentForm, company_name: e.target.value })}
              placeholder="Company Name *"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={employmentForm.job_title}
              onChange={(e) => setEmploymentForm({ ...employmentForm, job_title: e.target.value })}
              placeholder="Job Title *"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <textarea
              value={employmentForm.description}
              onChange={(e) => setEmploymentForm({ ...employmentForm, description: e.target.value })}
              placeholder="Job Description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={employmentForm.start_date}
                onChange={(e) => setEmploymentForm({ ...employmentForm, start_date: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={employmentForm.end_date}
                onChange={(e) => setEmploymentForm({ ...employmentForm, end_date: e.target.value })}
                disabled={employmentForm.is_current}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-100"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={employmentForm.is_current}
                onChange={(e) => setEmploymentForm({ ...employmentForm, is_current: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">I currently work here</span>
            </label>
          </div>
        );

      case "resume":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload your resume</p>
              <input
                type="file"
                onChange={handleResumeUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 5MB</p>
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
            <p className="text-gray-600">Complete this step from your profile page.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Complete Your Profile</h2>
                <p className="text-sm text-purple-200">
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

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
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

        {/* Footer */}
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
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
