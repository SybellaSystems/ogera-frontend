import React, { useState } from "react";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useCreateReviewMutation, type ReviewableApplication } from "../services/api/reviewApi";
import toast from "react-hot-toast";

interface ReviewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ReviewableApplication | null;
  onSuccess?: () => void;
}

interface RatingCategory {
  key: "overall" | "communication" | "quality" | "punctuality";
  label: string;
  description: string;
}

const ratingCategories: RatingCategory[] = [
  {
    key: "overall",
    label: "Overall Rating",
    description: "How would you rate the student's overall performance?",
  },
  {
    key: "communication",
    label: "Communication",
    description: "How well did the student communicate?",
  },
  {
    key: "quality",
    label: "Work Quality",
    description: "How was the quality of work delivered?",
  },
  {
    key: "punctuality",
    label: "Punctuality",
    description: "How punctual and reliable was the student?",
  },
];

const ReviewStudentModal: React.FC<ReviewStudentModalProps> = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  const [ratings, setRatings] = useState<Record<string, number>>({
    overall: 0,
    communication: 0,
    quality: 0,
    punctuality: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({});

  const [createReview, { isLoading }] = useCreateReviewMutation();

  if (!isOpen || !application) return null;

  const handleStarClick = (category: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const handleStarHover = (category: string, rating: number) => {
    setHoveredRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const handleStarLeave = (category: string) => {
    setHoveredRatings((prev) => ({ ...prev, [category]: 0 }));
  };

  const handleSubmit = async () => {
    // Validate all ratings are provided
    const allRatingsProvided = Object.values(ratings).every((r) => r > 0);
    if (!allRatingsProvided) {
      toast.error("Please provide all ratings");
      return;
    }

    try {
      await createReview({
        application_id: application.application_id,
        overall_rating: ratings.overall,
        communication_rating: ratings.communication,
        quality_rating: ratings.quality,
        punctuality_rating: ratings.punctuality,
        review_text: reviewText || undefined,
      }).unwrap();

      toast.success("Review submitted successfully!");

      // Reset form
      setRatings({ overall: 0, communication: 0, quality: 0, punctuality: 0 });
      setReviewText("");

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit review");
    }
  };

  const renderStars = (category: string, currentRating: number) => {
    const displayRating = hoveredRatings[category] || currentRating;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(category, star)}
            onMouseEnter={() => handleStarHover(category, star)}
            onMouseLeave={() => handleStarLeave(category)}
            className="cursor-pointer focus:outline-none transition-transform hover:scale-110"
          >
            {star <= displayRating ? (
              <StarIconSolid className="h-8 w-8 text-yellow-400" />
            ) : (
              <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-200" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Review Student</h2>
              <p className="text-purple-100 text-sm mt-1">
                {application.student?.full_name} - {application.job?.job_title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="h-14 w-14 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
              {application.student?.profile_image_url ? (
                <img
                  src={application.student.profile_image_url}
                  alt={application.student.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {application.student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{application.student?.full_name}</h3>
              <p className="text-sm text-gray-500">{application.student?.email}</p>
            </div>
          </div>

          {/* Rating Categories */}
          <div className="space-y-6">
            {ratingCategories.map((category) => (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-medium text-gray-900">
                      {category.label}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  {ratings[category.key] > 0 && (
                    <span className="text-sm font-semibold text-purple-600">
                      {ratings[category.key]}/5
                    </span>
                  )}
                </div>
                {renderStars(category.key, ratings[category.key])}
              </div>
            ))}
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">
              Written Review <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
              rows={4}
              placeholder="Share your experience working with this student..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 text-right">{reviewText.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !Object.values(ratings).every((r) => r > 0)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStudentModal;
