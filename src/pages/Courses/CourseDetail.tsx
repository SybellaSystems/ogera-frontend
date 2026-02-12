import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpenIcon,
  VideoCameraIcon,
  LinkIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { 
  useGetCourseByIdQuery, 
  useGetCourseCompletionQuery,
  useGetCourseProgressQuery,
  useMarkStepCompleteMutation,
  useMarkStepIncompleteMutation,
  type CourseStep 
} from "../../services/api/coursesApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";
import api from "../../services/api/axiosInstance";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleIconOutline } from "@heroicons/react/24/outline";

const BASE_URL = import.meta.env.VITE_API_URL;

const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetCourseByIdQuery(id || "");
  const { data: completionData, refetch: refetchCompletion } = useGetCourseCompletionQuery(id || "", {
    skip: !id,
  });
  const { data: progressData, refetch: refetchProgress } = useGetCourseProgressQuery(id || "", {
    skip: !id,
  });
  const [markStepComplete] = useMarkStepCompleteMutation();
  const [markStepIncomplete] = useMarkStepIncompleteMutation();

  const course = data?.data;
  const completion = completionData?.data || { completed: 0, total: 0, percentage: 0, started: false, started_at: null };
  const completedStepIds = new Set(
    progressData?.data?.progress
      ?.filter((p) => p.completed)
      .map((p) => p.step_id) || []
  );

  const handleToggleStepComplete = async (step_id: string, isCompleted: boolean) => {
    if (!id) return;
    
    try {
      if (isCompleted) {
        await markStepIncomplete({ course_id: id, step_id }).unwrap();
      } else {
        await markStepComplete({ course_id: id, step_id }).unwrap();
      }
      refetchCompletion();
      refetchProgress();
    } catch (error) {
      console.error('Error toggling step completion:', error);
    }
  };

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case "video":
        return <VideoCameraIcon className="h-5 w-5 text-purple-600" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-blue-600" />;
      case "pdf":
        return <DocumentIcon className="h-5 w-5 text-red-600" />;
      case "image":
        return <PhotoIcon className="h-5 w-5 text-green-600" />;
      case "text":
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case "video":
        return "Video";
      case "link":
        return "External Link";
      case "pdf":
        return "PDF Document";
      case "image":
        return "Image";
      case "text":
        return "Text Content";
      default:
        return stepType;
    }
  };

  // Convert YouTube URLs to embed format
  const convertToEmbedUrl = (url: string): string => {
    if (!url || !url.startsWith("http")) {
      return url;
    }

    // If already an embed URL, return as is
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // Extract video ID from different YouTube URL formats
    let videoId = "";

    // Regular YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (watchMatch) {
      videoId = watchMatch[1].split("&")[0]; // Remove any additional parameters
    }

    // If we found a video ID, return embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // If it's not a YouTube URL or we couldn't parse it, return original
    return url;
  };

  const handlePdfDownload = async (filePath: string, fileName: string) => {
    try {
      // Check if it's already a full URL (S3)
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        window.open(filePath, '_blank');
        return;
      }

      // Use API endpoint with authentication
      const response = await api.get(
        `/courses/content/download?path=${encodeURIComponent(filePath)}`,
        {
          responseType: 'blob',
        }
      );

      // Create a blob URL and open it
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to open PDF. Please try again.');
    }
  };

  const renderStepContent = (step: CourseStep) => {
    switch (step.step_type) {
      case "video":
        if (step.step_content.startsWith("http")) {
          const embedUrl = convertToEmbedUrl(step.step_content);
          return (
            <div className="mt-4">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          );
        }
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{step.step_content}</p>
          </div>
        );
      case "link":
        return (
          <div className="mt-4">
            <a
              href={step.step_content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Open Link
            </a>
          </div>
        );
      case "pdf":
        // Check if step_content is already a full URL (S3)
        const isFullUrl = step.step_content.startsWith('http://') || step.step_content.startsWith('https://');
        
        if (isFullUrl) {
          // For S3 URLs, use direct link
          return (
            <div className="mt-4">
              <a
                href={step.step_content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 underline flex items-center gap-2"
              >
                <DocumentIcon className="h-4 w-4" />
                View PDF
              </a>
            </div>
          );
        }
        
        // For local files, use download handler with authentication
        const fileName = step.step_content.split('/').pop() || 'course-content.pdf';
        return (
          <div className="mt-4">
            <button
              onClick={() => handlePdfDownload(step.step_content, fileName)}
              className="text-red-600 hover:text-red-700 underline flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
            >
              <DocumentIcon className="h-4 w-4" />
              View PDF
            </button>
          </div>
        );
      case "image":
        // Check if step_content is already a full URL (S3) or needs API endpoint
        const isImageFullUrl = step.step_content.startsWith('http://') || step.step_content.startsWith('https://');
        const imageUrl = isImageFullUrl 
          ? step.step_content 
          : `${BASE_URL}/courses/content/download?path=${encodeURIComponent(step.step_content)}`;
        
        return (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt={step.step_title || "Course image"}
              className="w-full rounded-lg"
            />
          </div>
        );
      case "text":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{step.step_content}</p>
          </div>
        );
      default:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{step.step_content}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !course) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            Course not found or failed to load. Please try again later.
          </p>
          <button
            onClick={() => navigate("/dashboard/courses/view")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const sortedSteps = course.steps
    ? [...course.steps].sort((a, b) => a.step_order - b.step_order)
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/dashboard/courses/view")}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Courses
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <BookOpenIcon className="h-6 w-6 md:h-10 md:w-10 text-purple-600" />
            {course.course_name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {course.type}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {course.tag}
            </span>
            <span className="text-xs text-gray-500">
              Created {formatRelativeTime(course.created_at)}
            </span>
          </div>
          {/* Completion Status */}
          {completion.total > 0 && (
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                <span className="text-lg font-bold text-purple-600">{completion.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-600">
                  {completion.completed} of {completion.total} steps completed
                </p>
                {completion.started && completion.started_at && (
                  <p className="text-xs text-gray-500">
                    Started {formatRelativeTime(completion.started_at)}
                  </p>
                )}
              </div>
              {!completion.started && (
                <p className="text-xs text-purple-600 mt-1 italic">
                  Start learning by marking your first step as complete
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
            Course Description
          </h3>
          <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">
            {course.description}
          </p>
        </div>
      )}

      {/* Course Steps */}
      {sortedSteps.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Course Content ({sortedSteps.length} {sortedSteps.length === 1 ? "step" : "steps"})
          </h3>
          <div className="space-y-6">
            {sortedSteps.map((step, index) => (
              <div
                key={step.step_id || index}
                className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-shrink-0 mt-1">
                    {getStepTypeIcon(step.step_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-purple-600">
                        Step {step.step_order}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getStepTypeLabel(step.step_type)}
                      </span>
                      {step.step_id && (
                        <button
                          onClick={() => handleToggleStepComplete(step.step_id!, completedStepIds.has(step.step_id!))}
                          className="ml-auto flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                          title={completedStepIds.has(step.step_id!) ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {completedStepIds.has(step.step_id!) ? (
                            <>
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Completed</span>
                            </>
                          ) : (
                            <>
                              <CheckCircleIconOutline className="h-5 w-5" />
                              <span className="text-xs">Mark Complete</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {step.step_title && (
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.step_title}
                      </h4>
                    )}
                  </div>
                </div>
                {renderStepContent(step)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No course content available
          </h3>
          <p className="text-gray-600">
            This course doesn't have any content steps yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

