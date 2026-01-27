import React from "react";
import type { TrustScore } from "../services/api/trustScoreApi";

interface TrustScoreCardProps {
  trustScore: TrustScore;
  isLoading?: boolean;
}

const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  trustScore,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: TrustScore["level"]) => {
    switch (level) {
      case "Exceptional":
        return "bg-green-100 text-green-700 border-green-200";
      case "Competent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Developing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Emerging":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Limited":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <svg
        className="w-5 h-5 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">TrustScore</h2>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${getLevelColor(
            trustScore.level
          )}`}
        >
          {trustScore.level}
        </span>
      </div>

      {/* Score Display */}
      <div className="mb-6">
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-5xl font-bold ${getScoreColor(trustScore.trust_score)}`}>
            {trustScore.trust_score.toFixed(0)}
          </span>
          <span className="text-gray-500 text-xl mb-2">/ 100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              trustScore.trust_score >= 85
                ? "bg-green-600"
                : trustScore.trust_score >= 70
                ? "bg-blue-600"
                : trustScore.trust_score >= 55
                ? "bg-yellow-600"
                : trustScore.trust_score >= 40
                ? "bg-orange-600"
                : "bg-red-600"
            }`}
            style={{ width: `${trustScore.trust_score}%` }}
          ></div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6">{trustScore.description}</p>

      {/* Verification Status */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Verification Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email Verification */}
          <div
            className={`p-4 rounded-lg border-2 ${
              trustScore.email_verified
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Email</span>
              {getVerificationIcon(trustScore.email_verified)}
            </div>
            <p className="text-sm text-gray-600">
              {trustScore.breakdown.email_verification_score.toFixed(1)} points
            </p>
          </div>

          {/* Phone Verification */}
          <div
            className={`p-4 rounded-lg border-2 ${
              trustScore.phone_verified
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Phone</span>
              {getVerificationIcon(trustScore.phone_verified)}
            </div>
            <p className="text-sm text-gray-600">
              {trustScore.breakdown.phone_verification_score.toFixed(1)} points
            </p>
          </div>

          {/* Academic Verification */}
          <div
            className={`p-4 rounded-lg border-2 ${
              trustScore.academic_verified
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Academic</span>
              {getVerificationIcon(trustScore.academic_verified)}
            </div>
            <p className="text-sm text-gray-600">
              {trustScore.breakdown.academic_verification_score.toFixed(1)} points
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Score Breakdown
        </h3>
        <div className="space-y-3">
          {/* Email Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                Email Verification
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {trustScore.breakdown.email_verification_score.toFixed(2)} / 33.33
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${
                    (trustScore.breakdown.email_verification_score / 33.33) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Phone Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                Phone Verification
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {trustScore.breakdown.phone_verification_score.toFixed(2)} / 33.33
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${
                    (trustScore.breakdown.phone_verification_score / 33.33) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Academic Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                Academic Verification
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {trustScore.breakdown.academic_verification_score.toFixed(2)} / 33.34
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    (trustScore.breakdown.academic_verification_score / 33.34) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCard;

