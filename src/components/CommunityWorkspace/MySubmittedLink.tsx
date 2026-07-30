import React from "react";
import { InboxIcon } from "@heroicons/react/24/outline";
import {
  useGetMyStudentLinkQuery,
} from "@/services/api/communityWorkspace.api";
import SubmittedLinkCard from "./SubmittedLinkCard";

// import { submittedLink } from "./mockData";

const MySubmittedLink: React.FC = () => {
  const { data, isLoading, isError } = useGetMyStudentLinkQuery();
  const submittedLinks = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mt-4">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mt-4">
        Failed to load your submitted profile.
      </div>
    );
  }

  if (submittedLinks.length === 0) {
     return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-[420px] flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-900">
        My Submitted Link
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        This is the profile currently visible for peer review.
      </p>

      <div className="mt-6 flex-1 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
        <InboxIcon className="w-14 h-14 text-gray-400" />

        <h3 className="mt-5 text-2xl font-semibold text-gray-900">
          No Submitted Profile
        </h3>

        <p className="mt-2 text-gray-500 max-w-md">
          You haven't submitted your GitHub, LinkedIn or Portfolio yet.
          Submit your profile above to start receiving peer reviews.
        </p>
      </div>
    </div>
  );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-[420px] flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          My Submitted Link
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          This is the profile currently visible for peer review.
        </p>
      </div>

      {/* Link Card */}
      <div className="mt-6 flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {submittedLinks.map((link) => (
          <SubmittedLinkCard key={link.id} submittedLink={link} />
        ))}
      </div>
    </div>
  );
};

export default MySubmittedLink;
