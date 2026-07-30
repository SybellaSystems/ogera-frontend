import React from "react";
import PeerReviewCard from "./PeerReviewCard";
import {
  useGetCommunityFeedQuery,
} from "@/services/api/communityWorkspace.api";

import type {
  PeerReviewStudent,
} from "@/services/api/communityWorkspace.api";

interface PeerReviewFeedProps {
  onReview: (student: PeerReviewStudent) => void;
}

const PeerReviewFeed: React.FC<PeerReviewFeedProps> = ({ onReview }) => {
  const {
  data,
  isLoading,
  isError,
} = useGetCommunityFeedQuery();

const students = data?.data ?? [];

    return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 h-[490px] flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Peer Review Feed
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Help your fellow students improve their professional profiles.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2 p-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-gray-200 p-4"
            >
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200" />

                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-gray-200 mb-2" />

                  <div className="h-3 w-28 rounded bg-gray-100 mb-3" />

                  <div className="h-3 w-full rounded bg-gray-100" />
                </div>
              </div>

              <div className="mt-4 h-10 rounded bg-gray-100" />

              <div className="mt-4 flex justify-end">
                <div className="h-10 w-32 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
    <p className="text-sm text-red-600">
      Failed to load peer review feed.
    </p>
  </div>
)}

      {/* Empty State */}
      {!isLoading && !isError && students.length === 0 && (
        <div className="flex-1 mt-4 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-3">📭</div>

          <h3 className="text-lg font-semibold text-gray-800">
            No Profiles Available
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Be the first student to submit your profile for peer review.
          </p>
        </div>
      )}

      {/* Feed */}
      {!isLoading && !isError && students.length > 0 && (
        <div
          className="
      max-h-[330px]
      overflow-y-auto
      pr-2
      space-y-3
      scrollbar-thin
      scrollbar-thumb-gray-300
      scrollbar-track-transparent
    "
        >
          {students.map((student) => (
            <PeerReviewCard
              key={student.id}
              student={student}
              onReview={onReview}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PeerReviewFeed;
