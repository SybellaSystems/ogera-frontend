import React, { useEffect, useState } from "react";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

import { useSubmitPeerReviewMutation } from "@/services/api/communityWorkspace.api";
import type { PeerReviewStudent } from "@/services/api/communityWorkspace.api";

interface ReviewModalProps {
  open: boolean;
  student: PeerReviewStudent | null;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  student,
  onClose,
}) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState("");
  const [submitPeerReview, { isLoading }] = useSubmitPeerReviewMutation();

  useEffect(() => {
    if (open) {
      setFeedback("");
      setRating(0);
      setHoverRating(0);
      setError("");
    }
  }, [open]);

  if (!open || !student) return null;

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError("Please write your review.");
      return;
    }

    if (feedback.trim().length < 10) {
      setError("Review should contain at least 10 characters.");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      await submitPeerReview({
        linkId: student.id,
        data: {
          rating,
          review: feedback,
        },
      }).unwrap();

      toast.success("Review submitted successfully!");

      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ?? "You have already reviewed this profile.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-[#6F42C1] to-[#7F56D9] px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Write Review</h2>

              <p className="mt-1 text-sm text-purple-100">
                Help another student improve their professional profile.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white transition hover:bg-white/10"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          {/* Student */}
          <div className="rounded-2xl flex-col sm:flex-row border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {student.full_name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {student.profession ?? "Student"}
                </p>
              </div>

              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                {student.link_type}
              </span>
            </div>

            <a
              href={student.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-lg bg-purple-50 px-4 py-3 break-all text-sm font-medium text-purple-700 transition hover:bg-purple-100"
            >
              {student.url}
            </a>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium">Rating</label>

            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <StarIcon
                    className={`h-7 w-7 ${
                      (hoverRating || rating) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="mb-2 block text-sm font-medium">Feedback</label>

            <textarea
              rows={5}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError("");
              }}
              placeholder="Write constructive feedback..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm transition-all outline-none placeholder:text-gray-400 focus:border-[#7F56D9] focus:bg-white focus:ring-4 focus:ring-purple-100"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 flex-col-reverse sm:flex-row  bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full w-full sm:w-auto cursor-pointer rounded-xl border border-gray-300 py-3 text-sm font-medium transition hover:bg-gray-100 sm:w-auto sm:px-6"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full w-full sm:w-auto cursor-pointer rounded-xl bg-gradient-to-r from-[#6F42C1] to-[#7F56D9] py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
