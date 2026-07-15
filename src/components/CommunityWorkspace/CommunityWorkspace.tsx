import React, { useState } from "react";

import SubmitLink from "./SubmitLink";
import MySubmittedLink from "./MySubmittedLink";
import PeerReviewFeed from "./PeerReviewFeed";
import ReviewModal from "./ReviewModal";

import type { PeerReviewStudent } from "@/services/api/communityWorkspace.api";

const CommunityWorkspace: React.FC = () => {
  const [selectedStudent, setSelectedStudent] =
    useState<PeerReviewStudent | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] =
    useState(false);

  const handleOpenReview = (student: PeerReviewStudent) => {
    setSelectedStudent(student);
    setIsReviewModalOpen(true);
  };

  const handleCloseReview = () => {
    setSelectedStudent(null);
    setIsReviewModalOpen(false);
  };

  return (
    <>
      <div className="">

        {/* Header */}

        <div className=" px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Community Workspace
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Help other students improve their professional profiles by
            reviewing GitHub, LinkedIn and Portfolio links.
          </p>
        </div>

        {/* Body */}

        <div className="space-y-6 p-6">

          <SubmitLink />

          <MySubmittedLink />

          <PeerReviewFeed
            onReview={handleOpenReview}
          />

        </div>
      </div>

      <ReviewModal
        open={isReviewModalOpen}
        student={selectedStudent}
        onClose={handleCloseReview}
      />
    </>
  );
};

export default CommunityWorkspace;