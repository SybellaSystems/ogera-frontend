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
      toast.error(error?.data?.message ?? "You have already reviewed this profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Write Review</h2>

            <p className="text-sm text-gray-500 mt-1">
              Help another student improve their profile.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Student */}
          <div className="rounded-xl border bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">{student.full_name}</h3>

            <p className="text-sm text-gray-500">
              {student.profession ?? "Student"}
            </p>

            <div className="mt-3">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                {student.link_type}
              </span>
            </div>

            <a
              href={student.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block break-all text-sm text-blue-600 hover:underline"
            >
              {student.url}
            </a>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium">Rating</label>

            <div className="flex gap-2">
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
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
