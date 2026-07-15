export type LinkType = "GitHub" | "LinkedIn" | "Portfolio" | "Other";

export interface SubmittedLink {
  id: number;
  type: LinkType;
  url: string;
  status: "Active" | "Pending";
}

export interface PeerReviewStudent {
  id: number;
  name: string;
  course: string;
  type: LinkType;
  url: string;
}

export interface ReviewModalProps {
  open: boolean;
  student: PeerReviewStudent | null;
  onClose: () => void;
}