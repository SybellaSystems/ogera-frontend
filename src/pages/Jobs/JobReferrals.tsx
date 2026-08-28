
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
      <JobCards jobs={referrals} />

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
