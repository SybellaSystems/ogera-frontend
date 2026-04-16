import {
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType } from "react";

export interface SubMenuItem {
  label: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
  labelKey?: string; // i18n key e.g. "sidebar.allJobs"
}

export interface MenuItemConfig {
  permissionRoute: string;
  label: string;
  labelKey: string; // i18n key e.g. "sidebar.jobs"
  icon: ComponentType<{ className?: string }>;
  menuKey: string;
  basePath: string;
  hasSubmenu: boolean;
  submenuItems?: SubMenuItem[];
  directPath?: string;
}

/**
 * Configuration mapping permission routes to sidebar menu items
 * When a user has permission for a route, the corresponding menu item will be shown
 */
export const SIDEBAR_MENU_CONFIG: MenuItemConfig[] = [
  {
    permissionRoute: "/jobs",
    label: "Jobs",
    labelKey: "sidebar.jobs",
    icon: BriefcaseIcon,
    menuKey: "jobs",
    basePath: "/dashboard/jobs",
    hasSubmenu: true,
    submenuItems: [
      { label: "All Jobs", path: "/dashboard/jobs/all", labelKey: "sidebar.allJobs" },
      { label: "Active Jobs", path: "/dashboard/jobs/active", labelKey: "sidebar.activeJobs" },
      { label: "My Applications", path: "/dashboard/jobs/my-applications", labelKey: "sidebar.myApplications" },
      { label: "Accepted", path: "/dashboard/jobs/my-applications/accepted", labelKey: "sidebar.acceptedApplications" },
      { label: "Rejected", path: "/dashboard/jobs/my-applications/rejected", labelKey: "sidebar.rejectedApplications" },
      { label: "Completed", path: "/dashboard/jobs/completed", labelKey: "sidebar.completed" },
      { label: "Job Categories", path: "/dashboard/jobs/categories", labelKey: "sidebar.jobCategories" },
    ],
  },
  {
    permissionRoute: "/academic-verifications",
    label: "Academic Verification",
    labelKey: "sidebar.academicVerification",
    icon: AcademicCapIcon,
    menuKey: "academic",
    basePath: "/dashboard/academic",
    hasSubmenu: true,
    submenuItems: [
      { label: "Pending Reviews", path: "/dashboard/academic/pending", labelKey: "sidebar.pendingReviews" },
      { label: "Approved", path: "/dashboard/academic/approved", labelKey: "sidebar.approved" },
      { label: "Rejected", path: "/dashboard/academic/rejected", labelKey: "sidebar.rejected" },
      { label: "Resubmission Required", path: "/dashboard/academic/resubmission-required", labelKey: "sidebar.resubmissionRequired" },
      { label: "Performance Track", path: "/dashboard/academic/performance", labelKey: "sidebar.performanceTrack" },
      { label: "Account Locks", path: "/dashboard/academic/locks", labelKey: "sidebar.accountLocks" },
    ],
  },
  {
    permissionRoute: "/interviews",
    label: "Interviews",
    labelKey: "sidebar.interviews",
    icon: CalendarDaysIcon,
    menuKey: "interviews",
    basePath: "/dashboard/interviews",
    hasSubmenu: false,
    directPath: "/dashboard/interviews",
  },
  {
    permissionRoute: "/notifications",
    label: "Notifications",
    labelKey: "sidebar.notifications",
    icon: BellIcon,
    menuKey: "notifications",
    basePath: "/dashboard/notifications",
    hasSubmenu: false,
    directPath: "/dashboard/notifications",
  },
  {
    permissionRoute: "/roles",
    label: "Role",
    labelKey: "sidebar.role",
    icon: ShieldCheckIcon,
    menuKey: "role",
    basePath: "/dashboard/role",
    hasSubmenu: true,
    submenuItems: [
      { label: "Create", path: "/dashboard/role/create", labelKey: "sidebar.create" },
      { label: "View", path: "/dashboard/role/view", labelKey: "sidebar.view" },
    ],
  },
  {
    permissionRoute: "/analytics",
    label: "Analytics",
    labelKey: "sidebar.analytics",
    icon: ChartBarIcon,
    menuKey: "analytics",
    basePath: "/dashboard/analytics",
    hasSubmenu: false,
    directPath: "/dashboard/analytics",
  },
  {
    permissionRoute: "/transactions",
    label: "Transaction",
    labelKey: "sidebar.transaction",
    icon: CreditCardIcon,
    menuKey: "transactions",
    basePath: "/dashboard/transactions",
    hasSubmenu: true,
    submenuItems: [
      { label: "Transactions", path: "/dashboard/transactions" },
      { label: "Pay", path: "/dashboard/transactions/pay" },
      { label: "MoMo Payments", path: "/dashboard/transactions/momo-payments" },
    ],
  },
  {
    permissionRoute: "/disputes",
    label: "Disputes",
    labelKey: "sidebar.disputes",
    icon: ExclamationTriangleIcon,
    menuKey: "disputes",
    basePath: "/dashboard/disputes",
    hasSubmenu: true,
    submenuItems: [
      { label: "Open Disputes", path: "/dashboard/disputes/open", labelKey: "sidebar.openDisputes" },
      { label: "In Progress", path: "/dashboard/disputes/in-progress", labelKey: "sidebar.inProgress" },
      { label: "Resolved", path: "/dashboard/disputes/resolved", labelKey: "sidebar.resolved" },
    ],
  },
  {
    permissionRoute: "/courses",
    label: "Courses",
    labelKey: "sidebar.courses",
    icon: BookOpenIcon,
    menuKey: "courses",
    basePath: "/dashboard/courses",
    hasSubmenu: true,
    submenuItems: [
      { label: "Add Courses", path: "/dashboard/courses/add", labelKey: "sidebar.addCourses" },
      { label: "View Courses", path: "/dashboard/courses/view", labelKey: "sidebar.viewCourses" },
      { label: "Course Analytics", path: "/dashboard/courses/analytics", labelKey: "sidebar.courseAnalytics" },
    ],
  },
];
