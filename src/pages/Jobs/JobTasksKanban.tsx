import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, Square3Stack3DIcon, ListBulletIcon, TableCellsIcon, CalendarIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  useCreateTaskMutation,
  useGetJobTaskManagementQuery,
  useUpdateTaskStatusMutation,
} from "../../services/api/tasksApi";
import type { TaskStatus } from "../../services/api/tasksApi";
import { transformTasksToKanban, transformKanbanStatusToAPI } from "../../utils/taskTransformer";
import type { TasksState } from '@/types/task.types';
import TaskBoard from "../../components/Tasks/TaskBoard";
import TaskOverview from "../../components/Tasks/TaskOverview";
import TaskListView from "../../components/Tasks/TaskListView";
import TaskTableView from "../../components/Tasks/TaskTableView";
import TaskTimelineView from "../../components/Tasks/TaskTimelineView";
import TabsNavigation from "../../components/Tasks/TabsNavigation";

const JobTasksKanban: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetJobTaskManagementQuery(id);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    deadline: "",
    payment_amount: "",
    assigned_student_id: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const [createTask] = useCreateTaskMutation();

  const taskData = data?.data;
  const approvedStudents = taskData?.approved_students || [];
  const tasks = taskData?.tasks || [];

  // Convert API tasks to Kanban format
  const kanbanTasks = useMemo<TasksState>(() => {
    if (!tasks.length) {
      return { todo: [], 'in-progress': [], done: [] };
    }
    return transformTasksToKanban(tasks);
  }, [tasks]);

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.assigned_student_id) {
      toast.error("Pick an approved student before creating the task.");
      return;
    }

    setIsCreating(true);
    try {
      await createTask({
        jobId: id,
        data: {
          title: formState.title,
          description: formState.description || undefined,
          deadline: formState.deadline || null,
          assigned_student_id: formState.assigned_student_id,
          payment_amount: formState.payment_amount ? Number(formState.payment_amount) : null,
        },
      }).unwrap();

      toast.success("Task created and assigned successfully.");
      setFormState({
        title: "",
        description: "",
        deadline: "",
        payment_amount: "",
        assigned_student_id: "",
      });
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create task.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleMoveTask = async (taskId: string, _fromStatus: string, toStatus: string) => {
    const apiStatus = transformKanbanStatusToAPI(toStatus);
    try {
      await updateTaskStatus({ jobId: id, taskId, status: apiStatus as TaskStatus }).unwrap();
      toast.success(`Task moved to ${toStatus.replaceAll("-", " ")}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update task status.");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !taskData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        Unable to load this job's task workspace.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/dashboard/jobs/tasks")}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{taskData.job.job_title}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage tasks using an interactive Kanban board. Create tasks for approved students only.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition duration-200"
        >
          + New Task
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="rounded-t-2xl border border-gray-200 border-b-0 bg-white">
        <TabsNavigation
          tabs={[
            { id: "overview", label: "Overview", icon: <ChartBarIcon className="h-5 w-5" /> },
            { id: "board", label: "Board", icon: <Square3Stack3DIcon className="h-5 w-5" /> },
            { id: "list", label: "List", icon: <ListBulletIcon className="h-5 w-5" /> },
            { id: "table", label: "Table", icon: <TableCellsIcon className="h-5 w-5" /> },
            { id: "timeline", label: "Timeline", icon: <CalendarIcon className="h-5 w-5" /> },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="rounded-b-2xl border border-t-0 border-gray-200 bg-white p-6 shadow-sm">
        {activeTab === "overview" && (
          <TaskOverview taskData={taskData} kanbanTasks={kanbanTasks} />
        )}
        {activeTab === "board" && (
          <TaskBoard tasks={kanbanTasks} onMoveTask={handleMoveTask} />
        )}
        {activeTab === "list" && (
          <TaskListView tasks={tasks} kanbanTasks={kanbanTasks} />
        )}
        {activeTab === "table" && (
          <TaskTableView tasks={tasks} kanbanTasks={kanbanTasks} />
        )}
        {activeTab === "timeline" && (
          <TaskTimelineView tasks={tasks} kanbanTasks={kanbanTasks} />
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-200"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>

                <form onSubmit={handleCreateTask} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Task Title *</label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, title: e.target.value }))
                      }
                      required
                      placeholder="Enter task title"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formState.description}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={4}
                      placeholder="Enter task description"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Deadline</label>
                      <input
                        type="date"
                        value={formState.deadline}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, deadline: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Payment Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.payment_amount}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            payment_amount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Assign To *</label>
                    <select
                      value={formState.assigned_student_id}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          assigned_student_id: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select an approved student</option>
                      {approvedStudents.length === 0 ? (
                        <option disabled>No approved students available</option>
                      ) : (
                        approvedStudents.map((entry) => (
                          <option key={entry.student.user_id} value={entry.student.user_id}>
                            {entry.student.full_name} (Trust Score: {entry.student.trust_score ?? "N/A"})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="flex gap-3 border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isCreating ||
                        approvedStudents.length === 0 ||
                        !formState.assigned_student_id
                      }
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? "Creating..." : "Create Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobTasksKanban;
