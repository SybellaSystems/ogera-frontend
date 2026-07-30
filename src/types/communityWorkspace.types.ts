// ==============================
// Student Link
// ==============================

export interface StudentLink {
  id: string;
  user_id: string;

  link_type: "github" | "linkedin" | "portfolio";

  url: string;

  visibility: boolean;

  status: "active" | "inactive";

  created_at: string;
  updated_at: string;
}

// ==============================
// Peer Review
// ==============================

export interface PeerReview {
  id: string;

  reviewer_id: string;

  link_id: string;

  rating: number;

  review: string;

  status: "published" | "hidden";

  created_at: string;

  reviewer?: {
    user_id: string;
    full_name: string;
    profile_image?: string | null;
  };

  reply?: {
    id: string;

    reply: string;

    created_at: string;

    updated_at: string;

    author: {
      user_id: string;
      full_name: string;
      profile_image_url?: string;
    };
  } | null;
}

// ==============================
// Student Feed Item
// ==============================

export interface PeerReviewStudent {
  id: string;

  user_id: string;

  full_name: string;

  profile_image?: string | null;

  profession?: string;

  link_type: "github" | "linkedin" | "portfolio";

  url: string;

  visibility: boolean;
}

// ==============================
// Submit Link Request
// ==============================

export interface SubmitLinkRequest {
  link_type: "github" | "linkedin" | "portfolio";

  url: string;

  visibility?: boolean;
}

// ==============================
// Submit Review Request
// ==============================

export interface SubmitReviewRequest {
  rating: number;

  review: string;
}

// ==============================
// Generic API Response
// ==============================

export interface ApiResponse<T> {
  success: boolean;

  status: number;

  message: string;

  data: T;
}
