import React from "react";
import { Link } from "react-router-dom";
import { CpuChipIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  useGetMyCognitiveAttemptHistoryQuery,
  useListPublishedCognitiveTestsQuery,
} from "../../services/api/cognitiveTestApi";

const StudentCognitiveTests: React.FC = () => {
  const [selectedScoreTestId, setSelectedScoreTestId] = React.useState<string | null>(null);
  const { data, isLoading } = useListPublishedCognitiveTestsQuery();
  const { data: historyData } = useGetMyCognitiveAttemptHistoryQuery();
  const tests = data?.data ?? [];
  const history = historyData?.data ?? [];

  const latestByTest = history.reduce<Record<string, (typeof history)[number]>>((acc, item) => {
    if (!acc[item.cognitive_test_id]) {
      acc[item.cognitive_test_id] = item;
    }
    return acc;
  }, {});

  const selectedTestScores = selectedScoreTestId
    ? history.filter((item) => item.cognitive_test_id === selectedScoreTestId)
    : [];
  const selectedTest = selectedScoreTestId
    ? tests.find((t) => t.cognitive_test_id === selectedScoreTestId)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#7F56D9]/15 text-[#7F56D9]">
          <CpuChipIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cognitive practice</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete published tests to build your profile intelligence score.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 overflow-hidden shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-gray-500">Loading…</p>
        ) : tests.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No published tests yet. Check back when your school adds cognitive assessments.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tests.map((t) => (
              <li key={t.cognitive_test_id}>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {t.category} · {t.question_count} question{t.question_count === 1 ? "" : "s"}
                    </p>
                    {latestByTest[t.cognitive_test_id] && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#7F56D9]/30 bg-[#7F56D9]/5 px-3 py-1.5 text-xs">
                        <span className="font-semibold text-[#7F56D9]">Score card:</span>
                        <span className="text-gray-700 dark:text-gray-200">
                          {latestByTest[t.cognitive_test_id].score}/{latestByTest[t.cognitive_test_id].max_score}
                        </span>
                        <span className="text-gray-500">
                          ({latestByTest[t.cognitive_test_id].percentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedScoreTestId(t.cognitive_test_id)}
                      disabled={!history.some((item) => item.cognitive_test_id === t.cognitive_test_id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#7F56D9]/40 text-[#7F56D9] text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Score card
                    </button>
                    <Link
                      to={`/dashboard/cognitive-tests/attempt/${t.cognitive_test_id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7F56D9] text-white text-sm font-medium cursor-pointer hover:bg-[#6941c6] transition-colors"
                    >
                      Attempt test
                      <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedScoreTestId && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Score card</h2>
                <p className="text-sm text-gray-500">{selectedTest?.title || "Selected test"}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScoreTestId(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                aria-label="Close score card"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {selectedTestScores.length === 0 ? (
              <p className="text-sm text-gray-500">No attempts yet for this test.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {selectedTestScores.map((h) => (
                  <div
                    key={h.test_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{h.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(h.taken_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#7F56D9]">
                        {h.score}/{h.max_score}
                      </p>
                      <p className="text-xs text-gray-500">{h.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedScoreTestId(null)}
                className="px-4 py-2 rounded-xl bg-[#7F56D9] text-white text-sm font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCognitiveTests;
