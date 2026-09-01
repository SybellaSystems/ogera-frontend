import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSubmitStudentLinkMutation } from "@/services/api/communityWorkspace.api";

const SubmitLink: React.FC = () => {
  const [url, setUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("GitHub");
  const [error, setError] = useState("");
  const [submitStudentLink, { isLoading }] = useSubmitStudentLinkMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter your profile URL.");
      return;
    }

    try {
      await submitStudentLink({
        link_type: selectedPlatform.toLowerCase() as
          | "github"
          | "linkedin"
          | "portfolio"
          | "other",
        url,

        visibility: true,
      }).unwrap();

      if (!url.trim()) {
        setError("Please enter your profile URL.");
        return;
      }

      toast.success("Review Profile Link submitted successfully.");

      setError("");

      setUrl("");

      setSelectedPlatform("GitHub");
    } catch (error: any) {
      setError(error?.data?.message ?? "Failed to submit profile.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2"
    >
      {/* Header */}
      <div className="mb-1.5">
        <h3 className="text-lg font-semibold text-gray-900 mt-1">
          Submit Your Profile
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Share your GitHub, LinkedIn, or Portfolio to receive peer reviews.
        </p>
      </div>

      {/* Input Row */}
      <div className="flex flex-col md:flex-row gap-2">
        {/* URL */}
        <input
          type="text"
          placeholder="Paste your LinkedIn, GitHub, or Portfolio URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Link Type */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
        >
          <option>GitHub</option>
          <option>LinkedIn</option>
          <option>Portfolio</option>
          <option>Other</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg transition"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* Validation */}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-3">🔒 Visible to students only.</p>
    </form>
  );
};

export default SubmitLink;
