import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TagIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useGetAllCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from "../../services/api/jobCategoriesApi";
import toast from "react-hot-toast";

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  job_count: number;
}

const JobCategories: React.FC = () => {
  const { t } = useTranslation();
  const role = useSelector((state: any) => state.auth.role);
  const isSuperAdmin = role === "superadmin";

  const { data: categoriesResponse, isLoading, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [showForm, setShowForm] = useState(false); // Changed from showModal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    icon: "💼",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    job_count: 0,
  });

  const categories = categoriesResponse?.data || [];

  const colorOptions = [
    { value: "bg-blue-100 text-blue-700 border-blue-200", label: "Blue" },
    { value: "bg-purple-100 text-purple-700 border-purple-200", label: "Purple" },
    { value: "bg-pink-100 text-pink-700 border-pink-200", label: "Pink" },
    { value: "bg-green-100 text-green-700 border-green-200", label: "Green" },
    { value: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Yellow" },
    { value: "bg-gray-100 text-gray-700 border-gray-200", label: "Gray" },
    { value: "bg-orange-100 text-orange-700 border-orange-200", label: "Orange" },
    { value: "bg-indigo-100 text-indigo-700 border-indigo-200", label: "Indigo" },
  ];

  const iconOptions = ["💻", "📊", "🎨", "📢", "💰", "⚙️", "🤝", "👥", "💼", "🔧", "📱", "🎯"];

  const handleOpenForm = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "💼",
        color: category.color || "bg-purple-100 text-purple-700 border-purple-200",
        job_count: category.jobCount || category.job_count || 0,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "💼",
        color: "bg-purple-100 text-purple-700 border-purple-200",
        job_count: 0,
      });
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "💼",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      job_count: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("pages.jobs.categoryNameRequiredToast"));
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.category_id,
          data: { ...formData, name: formData.name.trim(), description: formData.description.trim() },
        }).unwrap();
        toast.success(t("pages.jobs.categoryUpdatedSuccess"));
      } else {
        await createCategory({ ...formData, name: formData.name.trim(), description: formData.description.trim() }).unwrap();
        toast.success(t("pages.jobs.categoryCreatedSuccess"));
      }
      handleCloseForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || t("pages.jobs.failedToSaveCategory"));
    }
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success(t("pages.jobs.categoryDeletedSuccess"));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || t("pages.jobs.failedToDeleteCategory"));
    }
  };

  const totalJobs = categories.reduce((sum: number, cat: any) => sum + (cat.jobCount || cat.job_count || 0), 0);
  const mostPopularCategory = categories.length > 0 
    ? categories.reduce((prev: any, curr: any) => 
        (curr.jobCount || curr.job_count || 0) > (prev.jobCount || prev.job_count || 0) ? curr : prev
      )
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">{t("pages.jobs.loadingCategories")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <TagIcon className="h-8 w-10 md:h-10 md:w-10 text-purple-600" />
            {showForm ? (editingCategory ? t("pages.jobs.editCategory") : t("pages.jobs.addNewCategory")) : t("pages.jobs.jobCategoriesTitle")}
          </h1>
          <p className="text-gray-500 mt-1">
            {showForm ? t("pages.jobs.configureCategoryDetails") : t("pages.jobs.organizeByCategory")}
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {showForm ? (
             <button
             onClick={handleCloseForm}
             className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition hover:bg-gray-50 flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
           >
             <ChevronLeftIcon className="h-4 w-4" />
             {t("pages.jobs.backToList")}
           </button>
          ) : (
            isSuperAdmin && (
              <button
                onClick={() => handleOpenForm()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center text-sm cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" />
                {t("pages.jobs.addCategory")}
              </button>
            )
          )}
        </div>
      </div>

      {showForm ? (
        /* --- FULL PAGE FORM SECTION --- */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-slideUp">
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column: Basics */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t("pages.jobs.categoryNameRequired")}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder={t("pages.jobs.categoryNamePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t("pages.jobs.description")}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none h-32 resize-none"
                    placeholder={t("pages.jobs.descriptionPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t("pages.jobs.manualJobCount")}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.job_count === 0 ? "" : formData.job_count}
                    onChange={(e) => setFormData({ ...formData, job_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Visuals */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">{t("pages.jobs.selectVisualIcon")}</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-3xl p-3 rounded-lg transition-all border-2 ${
                          formData.icon === icon 
                            ? "bg-purple-600 border-purple-600 text-white scale-110 shadow-md" 
                            : "bg-white border-transparent hover:border-gray-300"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t("pages.jobs.themeColor")}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                          formData.color === option.value 
                            ? "border-purple-600 ring-2 ring-purple-100" 
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border shadow-sm ${option.value.split(' ')[0]}`}></div>
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="flex-1 sm:flex-none px-7 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isCreating || isUpdating ? t("pages.jobs.saving") : (editingCategory ? t("pages.jobs.updateCategory") : t("pages.jobs.createCategory"))}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex-1 sm:flex-none px-7 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition cursor-pointer"
              >
                {t("pages.jobs.cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* --- DASHBOARD VIEW (Original Content) --- */
        <>
          <div className="bg-purple-50 rounded-xl p-2 md:p-4 border border-purple-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <p className="text-sm text-purple-700 font-medium">{t("pages.jobs.totalCategories")}</p>
                <p className="text-1xl md:text-2xl font-bold text-purple-900 mt-1">{categories.length}</p>
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">{t("pages.jobs.totalJobs")}</p>
                <p className="text-1xl md:text-2xl font-bold text-purple-900 mt-1">{totalJobs}</p>
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">{t("pages.jobs.mostPopular")}</p>
                <p className="text-1xl md:text-2xl font-bold text-purple-900 mt-1">
                  {mostPopularCategory?.name || t("common.na")}
                </p>
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t("pages.jobs.noCategoriesYet")}</h3>
              <p className="text-gray-500 mb-6">{t("pages.jobs.getStartedCategory")}</p>
              {isSuperAdmin && (
                <button
                  onClick={() => handleOpenForm()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  {t("pages.jobs.createFirstCategory")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category: any) => (
                <div
                  key={category.category_id}
                  className={`rounded-xl p-4 md:p-6 border-2 ${category.color || "bg-purple-100 text-purple-700 border-purple-200"} hover:shadow-lg transition-all relative group`}
                >
                  {isSuperAdmin && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenForm(category)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-md text-blue-600 shadow-sm transition cursor-pointer"
                        title={t("pages.users.edit")}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.category_id, category.name)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-md text-red-600 shadow-sm transition cursor-pointer"
                        title={t("pages.users.delete")}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="text-4xl mb-4">{category.icon || "💼"}</div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm opacity-80 mb-4 line-clamp-2 leading-relaxed">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-2xl font-black">{category.jobCount || category.job_count || 0} <span className="text-xs font-normal uppercase tracking-wider">{t("pages.jobs.jobs")}</span></p>
                    <button className="p-2 bg-white/50 hover:bg-white rounded-full transition border border-transparent hover:border-current">
                       <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Keep Delete Modal as a small overlay for safety */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("pages.jobs.deleteCategoryTitle")}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                {t("pages.jobs.deleteCategoryConfirm", { name: categoryToDelete.name })}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                >
                  {t("pages.jobs.noKeepIt")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  {isDeleting ? t("pages.jobs.deleting") : t("pages.jobs.yesDelete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCategories;