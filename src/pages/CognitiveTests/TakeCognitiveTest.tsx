import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  useGetPublishedCognitiveTestQuery,
  useSubmitCognitiveAttemptMutation,
} from "../../services/api/cognitiveTestApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const TakeCognitiveTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetPublishedCognitiveTestQuery(id!, { skip: !id });
  const [submit, { isLoading: submitting }] = useSubmitCognitiveAttemptMutation();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{
    score: number;
    max_score: number;
    percentage: number;
    title: string;
  } | null>(null);

  const test = data?.data;

  const setAnswer = (questionId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = async () => {
    if (!id || !test) return;
    try {
      const res = await submit({ testId: id, answers }).unwrap();
      const payload = res.data;
      setDone({
        score: payload.score,
        max_score: payload.max_score,
        percentage: payload.percentage,
        title: payload.title,
      });
      toast.success(`Score: ${payload.score}/${payload.max_score} (${payload.percentage}%)`);
    } catch (e) {
      const err = e as FetchBaseQueryError & { data?: { message?: string } };
      toast.error(err?.data?.message || "Submit failed");
    }
  };

  if (!id) {
    return <p className="p-8 text-center text-gray-500">Missing test</p>;
  }

  if (isLoading || !test) {
    return <p className="p-8 text-center text-gray-500">Loading test…</p>;
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results</h1>
        <p className="text-gray-600 dark:text-gray-300">{done.title}</p>
        <div className="rounded-2xl border border-[#7F56D9]/30 bg-[#7F56D9]/5 p-8">
          <p className="text-4xl font-bold text-[#7F56D9]">
            {done.score}/{done.max_score}
          </p>
          <p className="text-sm text-gray-500 mt-2">{done.percentage}% correct</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Your intelligence component of the trust score has been updated from this attempt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/cognitive-tests/available")}
          className="text-[#7F56D9] font-medium hover:underline cursor-pointer"
        >
          Back to cognitive tests
        </button>
      </div>
    );
  }

  const allAnswered =
    test.questions.length > 0 &&
    test.questions.every((q) => answers[q.question_id] !== undefined);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <Link
        to="/dashboard/cognitive-tests/available"
        className="inline-flex items-center gap-1 text-sm text-[#7F56D9] font-medium hover:underline"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{test.title}</h1>
        {test.description && (
          <p className="text-sm text-gray-500 mt-1">{test.description}</p>
        )}
      </div>

      <ol className="space-y-8">
        {test.questions.map((q, i) => (
          <li
            key={q.question_id}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-5 shadow-sm"
          >
            <p className="text-xs text-gray-400 mb-2">
              Question {i + 1} · <span className="capitalize">{q.difficulty}</span>
            </p>
            <p className="font-medium text-gray-900 dark:text-white mb-4">{q.prompt}</p>
            <div className="space-y-2">
              {(
                [
                  ["A", q.option_a],
                  ["B", q.option_b],
                  ["C", q.option_c],
                  ["D", q.option_d],
                ] as const
              ).map(([label, text], idx) => (
                <label
                  key={label}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    answers[q.question_id] === idx
                      ? "border-[#7F56D9] bg-[#7F56D9]/5"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    name={q.question_id}
                    checked={answers[q.question_id] === idx}
                    onChange={() => setAnswer(q.question_id, idx)}
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-[#7F56D9]">{label}.</span> {text}
                  </span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-4 flex justify-center">
        <button
          type="button"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
          className="px-8 py-3 rounded-xl bg-[#7F56D9] text-white font-semibold shadow-lg shadow-[#7F56D9]/30 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit answers"}
        </button>
      </div>
    </div>
  );
};

export default TakeCognitiveTest;
