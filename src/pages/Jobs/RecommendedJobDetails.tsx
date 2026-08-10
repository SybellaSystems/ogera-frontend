import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const RecommendedJobDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard/jobs/recommended")}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Opportunities
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                One Acre Fund
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                Nigeria Recruitment Intern
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Minna, Niger State, Nigeria · Internship
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Verified by Ogera
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              About this opportunity
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              One Acre Fund is looking for a curious and eager-to-learn
              professional to kickstart their recruitment career by gaining
              practical experience in recruitment operations and candidate
              experience.
            </p>
          </div>

          <div className="mt-8 rounded-lg bg-gray-50 p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Why are you seeing this?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              The Ogera team found and reviewed this opportunity and believes
              it may be relevant to students using the platform.
            </p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500">
              Referral ID: {id}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              You will complete your application on the employer's original
              platform.
            </p>

            <button
              type="button"
              className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply on Original Platform →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedJobDetails;