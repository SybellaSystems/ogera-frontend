import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  StarIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const StudentPerformanceReport: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "earnings">(
    "overview"
  );

  // Mock student data - replace with API call
  const studentData = {
    id: studentId || "1",
    name: "John Doe",
    email: "john.doe@example.com",
    university: "MIT",
    gpa: "3.8",
    joinedDate: "2023-09-15",
    status: "Active",
    profileCompletion: 95,
    rating: 4.8,
    jobsCompleted: 12,
    totalEarnings: "$2,450",
    monthlyEarnings: "$450",
    engagement: "High",
    completionRate: 94,
    trend: "+12%",
    responseTime: "2 hours",
    acceptanceRate: 87,
    repeatClientRate: 65,
    jobsInProgress: 1,
    nextMilestone: "Top Performer Badge",
    previousRating: 4.7,
    previousEarnings: "$2,180",
  };

  const jobHistory = [
    {
      id: 1,
      title: "Data Analysis Project",
      company: "TechCorp",
      amount: "$450",
      status: "Completed",
      rating: 5,
      date: "Jan 20, 2026",
    },
    {
      id: 2,
      title: "Web Development Task",
      company: "StartupXYZ",
      amount: "$350",
      status: "Completed",
      rating: 4.8,
      date: "Jan 15, 2026",
    },
    {
      id: 3,
      title: "Content Writing",
      company: "MediaHub",
      amount: "$200",
      status: "Completed",
      rating: 4.5,
      date: "Jan 10, 2026",
    },
  ];

  const monthlyEarningsData = [
    { month: "Nov", earnings: "$1,800" },
    { month: "Dec", earnings: "$2,100" },
    { month: "Jan", earnings: "$2,450" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/academic/performance")}
            className="p-2 hover:bg-gray-200 rounded-lg transition cursor-pointer"
            title="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              Performance Report
            </h1>
            <p className="text-gray-500 mt-1">
              Detailed analytics for {studentData.name}
            </p>
          </div>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2 cursor-pointer">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Download Report
        </button>
      </div>

      {/* Student Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl">
              {studentData.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{studentData.name}</h2>
              <p className="text-white/80 mt-1">{studentData.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {studentData.university}
                </span>
                <span className="px-3 py-1 bg-green-400/30 rounded-full text-sm font-medium">
                  {studentData.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <StarIcon className="h-6 w-6 fill-yellow-300 text-yellow-300" />
              <span className="text-3xl font-bold">{studentData.rating}</span>
            </div>
            <p className="text-white/80 text-sm">Overall Rating</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">Profile Completion</p>
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{studentData.profileCompletion}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${studentData.profileCompletion}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{studentData.totalEarnings}</p>
          <p className="text-xs text-green-600 mt-2">
            {studentData.trend} from last month
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">Jobs Completed</p>
            <BriefcaseIcon className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{studentData.jobsCompleted}</p>
          <p className="text-xs text-gray-600 mt-2">
            {studentData.jobsInProgress} in progress
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{studentData.completionRate}%</p>
          <p className="text-xs text-emerald-600 mt-2">Excellent performance</p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-4">Response Time</p>
          <p className="text-2xl font-bold text-gray-900">{studentData.responseTime}</p>
          <p className="text-xs text-gray-500 mt-2">Average response to job offers</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-4">Acceptance Rate</p>
          <p className="text-2xl font-bold text-gray-900">{studentData.acceptanceRate}%</p>
          <p className="text-xs text-gray-500 mt-2">Job offer acceptance</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-4">Repeat Clients</p>
          <p className="text-2xl font-bold text-gray-900">{studentData.repeatClientRate}%</p>
          <p className="text-xs text-gray-500 mt-2">Return client rate</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === "overview"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === "jobs"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Job History
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === "earnings"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Earnings
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                  Performance Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">GPA</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {studentData.gpa}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Engagement Level</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {studentData.engagement}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {new Date(studentData.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Milestone</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {studentData.nextMilestone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Rating Comparison</h3>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-sm text-gray-600 text-center">Current Rating</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">
                      {studentData.rating}
                    </p>
                  </div>
                  <div className="flex-1 h-32 bg-white rounded-lg p-4 flex items-end justify-around border border-gray-200">
                    <div className="text-center">
                      <div
                        className="w-12 bg-gray-300 rounded-lg mx-auto"
                        style={{ height: `${(4.5 / 5) * 100}px` }}
                      ></div>
                      <p className="text-xs text-gray-600 mt-2">Previous</p>
                      <p className="font-bold">{studentData.previousRating}</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-12 bg-green-500 rounded-lg mx-auto"
                        style={{ height: `${(studentData.rating / 5) * 100}px` }}
                      ></div>
                      <p className="text-xs text-gray-600 mt-2">Current</p>
                      <p className="font-bold">{studentData.rating}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="space-y-4">
              {jobHistory.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                      <p className="text-xs text-gray-500 mt-2">{job.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{job.amount}</p>
                      <div className="flex items-center gap-1 justify-end mt-2">
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{job.rating}</span>
                      </div>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mt-2">
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Earnings Trend</h3>
                <div className="flex items-end justify-around h-48 gap-4">
                  {monthlyEarningsData.map((data, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div className="bg-gradient-to-t from-orange-500 to-amber-400 rounded-lg mx-auto mb-2 transition hover:shadow-lg"
                        style={{
                          height: `${(parseInt(data.earnings.replace(/[\$,]/g, "")) / 2500) * 150}px`,
                        }}
                      ></div>
                      <p className="font-bold text-gray-900">{data.earnings}</p>
                      <p className="text-sm text-gray-600 mt-1">{data.month}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-600 font-medium">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {studentData.monthlyEarnings}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    +21% vs last month
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-600 font-medium">Average Per Job</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${(2450 / 12).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">Across 12 completed jobs</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Student</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <button className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
            <EnvelopeIcon className="h-5 w-5" />
            Send Email
          </button>
          <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
            <BriefcaseIcon className="h-5 w-5" />
            Send Job Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceReport;
