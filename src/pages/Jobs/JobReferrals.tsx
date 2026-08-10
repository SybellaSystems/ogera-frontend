import React, { useState } from "react";

type ReferralStatus = "all" | "pending" | "verified" | "active";

interface JobReferral {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  status: "pending" | "verified" | "active";
  description: string;
  source: string;
}

const referralJobs: JobReferral[] = [
  {
    id: "REF-001",
    title: "Nigeria Recruitment Intern",
    company: "One Acre Fund",
    location: "Minna, Niger State, Nigeria",
    type: "Internship",
    category: "Recruitment",
    status: "verified",
    description:
      "One Acre Fund is looking for a curious and eager-to-learn intern to support its recruitment department and gain practical experience in recruitment operations.",
    source: "One Acre Fund Careers",
  },
];

const JobReferrals: React.FC = () => {
  const [status, setStatus] = useState<ReferralStatus>("all");

  const tabs: { label: string; value: ReferralStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Active", value: "active" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Job Referrals
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Verified job opportunities curated by the Ogera team.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="mt-6 flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition ${
              status === tab.value
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current Filter */}
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Showing:{" "}
          <span className="font-medium capitalize text-gray-900">
            {status}
          </span>
        </p>
      </div>

    <div className="mt-6 space-y-4">
  {referralJobs
    .filter((job) => status === "all" || job.status === status)
    .map((job) => (
      <div
        key={job.id}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {job.title}
            </h2>

            <p className="mt-1 text-sm font-medium text-gray-700">
              {job.company}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {job.location} · {job.type}
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Verified
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-600">
          {job.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-500">
            Source: {job.source}
          </span>

          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View Opportunity
          </button>
        </div>
      </div>
    ))}
</div>
    </div>
  );
};

export default JobReferrals;