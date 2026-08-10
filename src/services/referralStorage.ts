import type { JobReferral } from "../type/jobs/referral";

const STORAGE_KEY = "ogera_job_referrals";

export const getReferrals = (): JobReferral[] => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as JobReferral[];
  } catch {
    return [];
  }
};

export const saveReferral = (referral: JobReferral): void => {
  const referrals = getReferrals();

  const existingIndex = referrals.findIndex(
    (item) => item.id === referral.id,
  );

  if (existingIndex === -1) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...referrals, referral]),
    );

    return;
  }

  const updatedReferrals = [...referrals];

  updatedReferrals[existingIndex] = referral;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReferrals),
  );
};

export const deleteReferral = (id: string): void => {
  const referrals = getReferrals();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      referrals.filter((referral) => referral.id !== id),
    ),
  );
};


export const incrementReferralViews = (id: string): void => {
  const referrals = getReferrals();

  const updatedReferrals = referrals.map((referral) => {
    if (referral.id !== id) {
      return referral;
    }

    return {
      ...referral,
      views: (referral.views || 0) + 1,
    };
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReferrals),
  );
};

export const incrementReferralApplyClicks = (id: string): void => {
  const referrals = getReferrals();

  const updatedReferrals = referrals.map((referral) => {
    if (referral.id !== id) {
      return referral;
    }

    return {
      ...referral,
      applyClicks: (referral.applyClicks || 0) + 1,
    };
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReferrals),
  );
};

export const reportReferralApplication = (id: string): void => {
  const referrals = getReferrals();

  const updatedReferrals = referrals.map((referral) => {
    if (referral.id !== id) {
      return referral;
    }

    return {
      ...referral,
      reportedApplications:
        (referral.reportedApplications || 0) + 1,
    };
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReferrals),
  );
};