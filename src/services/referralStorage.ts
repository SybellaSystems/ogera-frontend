import type { JobReferral } from "../type/jobs/referral";

const STORAGE_KEY = "ogera_job_referrals";

/**
 * Temporary frontend opportunities.
 *
 * These are hardcoded only until the backend referral system is connected.
 * Prashant will later replace this localStorage layer with the
 * real API without changing the referral UI.
 */
const DEFAULT_REFERRALS: JobReferral[] = [
  {
    id: "one-acre-fund-rwanda-recruitment-intern-2026",

    title: "Rwanda Recruitment Intern",

    company: "One Acre Fund",

    location: "Kigali, Rwanda",

    type: "Internship",

    category: "Human Resources / Recruitment",

    description: `One Acre Fund is seeking a curious and eager-to-learn professional to kickstart their recruitment career by mastering the engine room of hiring processes and driving excellent candidate experiences.

As a Recruitment Intern in Rwanda, you will support the Recruitment Operations team and work closely with the Recruitment Manager and global recruitment team.

Responsibilities include:

• Supporting recurring recruitment operations while minimizing errors.
• Supporting candidate selection and assessment from application through hiring.
• Providing excellent candidate support throughout the recruitment process.
• Managing candidate information through an applicant tracking system (ATS).
• Supporting recruitment projects and process improvements using data.

Qualifications:

• Bachelor's degree in any relevant field.
• 6–12 months of experience in HR, administration, or similar roles is an advantage.
• Experience with applicant tracking systems such as Greenhouse is desirable but not required.
• Experience working with multiple stakeholders.
• Basic data analysis skills.
• Ability to maintain Excel or Google Sheets tracking systems.
• Strong learning ability, curiosity, and attention to detail.
• Excellent French and English proficiency.

Start date: As soon as possible.

Work location: Kigali, Rwanda.

Benefits: Interns receive a reasonable internship stipend.

Eligibility: This opportunity is only open to citizens or permanent residents of Rwanda.

Application deadline: 2 September 2026.

One Acre Fund states that it never asks candidates to pay for tests or any stage of the interview process. Official One Acre Fund emails come from an @oneacrefund.org address.`,

    source: "One Acre Fund",

    originalUrl:
      "https://oneacrefund.org/vacancies/rwanda-recrutement-stagiaire",

    verificationStatus: "Confirmed",

    status: "active",

    expiryDate: "2026-09-02",

    views: 0,

    applyClicks: 0,

    reportedApplications: 0,

    createdBy: "ogera-admin",

    permissionStatus: "Granted",

    verificationNotes: "Verified directly from official source.",

    createdAt: new Date().toISOString(),
  },

  {
    id: "one-acre-fund-rwanda-procurement-store-intern-2026",

    title: "Rwanda Procurement Store Intern",

    company: "One Acre Fund",

    location: "Kigali, Rwanda",

    type: "Internship",

    category: "Procurement / Supply Chain",

    description: `One Acre Fund is seeking a capable Procurement Store Intern to support procurement activities, inventory operations, and the efficient supply and distribution of items across multiple locations.

The internship is part of One Acre Fund's Young Professionals Program, which provides high-performing African graduates with meaningful internships, training, mentorship, and practical work experience.

Responsibilities include:

• Supporting inventory quality control.
• Verifying the quantity, quality, and specifications of goods received from suppliers.
• Supporting inspection processes and reporting damaged, expired, or non-compliant items.
• Maintaining accurate inventory records.
• Supporting physical stock counts and inventory verification.
• Recording and reconciling discrepancies between physical and system records.
• Supporting warehouse organization, labeling, and storage.
• Preparing inventory for dispatch.
• Supporting packaging, documentation, loading, and shipment coordination.
• Tracking outgoing deliveries.
• Working with procurement, inventory, and logistics teams.
• Contributing to continuous improvement of operational processes.

Qualifications:

• Bachelor's degree in Procurement, Supply Chain Management, Logistics, Business Administration, Accounting, or a related field.
• 6–12 months of experience in inventory management, procurement, or similar work is an advantage.
• Knowledge of or ability to learn inventory or warehouse management systems.
• Basic Microsoft Office and Google Workspace skills.
• Good communication and interpersonal skills.
• Proficiency in Kinyarwanda and English.

Start date: As soon as possible.

Work location: Kigali, Rwanda.

Benefits: Interns receive a reasonable stipend for the duration of the contract.

Eligibility: This opportunity is only open to citizens or permanent residents of Rwanda.

Application deadline: 19 September 2026.

One Acre Fund states that it never asks candidates to pay money for tests or any stage of the interview process. Official One Acre Fund emails come from an @oneacrefund.org address.`,

    source: "One Acre Fund",

    originalUrl:
      "https://oneacrefund.org/vacancies/rwanda-procurement-store-intern",

    verificationStatus: "Confirmed",

    status: "active",

    expiryDate: "2026-09-19",

    views: 0,

    applyClicks: 0,

    reportedApplications: 0,

    createdBy: "ogera-admin",

    permissionStatus: "Granted",

    verificationNotes: "Verified directly from official source.",

    createdAt: new Date().toISOString(),
  },

  {
    id: "one-acre-fund-mel-data-automation-officer-2026",

    title: "MEL Data Automation Officer",

    company: "One Acre Fund",

    location: "Addis Ababa or Bahir Dar, Ethiopia",

    type: "Internship",

    category: "Data / Monitoring, Evaluation & Learning",

    description: `One Acre Fund is seeking an intern for a 6-month internship to support its Monitoring, Evaluation, and Learning (MEL) team.

The intern will contribute to projects focused on improving One Acre Fund's ability to serve farmers and improve agricultural productivity and incomes.

Responsibilities include:

• Cleaning and analyzing primary data collected from farmers and markets.
• Visualizing results.
• Compiling results into actionable reports.
• Building and supporting automated dashboards.
• Contributing to projects that generate actionable insights from real-world data.

Qualifications:

• Education in Economics, Statistics, or a related field.
• Experience cleaning and analyzing large datasets.
• Proficiency in R or Stata.
• Data visualization and report-writing skills.
• Fluency in English.
• Prior relevant experience is an advantage, ideally at least one year.

Start date: As soon as possible.

Contract duration: 6 months.

Work location: Addis Ababa or Bahir Dar, Ethiopia.

Eligibility: These internships are only open to citizens or permanent residents of Uganda or Ethiopia.

Application deadline: 5 October 2026.

One Acre Fund states that it never asks candidates to pay money for tests or any stage of the interview process. Official One Acre Fund emails come from an @oneacrefund.org address.`,

    source: "One Acre Fund",

    originalUrl:
      "https://oneacrefund.org/vacancies/mel-data-automation-officer",

    verificationStatus: "Confirmed",

    status: "active",

    expiryDate: "2026-10-05",

    views: 0,

    applyClicks: 0,

    reportedApplications: 0,

    createdBy: "ogera-admin",

    permissionStatus: "Granted",

    verificationNotes: "Verified directly from official source.",

    createdAt: new Date().toISOString(),
  },
];

/**
 * Adds temporary hardcoded opportunities without deleting existing
 * localStorage referrals.
 */
const ensureDefaultReferrals = (): JobReferral[] => {
  const stored = localStorage.getItem(STORAGE_KEY);

  let referrals: JobReferral[] = [];

  if (stored) {
    try {
      referrals = JSON.parse(stored) as JobReferral[];
    } catch {
      referrals = [];
    }
  }

  const existingIds = new Set(referrals.map((referral) => referral.id));

  const missingDefaults = DEFAULT_REFERRALS.filter(
    (referral) => !existingIds.has(referral.id),
  );

  if (missingDefaults.length > 0) {
    referrals = [...referrals, ...missingDefaults];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(referrals),
    );
  }

  return referrals;
};

export const getReferrals = (): JobReferral[] => {
  return ensureDefaultReferrals();
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