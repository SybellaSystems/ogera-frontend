import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { MILESTONES, MILESTONE_STORAGE_KEY } from "./milestoneConfig";

export function useProfileMilestones(profileCompletion: number, userId: string | undefined) {
  const hasShownRef = useRef(false);

  const earnedMilestones = MILESTONES.filter(m => profileCompletion >= m.threshold);
  const lockedMilestones = MILESTONES.filter(m => profileCompletion < m.threshold);
  const nextMilestone = lockedMilestones[0] || null;

  useEffect(() => {
    if (!userId || hasShownRef.current) return;

    const storageKey = `${MILESTONE_STORAGE_KEY}_${userId}`;
    const seenRaw = localStorage.getItem(storageKey);
    const seen: string[] = seenRaw ? JSON.parse(seenRaw) : [];

    const newlyEarned = earnedMilestones.filter(m => !seen.includes(m.id));

    if (newlyEarned.length > 0) {
      const highest = newlyEarned[newlyEarned.length - 1];

      const timer = setTimeout(() => {
        toast.success(
          `${highest.emoji} Achievement Unlocked: ${highest.name}!`,
          {
            duration: 5000,
            style: {
              background: "#1a0e40",
              color: "#fff",
              border: "1px solid #2d1b69",
              fontWeight: 600,
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          }
        );
      }, 800);

      const allEarnedIds = earnedMilestones.map(m => m.id);
      localStorage.setItem(storageKey, JSON.stringify(allEarnedIds));
      hasShownRef.current = true;

      return () => clearTimeout(timer);
    }

    hasShownRef.current = true;
  }, [profileCompletion, userId, earnedMilestones]);

  return {
    earnedMilestones,
    lockedMilestones,
    nextMilestone,
    totalMilestones: MILESTONES.length,
  };
}
