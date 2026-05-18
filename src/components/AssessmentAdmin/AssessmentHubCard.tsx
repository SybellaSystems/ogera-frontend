import React from "react";
import { Link } from "react-router-dom";
import {
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface AssessmentHubCardProps {
  id: string;
  title: string;
  categoryLabel: string;
  questionCount: number;
  published: boolean;
  editPath: string;
  onDelete: () => void;
}

const AssessmentHubCard: React.FC<AssessmentHubCardProps> = ({
  title,
  categoryLabel,
  questionCount,
  published,
  editPath,
  onDelete,
}) => (
  <article className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 p-5 shadow-sm hover:shadow-md hover:border-[#7F56D9]/30 transition-all duration-200">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7F56D9]/10 text-[#7F56D9]">
        <DocumentTextIcon className="h-6 w-6" />
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          published
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        }`}
      >
        {published ? (
          <>
            <GlobeAltIcon className="h-3.5 w-3.5" /> Published
          </>
        ) : (
          <>
            <LockClosedIcon className="h-3.5 w-3.5" /> Draft
          </>
        )}
      </span>
    </div>

    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">{title}</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-4">{categoryLabel}</p>

    <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-bold text-gray-900 dark:text-white">{questionCount}</span>{" "}
        question{questionCount === 1 ? "" : "s"}
      </span>
      <div className="flex items-center gap-1">
        <Link
          to={editPath}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#7F56D9] hover:bg-[#7F56D9]/10 transition"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </article>
);

export default AssessmentHubCard;
