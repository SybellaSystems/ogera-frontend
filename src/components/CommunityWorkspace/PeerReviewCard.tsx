import React from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

import type { PeerReviewStudent } from "@/services/api/communityWorkspace.api";
import {
  useGetReviewsQuery,
  useGetMyReviewsQuery,
} from "@/services/api/communityWorkspace.api";

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

  const { data: reviewsData } = useGetReviewsQuery(student.id);

  const reviews = reviewsData?.data ?? [];

  const { data: myReviewsData } = useGetMyReviewsQuery();

  const myReview = myReviewsData?.data.find(
    (review: any) => review.studentLink?.id === student.id,
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 pt-2 pb-2 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200">
      {/* Top */}
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        {student.profile_image_url ? (
          <img
            src={student.profile_image_url}
            alt={student.full_name}
            className="h-11 w-11 rounded-full object-cover border border-gray-200"
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

          {/* <p className="text-xs text-gray-500 mt-1">{student.profession}</p> */}

          <p className="text-sm text-gray-700 mt-1">
            Needs feedback on their{" "}
            <span className="font-medium">{student.link_type}</span>.
          </p>
        </div>
      </div>

      {/* Link */}
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
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
      <div
        className="
    mt-1
    max-h-[400px]
    overflow-y-auto
    space-y-1
    pr-2
    scrollbar-thin
    scrollbar-thumb-purple-500s
    scrollbar-track-gray-100
  "
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 ">
          <h3 className="text-base font-semibold text-gray-900">
            Peer Reviews ({reviews.length})
          </h3>
        </div>

        {reviews.map((review: any) => {
          const isMine = review.reviewer_id === myReview?.reviewer_id;

          const reviewerInitials =
            review.reviewer?.full_name
              ?.split(" ")
              .map((x: string) => x[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() ?? "U";

          return (
            <div
              key={review.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="p-2">
                <div className="flex items-start gap-2.5">
                  {review.reviewer?.profile_image_url ? (
                    <img
                      src={review.reviewer.profile_image_url}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                      {isMine ? "Y" : reviewerInitials}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">
                          {isMine ? "You" : review.reviewer?.full_name}
                        </h4>

                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <span
                              key={index}
                              className={`text-sm ${
                                index < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-5 text-gray-700">
                      {review.review}
                    </p>
                  </div>
                </div>
              </div>

              {review.reply && (
                <div className="ml-13 mr-3 mb-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <div className="flex items-start gap-2.5">
                    {/* Profile Image */}
                    {student.profile_image_url ? (
                      <img
                        src={student.profile_image_url}
                        alt={student.full_name}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                        {initials}
                      </div>
                    )}

                    {/* Reply Content */}
                    <div className="min-w-0 flex-1">
                      {/* Name + Student + Date */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <h5 className="truncate font-semibold text-gray-900">
                            {student.full_name}
                          </h5>

                          <span className="shrink-0 text-xs text-gray-500">
                            (Student Reply)
                          </span>
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {new Date(
                            review.reply.updated_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Reply Text */}
                      <div className="mt-1 w-full">
                        <p className="text-sm leading-5 text-gray-700 break-words">
                          {review.reply.reply}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!myReview && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onReview(student)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-2 py-1.5 cursor-pointer text-sm font-medium text-white hover:bg-purple-700"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Write Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerReviewCard;
