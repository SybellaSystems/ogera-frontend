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
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  useGetCourseByIdQuery,
  useGetEnrollmentQuery,
  useEnrollCourseMutation,
  useCompleteCourseMutation,
  type CourseStep,
} from "../../services/api/coursesApi";
import Loader from "../../components/Loader";
import { formatRelativeTime } from "../../utils/timeUtils";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useSelector((state: any) => state.auth.role);
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const { data, isLoading, error } = useGetCourseByIdQuery(id || "");
  const { data: enrollmentData } = useGetEnrollmentQuery(id || "", {
    skip: !id,
  });
  const [enroll, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  const [complete, { isLoading: isCompleting }] = useCompleteCourseMutation();

  const course = data?.data;
  const enrollment = enrollmentData?.data;
  const isStudent = role === "student";

  const formatPrice = () => {
    if (!course) return "Free";
    if (
      course.is_free !== false &&
      (course.price_amount == null || Number(course.price_amount) === 0)
    )
      return "Free";
    const amount = Number(course.price_amount);
    const currency = course.price_currency || "RWF";
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleEnroll = async () => {
    if (!id) return;
    try {
      await enroll(id).unwrap();
      toast.success("Enrolled! You can start learning.");
    } catch (e: any) {
      toast.error(e?.data?.message || "Enrollment failed");
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      await complete(id).unwrap();
      toast.success(
        "Course marked complete. Certificate will be reviewed by admin."
      );
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to complete");
    }
  };

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case "video":
        return <VideoCameraIcon className="h-5 w-5 text-purple-600" />;
      case "quiz":
        return <AcademicCapIcon className="h-5 w-5 text-amber-600" />;
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
      case "quiz":
        return "Quiz";
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
    const watchMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    );
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

  const isYouTubeUrl = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const videoPlaybackUrl = (url: string) => {
    if (!url) return url;
    if (isYouTubeUrl(url)) return url;
    if (!url.includes("/videos/stream")) return url;
    const apiBase = import.meta.env.VITE_API_URL || "";
    const origin = apiBase ? new URL(apiBase).origin : window.location.origin;
    const fullUrl = url.startsWith("http")
      ? url
      : `${origin}${url.startsWith("/") ? url : `/${url}`}`;
    const sep = fullUrl.includes("?") ? "&" : "?";
    return accessToken
      ? `${fullUrl}${sep}token=${encodeURIComponent(accessToken)}`
      : fullUrl;
  };

  const renderStepContent = (step: CourseStep) => {
    switch (step.step_type) {
      case "video": {
        const videoSrc = step.step_content || "";
        const isOurStream = videoSrc.includes("/videos/stream");
        const isHttpVideo = videoSrc.startsWith("http");
        if (isHttpVideo || isOurStream) {
          if (isHttpVideo && isYouTubeUrl(videoSrc)) {
            const embedUrl = convertToEmbedUrl(videoSrc);
            return (
              <div className="mt-4">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
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
            <div className="mt-4">
              <div
                className="relative w-full rounded-lg overflow-hidden bg-black"
                style={{ paddingBottom: "56.25%" }}
              >
                <video
                  src={videoPlaybackUrl(videoSrc)}
                  controls
                  className="absolute top-0 left-0 w-full h-full"
                  playsInline
                />
              </div>
            </div>
          );
        }
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{step.step_content}</p>
          </div>
        );
      }
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
      case "image":
        return (
          <div className="mt-4">
            <img
              src={step.step_content}
              alt={step.step_title || "Course image"}
              className="w-full rounded-lg"
            />
          </div>
        );
      case "text":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {step.step_content}
            </p>
          </div>
        );
      case "quiz":
        return (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm font-medium mb-2">Quiz</p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {step.step_content}
            </p>
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
            {course.category && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {course.category}
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.is_free !== false &&
                (course.price_amount == null ||
                  Number(course.price_amount) === 0)
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {formatPrice()}
            </span>
            {course.estimated_hours != null && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {course.estimated_hours} hours
              </span>
            )}
            <span className="text-xs text-gray-500">
              Created {formatRelativeTime(course.created_at)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* SRS: Course Support – In-app chat (placeholder for Socket.io) */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium"
            onClick={() =>
              toast("Course Support chat coming soon (Socket.io).")
            }
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Course Support
          </button>
          {isStudent && enrollment && (
            <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm">
              {enrollment.completed_at ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span>Completed</span>
                  <span className="text-gray-500">
                    ({enrollment.certificate_status})
                  </span>
                </>
              ) : (
                <>
                  <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                  Enrolled
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Student actions: Enroll / Complete */}
      {isStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3">
          {!enrollment ? (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
            >
              {isEnrolling ? "Enrolling..." : "Enroll in this course"}
            </button>
          ) : !enrollment.completed_at ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {isCompleting ? "Submitting..." : "Mark as complete"}
            </button>
          ) : (
            <p className="text-gray-600 text-sm">
              Certificate status:{" "}
              <strong>{enrollment.certificate_status}</strong>
              {enrollment.certificate_status === "pending_payment" &&
                " – Payment will be deducted when you complete a job."}
            </p>
          )}
        </div>
      )}

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
            Course Content ({sortedSteps.length}{" "}
            {sortedSteps.length === 1 ? "step" : "steps"})
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
