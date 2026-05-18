import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PuzzlePieceIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import {
  useListProblemMetricsAdminQuery,
  useCreateProblemMetricMutation,
  useDeleteProblemMetricMutation,
  type ProblemMetricCategory,
} from "../../services/api/problemMetricApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import ConfirmDeleteModal from "../../components/AssessmentAdmin/ConfirmDeleteModal";
import AssessmentHubCard from "../../components/AssessmentAdmin/AssessmentHubCard";
import AssessmentPageLoading from "../../components/AssessmentAdmin/AssessmentPageLoading";

const CATEGORY_LABELS: Record<ProblemMetricCategory, string> = {
  visual_puzzle: "Visual puzzle",
  situational_puzzle: "Situational puzzle",
  riddle: "Riddle",
  other: "Other puzzle",
};

const ProblemMetricsHub: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useListProblemMetricsAdminQuery();
  const [createMetric, { isLoading: creating }] = useCreateProblemMetricMutation();
  const [deleteMetric, { isLoading: deleting }] = useDeleteProblemMetricMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProblemMetricCategory>("visual_puzzle");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const metrics = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return metrics;
    return metrics.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.replaceAll("_", " ").toLowerCase().includes(q) ||
        (m.description?.toLowerCase().includes(q) ?? false)
    );
  }, [metrics, search]);

  const stats = useMemo(
    () => ({
      total: metrics.length,
      published: metrics.filter((m) => m.published).length,
      draft: metrics.filter((m) => !m.published).length,
    }),
    [metrics]
  );

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const res = await createMetric({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      }).unwrap();
      toast.success(res.message || "Problem metric created");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setCategory("visual_puzzle");
      const id = res.data?.problem_metric_id;
      if (id) navigate(`/dashboard/problem-metrics/edit/${id}`);
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Could not create problem metric");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMetric(deleteTarget.id).unwrap();
      toast.success("Puzzle set deleted");
      setDeleteTarget(null);
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-[#7F56D9] to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm">
              <PuzzlePieceIcon className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Problem metrics</h1>
              <p className="text-sm text-white/80 mt-1 max-w-lg">
                Create puzzle questions, publish sets, and let students build intelligence through practice.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-semibold shadow-lg hover:bg-white/95 transition shrink-0"
          >
            <PlusIcon className="w-5 h-5" />
            New puzzle set
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total sets", value: stats.total, icon: ChartBarIcon, color: "text-indigo-600" },
          { label: "Published", value: stats.published, icon: GlobeAltIcon, color: "text-emerald-600" },
          { label: "Drafts", value: stats.draft, icon: LockClosedIcon, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search puzzle sets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 pl-12 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]/40 focus:border-[#7F56D9]"
        />
      </div>

      {showCreate && (
        <div className="rounded-2xl border-2 border-indigo-300/50 dark:border-indigo-500/30 bg-white dark:bg-gray-900/50 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Create puzzle set</h2>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#7F56D9]/30"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Visual puzzles — Set A"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Description (optional)
              </span>
              <textarea
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm min-h-[80px] focus:ring-2 focus:ring-[#7F56D9]/30"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Puzzle type</span>
              <select
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemMetricCategory)}
              >
                {(Object.keys(CATEGORY_LABELS) as ProblemMetricCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="px-5 py-2 text-sm rounded-xl bg-[#7F56D9] text-white font-semibold disabled:opacity-50 shadow-lg shadow-[#7F56D9]/25"
            >
              {creating ? "Creating…" : "Create & add questions"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <AssessmentPageLoading label="Loading puzzle sets…" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/30 p-12 text-center">
          <PuzzlePieceIcon className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {search ? "No puzzle sets match your search" : "No problem metrics yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {search
              ? "Try a different search term."
              : "Create visual, situational, or riddle puzzles for students."}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7F56D9] text-white px-5 py-2.5 text-sm font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              Create first puzzle set
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((metric) => (
            <AssessmentHubCard
              key={metric.problem_metric_id}
              id={metric.problem_metric_id}
              title={metric.title}
              categoryLabel={CATEGORY_LABELS[metric.category]}
              questionCount={metric.question_count}
              published={metric.published}
              editPath={`/dashboard/problem-metrics/edit/${metric.problem_metric_id}`}
              onDelete={() =>
                setDeleteTarget({ id: metric.problem_metric_id, title: metric.title })
              }
            />
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete puzzle set?"
        message="This will permanently remove the puzzle set and all its questions. This cannot be undone."
        itemName={deleteTarget?.title}
        isDeleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProblemMetricsHub;
