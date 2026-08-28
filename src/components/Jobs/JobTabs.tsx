import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { tabs } from "./Constant";
import TabCountBadge from "../TabCountBadge";
type JobTabsProps = {
  count: {
    All: number;
    Pending: number;
    Verified: number;
    Active: number;
    Closed: number;
  };
  onTabChange?: (tab: (typeof tabs)[number]) => void;
};
const JobTabs = ({ count, onTabChange }: JobTabsProps) => {
  const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
    const handleTabClick = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
    return (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 pl-5 pr-5 pt-3">
         <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`relative cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-purple-600 text-white"
                  : "text-purple-600 hover:bg-purple-100"
              }`}
            >
               <TabCountBadge counts={count[tab]} />
              {tab}
      
            </button>
          ))}

          <button
            type="button"
            onClick={() => navigate("/dashboard/jobs/referral-analytics")}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            View Referral Analytics
          </button>
        </div>
        </div>
    )
}
export default JobTabs;