import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  TrashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  useGetCognitiveTestAdminQuery,
  useUpdateCognitiveTestMutation,
  useDeleteCognitiveTestMutation,
  useAddCognitiveQuestionMutation,
  useUpdateCognitiveQuestionMutation,
  useDeleteCognitiveQuestionMutation,
  type CognitiveCategory,
  type QuestionDifficulty,
} from "../../services/api/cognitiveTestApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const CognitiveTestEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useGetCognitiveTestAdminQuery(id!, { skip: !id });
  const [updateTest, { isLoading: savingMeta }] = useUpdateCognitiveTestMutation();
  const [deleteTest, { isLoading: deleting }] = useDeleteCognitiveTestMutation();
  const [addQuestion, { isLoading: addingQ }] = useAddCognitiveQuestionMutation();
  const [updateQuestion, { isLoading: updatingQ }] = useUpdateCognitiveQuestionMutation();
  const [deleteQuestion] = useDeleteCognitiveQuestionMutation();

  const test = data?.data;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CognitiveCategory>("numerical");
  const [metaDirty, setMetaDirty] = useState(false);

  React.useEffect(() => {
    if (test) {
      setTitle(test.title);
      setDescription(test.description || "");
      setCategory(test.category);
      setMetaDirty(false);
    }
  }, [test?.cognitive_test_id, test?.title, test?.description, test?.category]);

  const [qPrompt, setQPrompt] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correct, setCorrect] = useState<0 | 1 | 2 | 3>(0);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const sortedQuestions = useMemo(() => {
    if (!test?.questions) return [];
    return [...test.questions].sort((a, b) => a.sort_order - b.sort_order);
  }, [test?.questions]);

  const saveMeta = async () => {
    if (!id) return;
    try {
      await updateTest({
        id,
        body: {
          title: title.trim(),
          description: description.trim() || null,
          category,
        },
      }).unwrap();
      toast.success("Test details saved");
      setMetaDirty(false);
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Save failed");
    }
  };

  const togglePublish = async () => {
    if (!id || !test) return;
    try {
      await updateTest({
        id,
        body: { published: !test.published },
      }).unwrap();
      toast.success(test.published ? "Unpublished" : "Published for students");
      refetch();
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleDeleteTest = async () => {
    if (!id || !window.confirm("Delete this test and all questions?")) return;
    try {
      await deleteTest(id).unwrap();
      toast.success("Test deleted");
      window.location.href = "/dashboard/cognitive-tests";
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
    return <p className="p-8 text-center text-gray-500">Missing test id</p>;
  }

  if (isLoading || !test) {
    return <p className="p-8 text-center text-gray-500">Loading…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard/cognitive-tests"
          className="inline-flex items-center gap-1 text-sm text-[#7F56D9] font-medium hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          All tests
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit test</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={togglePublish}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                test.published
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {test.published ? (
                <>
                  <GlobeAltIcon className="w-4 h-4" /> Published
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-4 h-4" />click to publish
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDeleteTest}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              Delete test
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
            <span className="text-xs font-medium text-gray-500 uppercase">Category</span>
            <select
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as CognitiveCategory);
                setMetaDirty(true);
              }}
            >
              <option value="numerical">Numerical</option>
              <option value="verbal">Verbal</option>
              <option value="logical">Logical</option>
              <option value="mixed">Mixed</option>
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
            {savingMeta ? "Saving…" : "Save details"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {editingQuestionId ? "Edit question" : "Add question"}
        </h2>
        <p className="text-sm text-gray-500">
          Four options per question. Set the correct answer for automatic scoring. Difficulty is Easy,
          Medium, or Hard (for your records).
        </p>
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
              onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
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
          {editingQuestionId
            ? updatingQ
              ? "Saving…"
              : "Save question"
            : addingQ
            ? "Adding…"
            : "Add question"}
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
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Questions ({sortedQuestions.length})
        </h2>
        {sortedQuestions.length === 0 ? (
          <p className="text-sm text-gray-500">No questions yet. Add at least one before publishing.</p>
        ) : (
          <ul className="space-y-3">
            {sortedQuestions.map((q, idx) => (
              <li
                key={q.question_id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 flex flex-col sm:flex-row sm:justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Q{idx + 1} ·{" "}
                    <span className="capitalize">{q.difficulty}</span> · correct:{" "}
                    {String.fromCharCode(65 + q.correct_index)}
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
    </div>
  );
};

export default CognitiveTestEditor;
