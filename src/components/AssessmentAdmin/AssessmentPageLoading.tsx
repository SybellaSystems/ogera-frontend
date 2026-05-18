import React from "react";

const AssessmentPageLoading: React.FC<{ label?: string }> = ({ label = "Loading…" }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div
      className="h-10 w-10 rounded-full border-4 border-[#7F56D9]/20 border-t-[#7F56D9] animate-spin"
      aria-hidden
    />
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

export default AssessmentPageLoading;
