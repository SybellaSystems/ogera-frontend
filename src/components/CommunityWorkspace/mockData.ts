import type { PeerReviewStudent, SubmittedLink } from "./types";

export const submittedLink: SubmittedLink = {
  id: 1,
  type: "GitHub",
  url: "https://github.com/mujassim",
  status: "Active",
};

export const peerReviewStudents: PeerReviewStudent[] = [
  {
    id: 1,
    name: "John Doe",
    course: "Computer Science",
    type: "GitHub",
    url: "github.com/student-a/portfolio",
  },
  {
    id: 2,
    name: "Sarah Wilson",
    course: "Marketing",
    type: "LinkedIn",
    url: "linkedin.com/in/student-b",
  },
];