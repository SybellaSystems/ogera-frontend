import React from "react";
import { SparklesIcon, StarIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useGetProfileCompletionQuery, type Badge } from "../../services/api/profileCompletionApi";

interface BadgeDisplayProps {
  badges?: Badge[];
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  early_adopter: StarIcon,
  profile_complete: CheckBadgeIcon,
  first_job: SparklesIcon,
  verified: CheckBadgeIcon,
  top_performer: StarIcon,
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges: propBadges,
  showLabel = true,
  size = "md",
}) => {
  const { data } = useGetProfileCompletionQuery(undefined, {
    skip: !!propBadges,
  });

  const badges = propBadges || data?.data?.badges || [];

  if (badges.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const containerSizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {badges.map((badge) => {
        const IconComponent = badgeIcons[badge.badge_type] || CheckBadgeIcon;

        return (
          <div
            key={badge.badge_id}
            className="group relative"
            title={badge.description}
          >
            <div
              className={`${containerSizeClasses[size]} rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer`}
              style={{ backgroundColor: badge.color || "#7F56D9" }}
            >
              <IconComponent className={`${sizeClasses[size]} text-white`} />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <div className="font-bold">{badge.name}</div>
              {badge.description && (
                <div className="text-gray-300 mt-0.5">{badge.description}</div>
              )}
              {badge.UserBadge?.awarded_at && (
                <div className="text-gray-400 mt-1 text-[10px]">
                  Earned: {new Date(badge.UserBadge.awarded_at).toLocaleDateString()}
                </div>
              )}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </div>
        );
      })}

      {showLabel && badges.length > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          {badges.length} badge{badges.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};

export default BadgeDisplay;
