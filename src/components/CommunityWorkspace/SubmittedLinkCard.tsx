import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { StudentLink } from "@/services/api/communityWorkspace.api";

import {
  useDeleteStudentLinkMutation,
  useGetReviewsQuery,
} from "@/services/api/communityWorkspace.api";

interface Props {
  submittedLink: StudentLink;
}

const SubmittedLinkCard: React.FC<Props> = ({ submittedLink }) => {
  const [deleteStudentLink] = useDeleteStudentLinkMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: reviewsData } = useGetReviewsQuery(submittedLink.id);

  const reviews = reviewsData?.data ?? [];

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteStudentLink(submittedLink.id).unwrap();

      toast.success("Review Profile Link deleted successfully.");
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-5">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
            {submittedLink.link_type}
          </span>

          <a
            href={submittedLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-sm text-blue-600 hover:underline break-all"
          >
            {submittedLink.url}
          </a>

          <div className="mt-3">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              {submittedLink.status}
            </span>
          </div>
        </div>

        <button
  onClick={() => setShowDeleteModal(true)}
  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95"
  title="Delete"
>
  <TrashIcon className="h-5 w-5" />
</button>
      </div>

      <div className="mt-5">
        <h4 className="mb-3 font-semibold text-gray-900">
          Peer Reviews ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500">
            No reviews yet.
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {review.reviewer?.profile_image_url ? (
                    <img
                      src={review.reviewer.profile_image_url}
                      alt={review.reviewer.full_name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                      {(review.reviewer?.full_name ?? "U")
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Name + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="truncate text-sm font-semibold text-gray-900">
                        {review.reviewer?.full_name}
                      </h5>

                      <span className="shrink-0 text-[11px] text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="mt-1 flex text-[15px] leading-none">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            index < review.rating
                              ? "text-amber-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Review */}
                    <p className="mt-2 text-sm leading-5 text-gray-600 line-clamp-3">
                      {review.review}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Delete Profile
              </h2>

              <p className="mt-2 text-sm text-gray-500 leading-6">
                Are you sure you want to delete your submitted profile?
              </p>

              <p className="mt-1 text-xs text-red-500 font-medium">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmittedLinkCard;
