import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import {
  useSubmitReplyMutation,
  useUpdateReplyMutation,
} from "@/services/api/communityWorkspace.api";

interface Props {
  open: boolean;
  review: any;
  onClose: () => void;
}

const ReplyModal: React.FC<Props> = ({ open, review, onClose }) => {
  const [reply, setReply] = useState("");

  const [submitReply, { isLoading: isSubmitting }] = useSubmitReplyMutation();

  const [updateReply, { isLoading: isUpdating }] = useUpdateReplyMutation();

  useEffect(() => {
    if (!review) return;

    setReply(review.reply?.reply ?? "");
  }, [review]);

  if (!open || !review) return null;

  const handleSubmit = async () => {
    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      toast.error("Reply is required.");
      return;
    }

    if (trimmedReply.length < 5) {
      toast.error("Reply must contain at least 5 characters.");
      return;
    }

    try {
      if (review.reply) {
        await updateReply({
          reviewId: review.id,
          data: {
            reply: trimmedReply,
          },
        }).unwrap();

        toast.success("Reply updated successfully.");
      } else {
        await submitReply({
          reviewId: review.id,
          data: {
            reply: trimmedReply,
          },
        }).unwrap();

        toast.success("Reply submitted successfully.");
      }

      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Unable to save reply.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-[#7F56D9] to-[#9333EA] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-semibold">
              {review.reply ? "Edit Reply" : "Reply to Review"}
            </h2>

            <p className="text-sm text-purple-100 mt-1">
              Respond professionally to your peer's feedback.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
            <p className="text-sm font-semibold">{review.reviewer.full_name}</p>

            <p className="mt-2 text-sm text-gray-600">{review.review}</p>
          </div>

          <textarea
            rows={6}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a thoughtful and professional reply..."
            maxLength={300}
            className="
    w-full
    rounded-2xl
    border
    border-gray-200
    bg-gray-50
    p-4
    text-sm
    leading-6
    outline-none
    transition
    focus:border-[#7F56D9]
    focus:bg-white
    focus:ring-4
    focus:ring-purple-100
  "
          />

          <div className="flex justify-between text-xs text-gray-500">
            <span>Keep your reply respectful and constructive.</span>

            <span
              className={reply.length > 280 ? "font-medium text-red-500" : ""}
            >
              {reply.length}/300
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting || isUpdating}
            className="
        w-full
        rounded-xl
        border
        border-gray-300
        px-5
        py-3
        font-medium
        transition
        hover:bg-gray-100
        sm:w-auto
    "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUpdating}
            className="
        w-full
        rounded-xl
        bg-gradient-to-r
        from-[#7F56D9]
        to-[#9333EA]
        px-6
        py-3
        font-medium
        text-white
        shadow-lg
        transition
        hover:brightness-110
        disabled:opacity-60
        sm:w-auto
    "
          >
            {isSubmitting || isUpdating
              ? "Saving..."
              : review.reply
                ? "Update Reply"
                : "Submit Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
