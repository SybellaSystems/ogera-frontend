import React from "react";
import { motion } from "framer-motion";
import {
  RocketLaunchIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { useProfileMilestones } from "./useProfileMilestones";
import { MILESTONES, getMotivationalMessage } from "./milestoneConfig";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "rocket-launch": RocketLaunchIcon,
  fire: FireIcon,
  star: StarIcon,
  trophy: TrophyIcon,
};

interface ProfileMilestonesProps {
  profileCompletion: number;
  userId: string | undefined;
  onStartWizard?: () => void;
}

const ProfileMilestones: React.FC<ProfileMilestonesProps> = ({
  profileCompletion,
  userId,
  onStartWizard,
}) => {
  const { earnedMilestones, nextMilestone } = useProfileMilestones(
    profileCompletion,
    userId
  );

  const motivationalText = getMotivationalMessage(profileCompletion);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d1b69] to-[#3d2b7a] px-5 py-3">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-yellow-400" />
          Achievements
        </h3>
      </div>

      <div className="p-4">
        {/* Horizontal milestone progress track */}
        <div className="relative mb-6">
          {/* Background track */}
          <div className="h-2 bg-gray-200 rounded-full relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2d1b69] to-[#10b981] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Milestone markers on the track */}
          <div className="flex justify-between mt-1">
            {MILESTONES.map((milestone) => {
              const earned = profileCompletion >= milestone.threshold;
              const IconComponent = iconMap[milestone.icon] || StarIcon;

              return (
                <div
                  key={milestone.id}
                  className="flex flex-col items-center group relative"
                  style={{ width: "25%" }}
                >
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center -mt-5 border-2 transition-colors ${
                      earned
                        ? "border-white shadow-lg"
                        : "border-gray-300 bg-gray-100"
                    }`}
                    style={earned ? { backgroundColor: milestone.color } : {}}
                    initial={false}
                    animate={earned ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {earned ? (
                      <IconComponent className="w-4 h-4 text-white" />
                    ) : (
                      <LockClosedIcon className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </motion.div>
                  <span
                    className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                      earned ? "text-[#2d1b69]" : "text-gray-400"
                    }`}
                  >
                    {milestone.threshold}%
                  </span>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="font-bold">{milestone.name}</div>
                    <div className="text-gray-300 mt-0.5">{milestone.description}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earned badges row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {MILESTONES.map((milestone) => {
            const earned = profileCompletion >= milestone.threshold;

            return (
              <motion.div
                key={milestone.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  earned
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
                style={earned ? { backgroundColor: milestone.color } : {}}
                initial={false}
                animate={earned ? { opacity: 1 } : { opacity: 0.6 }}
              >
                {earned ? (
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                ) : (
                  <LockClosedIcon className="w-3.5 h-3.5" />
                )}
                {milestone.name}
              </motion.div>
            );
          })}
        </div>

        {/* Motivational message */}
        <div className="bg-[#f4f0fa] rounded-lg px-3 py-2 border border-[#e8dff5]">
          <p className="text-xs text-[#2d1b69] font-medium">
            {nextMilestone && (
              <span className="text-gray-500">
                Next: {nextMilestone.name} at {nextMilestone.threshold}% &mdash;{" "}
              </span>
            )}
            {motivationalText}
          </p>
        </div>

        {/* Complete Now button */}
        {profileCompletion < 100 && onStartWizard && (
          <button
            onClick={onStartWizard}
            className="mt-3 w-full px-4 py-2 bg-[#2d1b69] hover:bg-[#1f1250] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Complete Now
          </button>
        )}

        {/* Completion stat */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>
            {earnedMilestones.length} of {MILESTONES.length} milestones earned
          </span>
          <span className="font-bold text-[#2d1b69]">{profileCompletion}% complete</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileMilestones;
