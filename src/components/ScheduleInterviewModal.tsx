import React, { useState } from "react";
import { XMarkIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useScheduleInterviewMutation } from "../services/api/interviewsApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  jobId: string;
  jobTitle: string;
  onScheduled?: () => void;
}

// Default to "tomorrow at 10:00" formatted for datetime-local
const defaultWhen = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  // local ISO without seconds: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ScheduleInterviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  jobId,
  jobTitle,
  onScheduled,
}) => {
  const [scheduledAt, setScheduledAt] = useState<string>(defaultWhen());
  const [notes, setNotes] = useState("");
  const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error("Please pick a date and time");
      return;
    }
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
      toast.error("Please pick a future date and time");
      return;
    }
    try {
      await scheduleInterview({
        student_id: studentId,
        job_id: jobId,
        scheduled_at: when.toISOString(),
        notes: notes.trim() || undefined,
      }).unwrap();
      toast.success(`Interview scheduled with ${studentName}`);
      setNotes("");
      onScheduled?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to schedule interview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#f5f3ff] rounded-lg">
              <CalendarDaysIcon className="h-5 w-5 text-[#7f56d9]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Schedule Interview</h2>
              <p className="text-xs text-gray-500">
                with <span className="font-semibold">{studentName}</span> for{" "}
                <span className="font-semibold">{jobTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting link, location, agenda..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-semibold transition"
            >
              {isLoading ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
