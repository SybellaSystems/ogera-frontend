import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useGetAllCoursesQuery } from "../../services/api/coursesApi";
import {
  useGetCourseStatisticsQuery,
  useGetCourseSpecificStatisticsQuery,
  useGetCourseStudentsQuery,
} from "../../services/api/coursesApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";
import { useSelector } from "react-redux";

const CourseAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(courseId || null);
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in-progress" | "not-started">("all");
  const role = useSelector((state: any) => state.auth.role);
  const { data: coursesData } = useGetAllCoursesQuery();
  const { data: statisticsData, isLoading: statsLoading } = useGetCourseStatisticsQuery();
  const { data: courseStatsData, isLoading: courseStatsLoading } = useGetCourseSpecificStatisticsQuery(
    selectedCourseId || "",
    { skip: !selectedCourseId }
  );
  const { 
    data: studentsData, 
    isLoading: studentsLoading, 
    error: studentsError,
    refetch: refetchStudents 
  } = useGetCourseStudentsQuery(
    selectedCourseId || "",
    { skip: !selectedCourseId }
  );

  // Update selected course when courseId param changes
  React.useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId]);

  const courses = coursesData?.data || [];
  const statistics = statisticsData?.data;
  const courseStats = courseStatsData?.data;
  
  // Handle students data - it should be an array directly in data
  const allStudents = React.useMemo(() => {
    if (!studentsData) return [];
    
    // RTK Query response format: { success, data, message }
    // The data field contains the array of students
    if (Array.isArray(studentsData.data)) {
      return studentsData.data;
    }
    
    // Fallback: try to get from nested structure if API returns differently
    return studentsData.data?.data || studentsData.data || [];
  }, [studentsData]);

  // Filter students based on status
  const filteredStudents = React.useMemo(() => {
    if (!allStudents || allStudents.length === 0) return [];
    
    switch (filterStatus) {
      case "completed":
        return allStudents.filter((s: any) => s.is_completed === true);
      case "in-progress":
        return allStudents.filter((s: any) => !s.is_completed && s.completed_steps > 0);
      case "not-started":
        return allStudents.filter((s: any) => s.completed_steps === 0);
      default:
        return allStudents;
    }
  }, [allStudents, filterStatus]);

  const students = filteredStudents;

  // Check if user is employer, admin, or courseAdmin
  const isEmployerOrAdmin = 
    role === "employer" || 
    role === "superadmin" || 
    role === "superAdmin" ||
    role === "admin" ||
    role === "courseAdmin" ||
    role === "CourseAdmin";

  if (!isEmployerOrAdmin) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            You don't have permission to view course analytics.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <ChartBarIcon className="h-6 w-6 md:h-10 md:w-10 text-purple-600" />
            Course Analytics
          </h1>
        </div>
      </div>

      {/* Overall Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.total_courses}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpenIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Students Enrolled</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.total_students_enrolled}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course Completions</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.total_course_completions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <button
              key={course.course_id}
              onClick={() => {
                setSelectedCourseId(course.course_id);
                navigate(`/dashboard/courses/analytics/${course.course_id}`);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedCourseId === course.course_id
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-1">{course.course_name}</h3>
              <p className="text-sm text-gray-600">{course.type}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Course Specific Statistics */}
      {selectedCourseId && (
        <>
          {courseStatsLoading ? (
            <Loader />
          ) : courseStats ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {courseStats.course_name} - Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{courseStats.total_enrolled}</p>
                  <p className="text-sm text-gray-600">Total Enrolled</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{courseStats.completed_students}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{courseStats.in_progress_students}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{courseStats.completion_rate}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {studentsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                Error loading students: {studentsError && 'data' in studentsError 
                  ? (studentsError as any).data?.message || (studentsError as any).message || 'Failed to load students'
                  : (studentsError as any).message || 'Failed to load students'}
              </p>
              <button
                onClick={() => refetchStudents()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Completed Students Highlight Section */}
          {allStudents && allStudents.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Completed Students
                    </h2>
                    <p className="text-sm text-gray-600">
                      {allStudents.filter((s: any) => s.is_completed).length} student(s) have completed this course
                    </p>
                  </div>
                </div>
              </div>
              {allStudents.filter((s: any) => s.is_completed).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allStudents
                    .filter((s: any) => s.is_completed)
                    .map((student: any) => (
                      <div
                        key={student.user_id}
                        className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {student.full_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                100% Complete
                              </span>
                              <span className="text-xs text-gray-500">
                                {student.completed_steps}/{student.total_steps} steps
                              </span>
                            </div>
                          </div>
                          <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                        </div>
                        {student.started_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Started {formatRelativeTime(student.started_at)}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No students have completed this course yet.
                </p>
              )}
            </div>
          )}

          {/* All Students List */}
          {studentsLoading ? (
            <Loader />
          ) : allStudents && allStudents.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Students Enrolled ({filteredStudents.length} of {allStudents.length})
                </h2>
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Students</option>
                    <option value="completed">Completed Only</option>
                    <option value="in-progress">In Progress</option>
                    <option value="not-started">Not Started</option>
                  </select>
                </div>
              </div>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No students match the selected filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  student.is_completed
                                    ? "bg-green-600"
                                    : student.percentage > 50
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${student.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-700">{student.percentage}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {student.completed_steps} of {student.total_steps} steps
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.is_completed ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : student.completed_steps > 0 ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Not Started
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.started_at ? formatRelativeTime(student.started_at) : "Not started"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No students enrolled</h3>
              <p className="text-gray-600">No students have started this course yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseAnalytics;
