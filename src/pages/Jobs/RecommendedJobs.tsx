import React from "react";
import { useNavigate } from "react-router-dom";

interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  description: string;
}

const recommendedJobs: RecommendedJob[] = [
  {
    id: "REF-001",
    title: "Nigeria Recruitment Intern",
    company: "One Acre Fund",
    location: "Minna, Niger State, Nigeria",
    type: "Internship",
    category: "Recruitment",
    description:
      "A recruitment internship opportunity for candidates interested in gaining practical experience in recruitment operations and candidate experience.",
  },
];

const RecommendedJobs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Opportunities for You
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Verified opportunities found and reviewed by the Ogera team.
          </p>
        </div>

        <div className="space-y-4">
          {recommendedJobs.map((job) => (
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
                <span className="text-xs text-gray-400">
                  Recommended by Ogera
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/jobs/recommended/${job.id}`)
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Opportunity
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedJobs;