import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { StudentLink } from "@/services/api/communityWorkspace.api";
import ReplyModal from "./ReplyModal";
import { GlobeAltIcon, LinkIcon } from "@heroicons/react/24/outline";

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

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);

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

  const openReplyModal = (review: any) => {
    setSelectedReview(review);
    setReplyModalOpen(true);
  };

  const getLinkTypeIcon = (linkType: string) => {
    switch (linkType?.toLowerCase()) {
      case "github":
        return (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.465-1.11-1.465-.908-.621.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.339-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48A10.002 10.002 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
          </svg>
        );

      case "linkedin":
        return (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.606 0 4.27 2.373 4.27 5.467v6.274ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM3.555 20.452h3.56V9h-3.56v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.205 24 24 23.227 24 22.271V1.729C24 .774 23.205 0 22.225 0Z" />
          </svg>
        );

      case "portfolio":
        return <GlobeAltIcon className="h-5 w-5" />;

      default:
        return <LinkIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg pt-2 px-4 pb-2 bg-gray-50 mb-2">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          {/* Link Type + Status */}
          <div className="flex items-center gap-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              {getLinkTypeIcon(submittedLink.link_type)}
            </span>

            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              {submittedLink.status}
            </span>
          </div>

          <a
            href={submittedLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-1.5 cursor-pointer text-sm text-blue-600 hover:underline break-all"
          >
            {submittedLink.url}
          </a>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95"
          title="Delete"
        >
          <TrashIcon className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-1.5">
        <h4 className="mb-1 font-semibold text-gray-900">
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
                className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
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
                      <div className="flex min-w-0 items-center gap-3">
                        <h5 className="truncate text-sm font-semibold text-gray-900">
                          {review.reviewer?.full_name}
                        </h5>

                        {/* Rating */}
                        <div className="flex shrink-0 text-[15px] leading-none">
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
                      </div>

                      <span className="shrink-0 text-[11px] text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Review */}
                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {review.review}
                    </p>

                    {/* Reply Section */}
                    <div className="mt-2 border-l-4 border-purple-500 bg-purple-50 rounded-md px-3 py-1">
                      {review.reply ? (
                        <>
                          <div className="flex items-center justify-between">
                            {/* Your Reply + Date */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-purple-700">
                                Your Reply
                              </span>

                              <span className="text-[11px] text-gray-500">
                                {new Date(
                                  review.reply.created_at,
                                ).toLocaleDateString("en-GB")}
                              </span>
                            </div>

                            <button
                              onClick={() => openReplyModal(review)}
                              className="text-xs font-medium text-purple-600 hover:text-purple-800"
                            >
                              Edit Reply
                            </button>
                          </div>

                          <p className="text-sm text-gray-700">
                            {review.reply.reply}
                          </p>
                        </>
                      ) : (
                        <button
                          onClick={() => openReplyModal(review)}
                          className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReplyModal
        open={replyModalOpen}
        review={selectedReview}
        onClose={() => {
          setReplyModalOpen(false);
          setSelectedReview(null);
        }}
      />

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
