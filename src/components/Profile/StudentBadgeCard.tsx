import React from "react";
import {
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import type { BadgeType } from "../../services/api/badgeApi";

const BADGE_STYLES: Record<
  BadgeType,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  FREE: {
    label: "FREE",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: <ShieldCheckIcon className="w-4 h-4 text-amber-600" />,
  },
  PREMIUM: {
    label: "PREMIUM",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-400",
    icon: <StarIcon className="w-4 h-4 text-yellow-600" />,
  },
  PIONEER: {
    label: "PIONEER",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-400",
    icon: <SparklesIcon className="w-4 h-4 text-purple-600" />,
  },
};

interface StudentBadgeChipProps {
  badge?: BadgeType | string | null;
  size?: "sm" | "md";
  showPriority?: boolean;
}

export const StudentBadgeChip: React.FC<StudentBadgeChipProps> = ({
  badge = "FREE",
  size = "sm",
  showPriority = true,
}) => {
  const normalized = (String(badge || "FREE").toUpperCase() as BadgeType) || "FREE";
  const style = BADGE_STYLES[normalized] || BADGE_STYLES.FREE;
  const sizeClass = size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${style.bg} ${style.text} ${style.border} ${sizeClass}`}
    >
      {style.icon}
      {style.label}
      {normalized === "PIONEER" && showPriority && (
        <span className="ml-1 text-[10px] uppercase tracking-wide opacity-80">Priority</span>
      )}
    </span>
  );
};

interface StudentBadgeCardProps {
  badge: BadgeType;
  subscriptionDaysLeft?: number | null;
  pioneerEligible?: boolean;
  applicationsUsed?: number;
  applicationsRemaining?: number;
  onUpgradeClick?: () => void;
}

const StudentBadgeCard: React.FC<StudentBadgeCardProps> = ({
  badge,
  subscriptionDaysLeft,
  pioneerEligible,
  applicationsUsed,
  applicationsRemaining,
  onUpgradeClick,
}) => {
  const style = BADGE_STYLES[badge] || BADGE_STYLES.FREE;

  return (
    <div className={`rounded-xl border-2 p-4 ${style.bg} ${style.border} ${badge === "PREMIUM" ? "ring-2 ring-yellow-300" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${style.border} bg-white shadow-sm`}>
            <span className="scale-150">{style.icon}</span>
          </div>
          <div>
            <p className={`text-lg font-bold ${style.text}`}>{style.label} Badge</p>
            {badge === "PREMIUM" && subscriptionDaysLeft != null && (
              <p className="text-sm font-medium text-yellow-700">
                Premium Active — {subscriptionDaysLeft} {subscriptionDaysLeft === 1 ? "Day" : "Days"} Left
              </p>
            )}
            {badge === "PIONEER" && (
              <p className="text-sm font-medium text-purple-700">Priority access · Instant job visibility</p>
            )}
            {badge === "FREE" && pioneerEligible && (
              <p className="text-xs text-purple-600 mt-0.5">Pioneer candidate — complete academic verification & first task</p>
            )}
            {applicationsUsed != null && applicationsRemaining != null && (
              <p className="text-xs text-gray-600 mt-1">
                Applications: {applicationsUsed} used · {applicationsRemaining} remaining
              </p>
            )}
          </div>
        </div>

        {badge === "FREE" && onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="cursor-pointer px-4 py-2 bg-[#7f56d9] hover:bg-[#5b3ba5] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Upgrade Subscription
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentBadgeCard;
