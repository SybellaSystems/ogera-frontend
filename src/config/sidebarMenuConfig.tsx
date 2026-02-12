import {
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BellIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType } from "react";

export interface SubMenuItem {
  label: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface MenuItemConfig {
  permissionRoute: string; // The route from permission JSON (e.g., "/jobs", "/academic-verifications")
  label: string;
  icon: ComponentType<{ className?: string }>;
  menuKey: string; // Unique key for the menu (e.g., "jobs", "academic")
  basePath: string; // Base path for navigation (e.g., "/dashboard/jobs")
  hasSubmenu: boolean;
  submenuItems?: SubMenuItem[];
  // For simple items without submenu, just navigate to this path
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
    icon: BriefcaseIcon,
    menuKey: "jobs",
    basePath: "/dashboard/jobs",
    hasSubmenu: true,
    submenuItems: [
      { label: "All Jobs", path: "/dashboard/jobs/all" },
      { label: "Active Jobs", path: "/dashboard/jobs/active" },
      { label: "Completed", path: "/dashboard/jobs/completed" },
      { label: "Job Categories", path: "/dashboard/jobs/categories" },
    ],
  },
  {
    permissionRoute: "/academic-verifications",
    label: "Academic Verification",
    icon: AcademicCapIcon,
    menuKey: "academic",
    basePath: "/dashboard/academic",
    hasSubmenu: true,
    submenuItems: [
      { label: "Pending Reviews", path: "/dashboard/academic/pending" },
      { label: "Approved", path: "/dashboard/academic/approved" },
      { label: "Rejected", path: "/dashboard/academic/rejected" },
      { label: "Performance Track", path: "/dashboard/academic/performance" },
      { label: "Account Locks", path: "/dashboard/academic/locks" },
    ],
  },
  {
    permissionRoute: "/job-applications",
    label: "Job Applications",
    icon: BriefcaseIcon,
    menuKey: "job-applications",
    basePath: "/dashboard/jobs/applications",
    hasSubmenu: false,
    directPath: "/dashboard/jobs/applications",
  },
  {
    permissionRoute: "/notifications",
    label: "Notifications",
    icon: BellIcon,
    menuKey: "notifications",
    basePath: "/dashboard/notifications",
    hasSubmenu: false,
    directPath: "/dashboard/notifications",
  },
  {
    permissionRoute: "/roles",
    label: "Role",
    icon: ShieldCheckIcon,
    menuKey: "role",
    basePath: "/dashboard/role",
    hasSubmenu: true,
    submenuItems: [
      { label: "Create", path: "/dashboard/role/create" },
      { label: "View", path: "/dashboard/role/view" },
    ],
  },
  {
    permissionRoute: "/analytics",
    label: "Analytics",
    icon: ChartBarIcon,
    menuKey: "analytics",
    basePath: "/dashboard/analytics",
    hasSubmenu: false,
    directPath: "/dashboard/analytics",
  },
  {
    permissionRoute: "/transactions",
    label: "Transaction",
    icon: CreditCardIcon,
    menuKey: "transactions",
    basePath: "/dashboard/transactions",
    hasSubmenu: false,
    directPath: "/dashboard/transactions",
  },
  {
    permissionRoute: "/disputes",
    label: "Disputes",
    icon: ExclamationTriangleIcon,
    menuKey: "disputes",
    basePath: "/dashboard/disputes",
    hasSubmenu: true,
    submenuItems: [
      { label: "Open Disputes", path: "/dashboard/disputes/open" },
      { label: "In Progress", path: "/dashboard/disputes/in-progress" },
      { label: "Resolved", path: "/dashboard/disputes/resolved" },
    ],
  },
  {
    permissionRoute: "/courses",
    label: "Courses",
    icon: BookOpenIcon,
    menuKey: "courses",
    basePath: "/dashboard/courses",
    hasSubmenu: true,
    submenuItems: [
      { label: "Add Courses", path: "/dashboard/courses/add" },
      { label: "View Courses", path: "/dashboard/courses/view" },
      { label: "Course Analytics", path: "/dashboard/courses/analytics" },
    ],
  },
];
