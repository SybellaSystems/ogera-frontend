export interface Milestone {
  id: string;
  threshold: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: "getting-started",
    threshold: 25,
    name: "Getting Started",
    description: "You have begun building your profile!",
    icon: "rocket-launch",
    color: "#6366f1",
    emoji: "\u{1F680}",
  },
  {
    id: "halfway-hero",
    threshold: 50,
    name: "Halfway Hero",
    description: "Your profile is 50% complete. Keep going!",
    icon: "fire",
    color: "#f59e0b",
    emoji: "\u{1F525}",
  },
  {
    id: "almost-there",
    threshold: 75,
    name: "Almost There",
    description: "Just a few more steps to a standout profile.",
    icon: "star",
    color: "#10b981",
    emoji: "\u2B50",
  },
  {
    id: "profile-champion",
    threshold: 100,
    name: "Profile Champion",
    description: "Your profile is complete! You stand out to recruiters.",
    icon: "trophy",
    color: "#2d1b69",
    emoji: "\u{1F3C6}",
  },
];

export const getMotivationalMessage = (completion: number): string => {
  if (completion === 0) return "Start building your profile to unlock achievements!";
  if (completion < 25) return "Add a few more details to earn your first badge.";
  if (completion < 50) return "Great start! Keep going to reach Halfway Hero.";
  if (completion < 75) return "You're making great progress. The finish line is in sight!";
  if (completion < 80) return "Almost at 80%! Complete profiles get 3x more views.";
  if (completion < 100) return "So close to Profile Champion! Just a few fields left.";
  return "Your profile is complete. You're 3x more likely to get noticed!";
};

export const MILESTONE_STORAGE_KEY = "ogera_profile_milestones_seen";
