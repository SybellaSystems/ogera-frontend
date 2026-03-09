import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  VideoCameraIcon,
  LinkIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  useGetAllCoursesQuery,
  useDeleteCourseMutation,
  type Course,
  COURSE_CATEGORIES,
} from "../../services/api/coursesApi";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { formatRelativeTime } from "../../utils/timeUtils";

const ViewCourse: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useSelector((state: any) => state.auth.role);
  const { data, isLoading, error, refetch } = useGetAllCoursesQuery();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all"
  );

  const courses = data?.data || [];
  const isStudent = role === "student";
  const isAdmin =
    role === "admin" || role === "superadmin" || role === "verifyDocAdmin";

  // Filter courses based on search, type, tag, category, price
  const filteredCourses = courses.filter((course: Course) => {
    const matchesSearch =
      !searchQuery ||
      course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !selectedType || course.type === selectedType;
    const matchesTag = !selectedTag || course.tag === selectedTag;
    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;
    const isFree =
      course.is_free !== false &&
      (course.price_amount == null || Number(course.price_amount) === 0);
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && isFree) ||
      (priceFilter === "paid" && !isFree);

    return (
      matchesSearch &&
      matchesType &&
      matchesTag &&
      matchesCategory &&
      matchesPrice
    );
  });

  // Get unique types and tags for filters
  const types = Array.from(
    new Set(courses.map((course: Course) => course.type).filter(Boolean))
  );
  const tags = Array.from(
    new Set(courses.map((course: Course) => course.tag).filter(Boolean))
  );

  const formatPrice = (course: Course) => {
    if (
      course.is_free !== false &&
      (course.price_amount == null || Number(course.price_amount) === 0)
    )
      return "Free";
    const amount = Number(course.price_amount);
    const currency = course.price_currency || "RWF";
    return `${currency} ${amount.toLocaleString()}`;
  };

  const performDelete = async (courseId: string, toastId: string) => {
    try {
      await deleteCourse(courseId).unwrap();
      toast.dismiss(toastId);
      toast.success("Course deleted successfully");
      refetch();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error?.data?.message || "Failed to delete course");
    }
  };

  const handleDelete = (courseId: string, courseName: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 min-w-[280px]">
          <p className="text-gray-700 dark:text-gray-200 text-sm">
            Are you sure you want to delete &quot;{courseName}&quot;?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => performDelete(courseId, t.id)}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case "video":
        return <VideoCameraIcon className="h-4 w-4" />;
      case "quiz":
        return <DocumentTextIcon className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      case "pdf":
        return <DocumentIcon className="h-4 w-4" />;
      case "image":
        return <PhotoIcon className="h-4 w-4" />;
      case "text":
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case "video":
        return "Watch Video";
      case "quiz":
        return "Quiz";
      case "link":
        return t("courses.readLink");
      case "pdf":
        return t("courses.readPdf");
      case "image":
        return t("courses.viewImage");
      case "text":
        return t("courses.readText");
      default:
        return stepType;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 font-medium">
            {t("courses.courseNotFound")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900">
              {isStudent ? t("courses.availableCourses") : t("courses.allCourses")}
            </h1>
            <p className="text-gray-600 mt-1">
              {isStudent
                ? `Browse and learn from ${filteredCourses.length} ${
                    filteredCourses.length === 1 ? "course" : "courses"
                  }`
                : `Manage and view all courses (${filteredCourses.length} ${
                    filteredCourses.length === 1 ? "course" : "courses"
                  })`}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/dashboard/courses/add")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            {t("courses.addCourse")}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("courses.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">{t("courses.allTypes")}</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Price:</span>
          {(["all", "free", "paid"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriceFilter(p)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                priceFilter === p
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p === "all" ? "All" : p === "free" ? "Free" : "Paid"}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("courses.noCoursesFound")}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ||
            selectedType ||
            selectedTag ||
            selectedCategory ||
            priceFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first course"}
          </p>
          {!searchQuery &&
            !selectedType &&
            !selectedTag &&
            !selectedCategory &&
            priceFilter === "all" &&
            isAdmin && (
              <button
                onClick={() => navigate("/dashboard/courses/add")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Create Course
              </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course: Course) => (
            <div
              key={course.course_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {course.course_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
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
                        {formatPrice(course)}
                      </span>
                      {course.estimated_hours != null && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {course.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/courses/edit/${course.course_id}`
                          )
                        }
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={t("courses.editCourse")}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(course.course_id, course.course_name)
                        }
                        disabled={isDeleting}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title={t("courses.deleteCourse")}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Course Steps */}
                {course.steps && course.steps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      {t("courses.courseSteps", { count: course.steps.length })}
                    </h4>
                    <div className="space-y-2">
                      {[...course.steps]
                        .sort((a, b) => a.step_order - b.step_order)
                        .slice(0, 3)
                        .map((step, index) => (
                          <div
                            key={step.step_id || index}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                          >
                            <span className="text-purple-600 font-medium">
                              {t("courses.step")} {step.step_order}:
                            </span>
                            <span className="flex items-center gap-1">
                              {getStepTypeIcon(step.step_type)}
                              {step.step_title ||
                                getStepTypeLabel(step.step_type)}
                            </span>
                          </div>
                        ))}
                      {course.steps.length > 3 && (
                        <p className="text-xs text-gray-500 pl-3">
                          {t("courses.moreSteps", { count: course.steps.length - 3 })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {isAdmin &&
                      `Created ${formatRelativeTime(course.created_at)}`}
                  </span>
                  {isStudent ? (
                    <button
                      onClick={() =>
                        navigate(`/dashboard/courses/${course.course_id}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <PlayIcon className="h-5 w-5" />
                      {t("courses.startLearning")}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(`/dashboard/courses/${course.course_id}`)
                      }
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {t("courses.viewDetails")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewCourse;
