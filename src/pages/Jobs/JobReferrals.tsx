
import JobCards from "../../components/Jobs/JobCards";
import JobTabs from "../../components/Jobs/JobTabs";
import type { ReferralTab } from "../../services/api/jobReferralsApi";
import JobApiCall from "../../components/Jobs/JobsAPiCall";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
const JobReferrals: React.FC = () => {
  const [tab, setTab] = useState<ReferralTab>("all");
  const { data: closedCountData } = JobApiCall(tab);
  
  const closedCount = closedCountData?.data?.counts?.closed ?? 0;
  const all = closedCountData?.data?.counts?.all ?? 0;
  const pending = closedCountData?.data?.counts?.pending_verification ?? 0;
  const verified = closedCountData?.data?.counts?.verified ?? 0;
  const active = closedCountData?.data?.counts?.active ?? 0;
  console.log(closedCountData, "closedCountData");
  const counts = {
    All: all,
    Pending: pending,
    Verified: verified,
    Active: active,
    Closed: closedCount,
  };
const referrals = closedCountData?.data?.referrals ?? [];
console.log(referrals, "referrals");
  useEffect(() => {}, [closedCountData]);

  const handleTabChange = (tab: string): void => {
  switch (tab.toLowerCase()) {
    case "pending":
      setTab("pending");
      break;

    case "verified":
      setTab("verified");
      break;

    case "active":
      setTab("active");
      break;

    case "closed":
      setTab("closed");
      break;

    case "all":
    default:
      setTab("all");
      break;
  }
};

const getEmptyStateContent = () => {
  switch (tab) {
    case "pending":
      return {
        title: "No Pending Referrals",
        description:
          "There are no job referrals waiting for verification at the moment.",
      };

    case "verified":
      return {
        title: "No Verified Referrals",
        description:
          "There are no verified job referrals available right now.",
      };

    case "active":
      return {
        title: "No Active Referrals",
        description:
          "There are currently no active job referrals available.",
      };

    case "closed":
      return {
        title: "No Closed Referrals",
        description:
          "There are no closed job referrals to display.",
      };

    case "all":
    default:
      return {
        title: "No Job Referrals Yet",
        description:
          "There are currently no job referrals available. Create a new referral to start building your job opportunities.",
      };
  }
};

const emptyState = getEmptyStateContent();

 const handleViewMore = () => {
    navigate(
      `/dashboard/jobs/referrals/all?status=${tab}`
    );
  };

  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Referrals</h1>

          <p className="mt-1 text-sm text-gray-600">
            External job opportunities found, verified, and curated by the Ogera
            team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/jobs/referrals/create")}
          className="flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-purple-700 active:scale-95"
        >
          + Create Referral
        </button>
      </div>

      <JobTabs count={counts} onTabChange={handleTabChange} />
      {/* <JobCards jobs={referrals} /> */}
      {referrals.length > 0 ? (
  <JobCards jobs={referrals} />
) : (
  <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12 shadow-sm">
    <div className="max-w-md text-center">
      {/* Icon */}
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-violet-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V7a2 2 0 00-2-2h-3.5l-1.2-1.5a2 2 0 00-1.56-.75H7a2 2 0 00-2 2v8m15 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4m8 0v3"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900">
        {emptyState.title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {emptyState.description}
      </p>

      <div className="mt-6 flex justify-center gap-3">

        <button
          type="button"
          onClick={() => navigate("/dashboard/jobs/referrals/create")}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-purple-700 active:scale-95"
        >
          + Create Referral
        </button>
      </div>
    </div>
  </div>
)}

      {/* View More */}
      {referrals.length >= 9&& (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleViewMore}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-purple-700 active:scale-95"
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
};
export default JobReferrals;
