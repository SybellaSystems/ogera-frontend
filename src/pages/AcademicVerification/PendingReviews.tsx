import React from "react";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";

const PendingReviews: React.FC = () => {
  const reviews = [
    {
      id: 1,
      student: "John Doe",
      university: "MIT",
      degree: "Computer Science",
      gpa: "3.8",
      submittedDate: "2024-03-10",
      documents: 3,
    },
    {
      id: 2,
      student: "Emily Brown",
      university: "Harvard",
      degree: "Business Admin",
      gpa: "3.9",
      submittedDate: "2024-03-12",
      documents: 4,
    },
    {
      id: 3,
      student: "Michael Chen",
      university: "Stanford",
      degree: "Engineering",
      gpa: "3.7",
      submittedDate: "2024-03-14",
      documents: 3,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <DocumentCheckIcon className="h-10 w-10 text-orange-600" />
          Pending Reviews
        </h1>
        <p className="text-gray-500 mt-2">
          Academic verifications waiting for review
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Pending Reviews</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">
            {reviews.length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Avg Review Time</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">2.5 days</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">This Week</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">45</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                    {review.student.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.student}
                    </h3>
                    <p className="text-sm text-gray-500">{review.university}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Degree</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.degree}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">GPA</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.gpa}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Documents
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.documents} files
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Submitted
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.submittedDate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-6">
                <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap">
                  Approve
                </button>
                <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap">
                  Reject
                </button>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md whitespace-nowrap">
                  View Docs
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingReviews;
