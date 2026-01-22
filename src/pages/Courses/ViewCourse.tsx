import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import Button from "../../components/button";

const ViewCourse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpenIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">View Course</h1>
          </div>
          <p className="text-gray-600">Create a new course</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">Course form will be implemented here.</p>
          
          <div className="mt-6 flex gap-4">
            <Button
              text="Cancel"
              onClick={() => navigate("/dashboard/courses")}
            />
            <Button
              text="Save Course"
              onClick={() => {
                // Add course logic here
                console.log("Save course");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;

