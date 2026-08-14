import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { JobReferral } from "../../type/jobs/referral";
import { getReferrals } from "../../services/referralStorage";

/**
 * Helper component to cleanly format raw job descriptions with embedded bullet points
 * into structured headings, paragraphs, and list items without modifying data.
 */
const FormattedDescription: React.FC<{ content: string }> = ({ content }) => {
  // Split the description into chunks based on common text patterns/newlines
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);

  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="my-2 list-disc space-y-1.5 pl-5 text-sm text-gray-600">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item.replace(/^[•\-\*]\s*/, "")}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    // Check if it's a heading-like line (e.g., ends with ':' or matches common sections)
    const isHeading =
      line.endsWith(":") ||
      [
        "Responsibilities include:",
        "Qualifications:",
        "Start date:",
        "Work location:",
        "Benefits:",
        "Eligibility:",
        "Application deadline:",
      ].some((h) => line.toLowerCase() === h.toLowerCase());

    // Check if line is a bullet point
    const isBullet = line.startsWith("•") || line.startsWith("- ") || line.startsWith("* ");

    if (isBullet) {
      currentListItems.push(line);
    } else {
      flushList(`flush-${index}`);
      if (isHeading) {
        elements.push(
          <h4 key={index} className="mt-4 mb-1.5 text-xs font-bold tracking-wider text-gray-900 uppercase">
            {line}
          </h4>
        );
      } else {
        elements.push(
          <p key={index} className="mt-2 text-sm leading-relaxed text-gray-600">
            {line}
          </p>
        );
      }
    }
  });

  flushList("final");

  return <div className="space-y-1">{elements}</div>;
};

const RecommendedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<JobReferral[]>([]);

  useEffect(() => {
    const allReferrals = getReferrals();
    const activeReferrals = allReferrals.filter(
      (referral) => referral.status === "active",
    );
    setReferrals(activeReferrals);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Recommended Jobs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Curated and verified career opportunities to kickstart your professional journey.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
              {referrals.length} Active Opportunities
            </span>
          </div>
        </div>

        {/* Information Banner */}
        <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/30 p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-blue-600 mt-0.5">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed text-blue-900">
              These opportunities are sourced from verified external employers. Ogera reviews each listing prior to sharing. Applications are securely completed directly on the official employer platform.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {referrals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              No recommended jobs available
            </h2>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              The Ogera team is currently evaluating new listings tailored for students. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {referrals.map((job) => (
              <div
                key={job.id}
                className="group rounded-2xl border border-gray-200/80 bg-white p-6 md:p-7 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                        {job.type}
                      </span>
                      {job.category && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {job.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {job.company} <span className="text-gray-300 mx-1.5">•</span> <span className="text-gray-500 font-normal">{job.location}</span>
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified Opportunity
                  </span>
                </div>

                {/* Formatted Description Block */}
                <div className="mt-5 rounded-xl bg-gray-50/50 p-4 border border-gray-100">
                  <FormattedDescription content={job.description} />
                </div>

                {/* Metadata Grid */}
                <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</p>
                      <p className="text-sm font-semibold text-gray-800">{job.category || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Source</p>
                      <p className="text-sm font-semibold text-gray-800">{job.source || "External employer"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Deadline</p>
                      <p className="text-sm font-semibold text-gray-800">{job.expiryDate || "See original posting"}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/jobs/recommended/${job.id}`)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-[0.98]"
                  >
                    View Full Details & Apply
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;