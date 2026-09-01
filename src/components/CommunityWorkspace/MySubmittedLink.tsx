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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm pt-2 px-6 pb-3 h-[420px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900">
        My Submitted Link
      </h2>

      <p className="mt-0.5 text-sm text-gray-500">
        This is the profile currently visible for peer review.
      </p>

      <div className="mt-3 flex-1 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
        <InboxIcon className="w-13 h-13 text-gray-400" />

        <h3 className="mt-5 text-lg font-semibold text-gray-900">
          No Submitted Profile
        </h3>

        <p className="mt-2 text-gray-500 text-sm max-w-md">
          You haven't submitted your GitHub, LinkedIn or Portfolio yet.
          Submit your profile above to start receiving peer reviews.
        </p>
      </div>
    </div>
  );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm pt-2 px-6 pb-3 h-[430px] flex flex-col">
      {/* Header */}
      <div className="">
        <h3 className="text-lg font-semibold text-gray-900">
          My Submitted Link
        </h3>

        <p className="text-sm text-gray-500 mt-0.5">
          This is the profile currently visible for peer review.
        </p>
      </div>

      {/* Link Card */}
      <div className="mt-1.5 flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {submittedLinks.map((link) => (
          <SubmittedLinkCard key={link.id} submittedLink={link} />
        ))}
      </div>
    </div>
  );
};

export default MySubmittedLink;
