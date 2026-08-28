import { useGetAllJobReferralsQuery } from "@/services/api/jobReferralsApi";
import type { ReferralTab } from "@/services/api/jobReferralsApi";

const JobApiCall = (tab: ReferralTab) => {
  const { data: closedCountData } = useGetAllJobReferralsQuery({
    page: 1,
    limit: 9,
    status: tab,
    all: false,
  });

  return {
    data: closedCountData,
  };
};

export default JobApiCall;
