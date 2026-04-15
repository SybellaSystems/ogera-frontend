import React from "react";
import { useTranslation } from "react-i18next";
import type { TrustScore } from "../services/api/trustScoreApi";

interface TrustScoreCardProps {
  trustScore: TrustScore;
  isLoading?: boolean;
  /** Full profile card vs compact row for employer candidate lists */
  variant?: "full" | "compact";
}

const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  trustScore,
  isLoading = false,
  variant = "full",
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-24 bg-gray-200 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
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
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Emerging":
        return "bg-red-100 text-red-700 border-red-200";
      case "Limited":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const barColor = (score: number) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-blue-600";
    if (score >= 55) return "bg-orange-500";
    return "bg-red-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-orange-600";
    return "text-red-600";
  };

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span
          className={`text-sm font-bold ${getScoreColor(trustScore.trust_score)}`}
        >
          {t("profile.trustScoreShort")}: {trustScore.trust_score.toFixed(0)}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelColor(
            trustScore.level
          )}`}
        >
          {t(`profile.trustScoreLevel.${trustScore.level}`)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("profile.trustScore")}
        </h2>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${getLevelColor(
            trustScore.level
          )}`}
        >
          {t(`profile.trustScoreLevel.${trustScore.level}`)}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-500">
        <span>
          I/E/C · {t("profile.trustScoreFormulaHint")}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2 mb-2">
          <span
            className={`text-5xl font-bold ${getScoreColor(trustScore.trust_score)}`}
          >
            {trustScore.trust_score.toFixed(0)}
          </span>
          <span className="text-gray-500 text-xl mb-2">/ 100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${barColor(
              trustScore.trust_score
            )}`}
            style={{ width: `${Math.min(100, trustScore.trust_score)}%` }}
          />
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-6">{trustScore.description}</p>

      <div className="pt-6 border-t border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("profile.trustScoreBreakdownIEC")}
        </h3>
        <div className="space-y-4">
          {(
            [
              ["intelligence", trustScore.intelligence_percent, "#6366f1"],
              ["experience", trustScore.experience_percent, "#8b5cf6"],
              ["interaction", trustScore.interaction_percent, "#10b981"],
            ] as const
          ).map(([key, pct, color]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {t(`profile.trustScoreAxis.${key}`)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t("profile.trustScoreSuggestions")}
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          {trustScore.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrustScoreCard;
