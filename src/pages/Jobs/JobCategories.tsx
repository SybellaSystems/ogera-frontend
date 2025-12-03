import React from "react";
import { TagIcon } from "@heroicons/react/24/outline";

const JobCategories: React.FC = () => {
  const categories = [
    { id: 1, name: "Software Development", jobCount: 345, icon: "💻", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: 2, name: "Data Science", jobCount: 156, icon: "📊", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: 3, name: "Design", jobCount: 89, icon: "🎨", color: "bg-pink-100 text-pink-700 border-pink-200" },
    { id: 4, name: "Marketing", jobCount: 234, icon: "📢", color: "bg-green-100 text-green-700 border-green-200" },
    { id: 5, name: "Finance", jobCount: 178, icon: "💰", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { id: 6, name: "Operations", jobCount: 123, icon: "⚙️", color: "bg-gray-100 text-gray-700 border-gray-200" },
    { id: 7, name: "Sales", jobCount: 201, icon: "🤝", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: 8, name: "Human Resources", jobCount: 67, icon: "👥", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <TagIcon className="h-10 w-10 text-purple-600" />
            Job Categories
          </h1>
          <p className="text-gray-500 mt-2">Organize jobs by category and industry</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md">
          + Add Category
        </button>
      </div>

      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-700 font-medium">Total Categories</p>
            <p className="text-3xl font-bold text-purple-900 mt-1">{categories.length}</p>
          </div>
          <div>
            <p className="text-sm text-purple-700 font-medium">Total Jobs</p>
            <p className="text-3xl font-bold text-purple-900 mt-1">
              {categories.reduce((sum, cat) => sum + cat.jobCount, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-purple-700 font-medium">Most Popular</p>
            <p className="text-xl font-bold text-purple-900 mt-1">Software Development</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className={`rounded-xl p-6 border-2 ${category.color} hover:scale-105 transition-transform cursor-pointer shadow-md`}>
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <p className="text-2xl font-bold">{category.jobCount} jobs</p>
            <button className="mt-4 w-full px-4 py-2 bg-white hover:bg-gray-50 rounded-lg font-medium text-sm transition border">
              View Jobs
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobCategories;

