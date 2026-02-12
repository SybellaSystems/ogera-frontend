import React, { useState } from "react";
import { TagIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  const role = useSelector((state: any) => state.auth.role);
  const isSuperAdmin = role === "superadmin";
  
  const { data: categoriesResponse, isLoading, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [showModal, setShowModal] = useState(false);
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

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "💼",
        color: category.color || "bg-purple-100 text-purple-700 border-purple-200",
        job_count: category.job_count || category.jobCount || 0,
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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.category_id,
          data: {
            name: formData.name.trim(),
            description: formData.description.trim(),
            icon: formData.icon,
            color: formData.color,
            job_count: Number(formData.job_count) || 0,
          },
        }).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          color: formData.color,
          job_count: Number(formData.job_count) || 0,
        }).unwrap();
        toast.success("Category created successfully!");
      }
      handleCloseModal();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to save category");
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
      toast.success("Category deleted successfully!");
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to delete category");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#6941C6] border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <TagIcon className="h-8 w-10 md:h-10 md:w-10 text-[#6941C6]" />
            Job Categories
          </h1>
          <p className="text-gray-500 mt-2">Organize jobs by category and industry</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-4 md:px-6 py-2.5 rounded-lg font-semibold transition shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="h-5 w-5" />
            Add Category
          </button>
        )}
      </div>

      <div className="bg-[#f5f0fc] rounded-xl p-4 md:p-6 border border-[#ddd0ec]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <p className="text-sm text-[#6941C6] font-medium">Total Categories</p>
            <p className="text-2xl md:text-3xl font-bold text-[#2d1b69] mt-1">{categories.length}</p>
          </div>
          <div>
            <p className="text-sm text-[#6941C6] font-medium">Total Jobs</p>
            <p className="text-2xl md:text-3xl font-bold text-[#2d1b69] mt-1">{totalJobs}</p>
          </div>
          <div>
            <p className="text-sm text-[#6941C6] font-medium">Most Popular</p>
            <p className="text-lg md:text-xl font-bold text-[#2d1b69] mt-1">
              {mostPopularCategory?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first job category</p>
          {isSuperAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-[#2d1b69] hover:bg-[#1a1035] text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md inline-flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category: any) => (
            <div
              key={category.category_id}
              className={`rounded-xl p-4 md:p-6 border-2 ${category.color || "bg-purple-100 text-purple-700 border-purple-200"} hover:scale-105 transition-transform cursor-pointer shadow-md relative`}
            >
              {isSuperAdmin && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(category);
                    }}
                    className="p-1.5 bg-white/80 hover:bg-white rounded-md transition"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(category.category_id, category.name);
                    }}
                    disabled={isDeleting}
                    className="p-1.5 bg-white/80 hover:bg-white rounded-md transition"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              )}
              <div className="text-4xl mb-3">{category.icon || "💼"}</div>
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-sm opacity-75 mb-2 line-clamp-2">{category.description}</p>
              )}
              <p className="text-2xl font-bold">{category.jobCount !== undefined ? category.jobCount : (category.job_count !== undefined ? category.job_count : 0)} jobs</p>
              <button className="mt-4 w-full px-4 py-2 bg-white hover:bg-gray-50 rounded-lg font-medium text-sm transition border">
                View Jobs
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-20 pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl mx-auto w-full shadow-2xl border-2 border-gray-200 my-4">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-transparent"
                  placeholder="e.g., Software Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-transparent"
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 text-2xl rounded-lg border-2 transition ${
                        formData.icon === icon
                          ? "border-[#6941C6] bg-[#f5f0fc]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-transparent"
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Jobs
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.job_count === 0 ? "" : formData.job_count}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    setFormData({ ...formData, job_count: isNaN(value) ? 0 : value });
                  }}
                  onBlur={(e) => {
                    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    setFormData({ ...formData, job_count: isNaN(value) ? 0 : Math.max(0, value) });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6941C6] focus:border-transparent"
                  placeholder="Enter number of jobs (e.g., 1, 2, 10)"
                />
                <p className="text-xs text-gray-500 mt-1">Set the number of jobs for this category</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2 bg-[#2d1b69] hover:bg-[#1a1035] text-white rounded-lg transition font-medium disabled:opacity-50"
                >
                  {isCreating || isUpdating
                    ? editingCategory
                      ? "Updating..."
                      : "Creating..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-2 border-red-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Category?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{categoryToDelete.name}"</span>? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-5 w-5" />
                      Delete
                    </>
                  )}
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
