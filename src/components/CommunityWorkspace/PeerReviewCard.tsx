import React from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

import type { PeerReviewStudent } from "@/services/api/communityWorkspace.api";

interface PeerReviewCardProps {
  student: PeerReviewStudent;
  onReview: (student: PeerReviewStudent) => void;
}

const PeerReviewCard: React.FC<PeerReviewCardProps> = ({
  student,
  onReview,
}) => {
  const initials = (student.full_name ?? "")
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200">
      {/* Top */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {student.profile_image_url ? (
          <img
            src={student.profile_image_url}
            alt={student.full_name}
            className="h-12 w-12 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
            {initials}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">
            {student.full_name}
          </h4>

          <p className="text-xs text-gray-500 mt-1">{student.profession}</p>

          <p className="text-sm text-gray-700 mt-2">
            Needs feedback on their{" "}
            <span className="font-medium">{student.link_type}</span>.
          </p>
        </div>
      </div>

      {/* Link */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
        <a
          href={`https://${student.url.replace(/^https?:\/\//, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm text-blue-600 hover:underline"
        >
          {student.url}
        </a>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onReview(student)}
          className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Write Review
        </button>
      </div>
    </div>
  );
};

export default PeerReviewCard;
