import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useGetProfileCompletionQuery } from "../../services/api/profileCompletionApi";

interface ProfileCompletionCardProps {
  onStartWizard?: () => void;
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  onStartWizard,
}) => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetProfileCompletionQuery();

  const completion = data?.data;

  // Don't show if profile is complete or loading
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-[#f5f0fc] to-[#ede7f8] rounded-xl p-6 border border-[#ddd0ec] animate-pulse">
        <div className="h-6 bg-[#ddd0ec] rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#ede7f8] rounded w-2/3 mb-4"></div>
        <div className="h-3 bg-[#ede7f8] rounded-full w-full"></div>
      </div>
    );
  }

  if (!completion || completion.is_complete) {
    return null;
  }

  const percentage = completion.profile_completion_percentage;
  const missingCount = completion.missingFields.length;

  const handleClick = () => {
    if (onStartWizard) {
      onStartWizard();
    } else {
      navigate("/dashboard/profile?wizard=true");
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#f5f0fc] via-[#ede7f8] to-[#f5f0fc] rounded-xl p-6 border border-[#ddd0ec] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ede7f8] rounded-xl">
            <UserCircleIcon className="h-8 w-8 text-[#6941C6]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2d1b69]">
              Complete Your Profile
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {missingCount} step{missingCount !== 1 ? "s" : ""} remaining to unlock badges
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-[#6941C6]">
            Earn badges!
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-[#6941C6]">{percentage}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6941C6] to-[#7F56D9] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Next Steps Preview */}
      {completion.wizardSteps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Next steps:</p>
          <div className="flex flex-wrap gap-2">
            {completion.wizardSteps.slice(0, 3).map((step, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200"
              >
                <CheckCircleIcon className="h-3 w-3 text-gray-400" />
                {step.title}
              </span>
            ))}
            {completion.wizardSteps.length > 3 && (
              <span className="px-2 py-1 bg-[#ede7f8] rounded-lg text-xs text-[#6941C6] font-medium">
                +{completion.wizardSteps.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleClick}
        className="mt-6 w-fit px-10 py-3 flex items-center justify-center gap-2 bg-[#2d1b69] hover:bg-[#1a1035] text-white rounded-full font-medium transition-colors cursor-pointer group"
      >
        Complete Now
        <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default ProfileCompletionCard;
