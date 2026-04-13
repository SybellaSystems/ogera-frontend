import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface JobCardProps {
  job: {
    job_id: string;
    job_title: string;
    location: string;
    duration: string;
    applicant_count: number;
    approved_students_count: number;
    task_count: number;
    disputed_task_count: number;
    overall_progress: number;
    completed_tasks?: number;
  };
  onManageClick: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onManageClick }) => {
  const completedTasks = job.completed_tasks || 0;
  const assignableTasks = job.task_count - completedTasks;

  const statCards = [
    {
      icon: BriefcaseIcon,
      label: "Applicants",
      value: job.applicant_count,
      bg: "bg-[#f5f3ff]",
      border: "border-[#e9d5ff]",
      textLabel: "text-[#7f56d9]",
      textValue: "text-[#6e48c7]",
    },
    {
      icon: CheckCircleIcon,
      label: "Approved Students",
      value: job.approved_students_count,
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      textLabel: "text-emerald-700",
      textValue: "text-emerald-900",
    },
    {
      icon: SparklesIcon,
      label: "Tasks Created",
      value: job.task_count,
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      textLabel: "text-indigo-700",
      textValue: "text-indigo-900",
    },
    {
      icon: CalendarIcon,
      label: "Disputed Tasks",
      value: job.disputed_task_count,
      bg: "bg-amber-50",
      border: "border-amber-200",
      textLabel: "text-amber-700",
      textValue: "text-amber-900",
    },
  ];

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-[#7f56d9] hover:shadow-lg hover:-translate-y-1">
      {/* Card Content */}
      <div className="p-6 space-y-5">
        {/* Job Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 leading-snug flex-1">
              {job.job_title}
            </h3>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f3ff] text-[#7f56d9] whitespace-nowrap">
              Active
            </span>
          </div>

          {/* Location & Duration */}
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span>{job.location}</span>
            </div>
            <div className="h-1 w-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>{job.duration}</span>
            </div>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border-2 ${stat.border} ${stat.bg} p-4 transition-colors group-hover:border-opacity-100 border-opacity-50`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${stat.textLabel}`}>
                      {stat.label}
                    </p>
                    <p className={`mt-2 text-2xl font-bold ${stat.textValue}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-5 w-5 ${stat.textLabel} opacity-40`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-gray-900">
              {job.overall_progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7f56d9] to-[#6e48c7] transition-all duration-500"
              style={{ width: `${job.overall_progress}%` }}
            />
          </div>

          {/* Breakdown */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
            <span>{completedTasks} completed</span>
            <span>•</span>
            <span>{assignableTasks} assignable</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onManageClick(job.job_id)}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7f56d9] px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#6e48c7] active:scale-95 group/btn"
        >
          <span>Manage Tasks</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
