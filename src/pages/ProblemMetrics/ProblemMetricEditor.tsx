import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  TrashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import ConfirmDeleteModal from "../../components/AssessmentAdmin/ConfirmDeleteModal";
import AssessmentPageLoading from "../../components/AssessmentAdmin/AssessmentPageLoading";
import {
  useGetProblemMetricAdminQuery,
  useUpdateProblemMetricMutation,
  useDeleteProblemMetricMutation,
  useAddProblemMetricQuestionMutation,
  useUpdateProblemMetricQuestionMutation,
  useDeleteProblemMetricQuestionMutation,
  type ProblemMetricCategory,
  type ProblemQuestionDifficulty,
} from "../../services/api/problemMetricApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const ProblemMetricEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data, isLoading, refetch } = useGetProblemMetricAdminQuery(id!, { skip: !id });
  const [updateMetric, { isLoading: savingMeta }] = useUpdateProblemMetricMutation();
  const [deleteMetric, { isLoading: deleting }] = useDeleteProblemMetricMutation();
  const [addQuestion, { isLoading: addingQ }] = useAddProblemMetricQuestionMutation();
  const [updateQuestion, { isLoading: updatingQ }] = useUpdateProblemMetricQuestionMutation();
  const [deleteQuestion] = useDeleteProblemMetricQuestionMutation();

  const metric = data?.data;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProblemMetricCategory>("visual_puzzle");
  const [metaDirty, setMetaDirty] = useState(false);

  React.useEffect(() => {
    if (metric) {
      setTitle(metric.title);
      setDescription(metric.description || "");
      setCategory(metric.category);
      setMetaDirty(false);
    }
  }, [metric?.problem_metric_id, metric?.title, metric?.description, metric?.category]);

  const [qPrompt, setQPrompt] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correct, setCorrect] = useState<0 | 1 | 2 | 3>(0);
  const [difficulty, setDifficulty] = useState<ProblemQuestionDifficulty>("medium");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const sortedQuestions = useMemo(() => {
    if (!metric?.questions) return [];
    return [...metric.questions].sort((a, b) => a.sort_order - b.sort_order);
  }, [metric?.questions]);

  const saveMeta = async () => {
    if (!id) return;
    try {
      await updateMetric({
        id,
        body: {
          title: title.trim(),
          description: description.trim() || null,
          category,
        },
      }).unwrap();
      toast.success("Problem metric saved");
      setMetaDirty(false);
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Save failed");
    }
  };

  const togglePublish = async () => {
    if (!id || !metric) return;
    try {
      await updateMetric({
        id,
        body: { published: !metric.published },
      }).unwrap();
      toast.success(metric.published ? "Unpublished" : "Published for students");
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleDeleteMetric = async () => {
    if (!id) return;
    try {
      await deleteMetric(id).unwrap();
      toast.success("Problem metric deleted");
      setShowDeleteModal(false);
      navigate("/dashboard/problem-metrics");
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  const handleAddQuestion = async () => {
    if (!id) return;
    if (!qPrompt.trim()) {
      toast.error("Enter the question text");
      return;
    }
    if (![optA, optB, optC, optD].every((o) => o.trim())) {
      toast.error("All four options are required");
      return;
    }
    try {
      await addQuestion({
        testId: id,
        body: {
          prompt: qPrompt.trim(),
          option_a: optA.trim(),
          option_b: optB.trim(),
          option_c: optC.trim(),
          option_d: optD.trim(),
          correct_index: correct,
          difficulty,
        },
      }).unwrap();
      toast.success("Question added");
      setQPrompt("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setCorrect(0);
      setDifficulty("medium");
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Could not add question");
    }
  };

  const startEditQuestion = (q: (typeof sortedQuestions)[number]) => {
    setEditingQuestionId(q.question_id);
    setQPrompt(q.prompt);
    setOptA(q.option_a);
    setOptB(q.option_b);
    setOptC(q.option_c);
    setOptD(q.option_d);
    setCorrect(q.correct_index as 0 | 1 | 2 | 3);
    setDifficulty(q.difficulty);
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQPrompt("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrect(0);
    setDifficulty("medium");
  };

  const handleSaveEditedQuestion = async () => {
    if (!id || !editingQuestionId) return;
    if (!qPrompt.trim()) {
      toast.error("Enter the question text");
      return;
    }
    if (![optA, optB, optC, optD].every((o) => o.trim())) {
      toast.error("All four options are required");
      return;
    }
    try {
      await updateQuestion({
        testId: id,
        questionId: editingQuestionId,
        body: {
          prompt: qPrompt.trim(),
          option_a: optA.trim(),
          option_b: optB.trim(),
          option_c: optC.trim(),
          option_d: optD.trim(),
          correct_index: correct,
          difficulty,
        },
      }).unwrap();
      toast.success("Question updated");
      resetQuestionForm();
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Could not update question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!id || !window.confirm("Remove this question?")) return;
    try {
      await deleteQuestion({ testId: id, questionId }).unwrap();
      toast.success("Question removed");
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Could not delete");
    }
  };

  if (!id) {
    return <p className="p-8 text-center text-gray-500">Missing problem metric id</p>;
  }

  if (isLoading || !metric) {
    return (
      <div className="max-w-5xl mx-auto">
        <AssessmentPageLoading label="Loading puzzle set…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard/problem-metrics"
          className="inline-flex items-center gap-1 text-sm text-[#7F56D9] font-medium hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          All problem metrics
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit puzzle set</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={togglePublish}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                metric.published
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {metric.published ? (
                <>
                  <GlobeAltIcon className="w-4 h-4" /> Published
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-4 h-4" /> Click to publish
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              Delete puzzle set
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Title</span>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setMetaDirty(true);
              }}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[72px]"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setMetaDirty(true);
              }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 uppercase">Puzzle type</span>
            <select
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ProblemMetricCategory);
                setMetaDirty(true);
              }}
            >
              <option value="visual_puzzle">Visual puzzle</option>
              <option value="situational_puzzle">Situational puzzle</option>
              <option value="riddle">Riddle</option>
              <option value="other">Other puzzle</option>
            </select>
          </label>
        </div>
        {metaDirty && (
          <button
            type="button"
            disabled={savingMeta}
            onClick={saveMeta}
            className="px-4 py-2 rounded-xl bg-[#7F56D9] text-white text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {savingMeta ? "Saving..." : "Save details"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {editingQuestionId ? "Edit question" : "Add question"}
        </h2>
        <p className="text-sm text-gray-500">
          Add each puzzle question with four MCQs, one correct answer, and the selected difficulty.
          The question must match the selected puzzle type.
        </p>
        <div className="rounded-xl border border-[#7F56D9]/20 bg-[#7F56D9]/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
          {category === "visual_puzzle" && "Visual puzzle accepts only visual-related questions such as shapes, patterns, figures, symbols, or diagrams."}
          {category === "situational_puzzle" && "Situational puzzle accepts only scenario-based questions focused on actions, decisions, or next steps."}
          {category === "riddle" && "Riddle accepts only riddle-style or clue-based questions."}
          {category === "other" && "Other puzzle can accept any puzzle question format."}
        </div>
        <label className="block">
          <span className="text-xs font-medium text-gray-500 uppercase">Question</span>
          <textarea
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[80px]"
            value={qPrompt}
            onChange={(e) => setQPrompt(e.target.value)}
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["A", optA, setOptA],
              ["B", optB, setOptB],
              ["C", optC, setOptC],
              ["D", optD, setOptD],
            ] as const
          ).map(([label, val, setVal]) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-gray-500">Option {label}</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase block mb-2">Correct option</span>
            <div className="flex gap-2">
              {([0, 1, 2, 3] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCorrect(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold cursor-pointer ${
                    correct === i
                      ? "bg-[#7F56D9] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className="text-xs font-medium text-gray-500 uppercase block mb-2">Difficulty</span>
            <select
              className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ProblemQuestionDifficulty)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          disabled={addingQ || updatingQ}
          onClick={editingQuestionId ? handleSaveEditedQuestion : handleAddQuestion}
          className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {editingQuestionId ? (updatingQ ? "Saving..." : "Save question") : addingQ ? "Adding..." : "Add question"}
        </button>
        {editingQuestionId && (
          <button
            type="button"
            onClick={resetQuestionForm}
            className="ml-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium cursor-pointer"
          >
            Cancel edit
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">Questions ({sortedQuestions.length})</h2>
        {sortedQuestions.length === 0 ? (
          <p className="text-sm text-gray-500">No questions yet. Add at least one before publishing.</p>
        ) : (
          <ul className="space-y-3">
            {sortedQuestions.map((q, idx) => (
              <li
                key={q.question_id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 flex flex-col sm:flex-row sm:justify-between gap-3 hover:border-[#7F56D9]/30 transition"
              >
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {idx + 1}
                  </span>
                  <div>
                  <p className="text-xs text-gray-400 mb-1 flex flex-wrap gap-2 items-center">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{q.difficulty}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Answer {String.fromCharCode(65 + q.correct_index)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{q.prompt}</p>
                  <p className="text-xs text-gray-500 mt-2 space-y-0.5">
                    A) {q.option_a}
                    <br />
                    B) {q.option_b}
                    <br />
                    C) {q.option_c}
                    <br />
                    D) {q.option_d}
                  </p>
                  </div>
                </div>
                <div className="self-start flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEditQuestion(q)}
                    className="inline-flex items-center gap-1 text-sm text-[#7F56D9] hover:underline cursor-pointer"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.question_id)}
                    className="text-sm text-red-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDeleteModal
        open={showDeleteModal}
        title="Delete puzzle set?"
        message="This will permanently remove the puzzle set and all its questions. This cannot be undone."
        itemName={metric.title}
        isDeleting={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMetric}
      />
    </div>
  );
};

export default ProblemMetricEditor;
