# Requirements

## Functional requirements

- REQ-001: Unauthenticated users can register, sign in, recover passwords, verify email/phone, and complete 2FA when enabled.
- REQ-002: Authenticated users are routed to a role-appropriate dashboard and protected pages.
- REQ-003: Students and employers can use job, application, task, profile, messaging, and payment workflows appropriate to their role.
- REQ-004: Administrators can access authorized user, role, permission, verification, dispute, course, assessment, referral, notification, and analytics views.
- REQ-005: The UI provides loading, error, empty, validation, success, and unauthorized states for API workflows.
- REQ-006: Forms validate input before mutation and display backend validation failures.
- REQ-007: The application supports responsive layouts and configured languages.

## Non-functional requirements

- NFR-001 Security: never persist secrets in source, use authenticated API calls, protect route access, and avoid unsafe external links.
- NFR-002 Performance: use RTK Query caching, pagination, lazy/conditional queries, and responsive asset loading where appropriate.
- NFR-003 Accessibility: use semantic controls, labels, keyboard-focusable interactions, status messaging, and meaningful icons/alt text.
- NFR-004 Compatibility: support the browsers targeted by the current Vite/React build and desktop/mobile layouts.
- NFR-005 Maintainability: keep API endpoints in `src/services/api`, shared state in Redux, and reusable UI in components/layouts.
