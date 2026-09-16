# API Documentation

**File:** `/doc/04-api.md`

This document describes how the Ogera frontend communicates with the backend API, where API integrations are maintained, how API state is managed, and how frontend API changes must be handled.

The Ogera backend is the authoritative source for API contracts, authentication, authorization, validation, business rules, and persistent data.

---

## 1. API Architecture

The Ogera frontend communicates with the backend through centralized API services.

```text
Ogera Frontend
      |
      v
React Pages / Features / Components
      |
      v
API Services
      |
      +-- src/services/api/
      |     |
      |     +-- apiSlice.tsx
      |     +-- academicRecordsApi.tsx
      |     +-- academicVerificationApi...
      |     +-- adminApi.tsx
      |     +-- Other Feature API Services
      |
      +-- src/services/
            |
            +-- referralStorage.ts
      |
      v
Ogera Backend API
      |
      +-- Authentication
      +-- Authorization
      +-- Business Logic
      +-- Validation
      |
      v
PostgreSQL / External Services
```

The frontend does not communicate directly with PostgreSQL. All persistent business operations are performed through the backend.

---

## 2. Backend API as the Source of Truth

The backend is the authoritative source for API contracts and endpoint behavior.

Before creating or modifying a frontend API service, developers should review the corresponding backend implementation and API documentation.

Backend API documentation includes:

```text
ogera-be/doc/04-api-documentation.md
ogera-be/API_DOCUMENTATION.md
```

Interactive Swagger documentation is available from the backend at:

```text
/api-docs
```

The frontend API layer must remain consistent with the backend for:

- Endpoint paths.
- HTTP methods.
- Request parameters.
- Request bodies.
- Response structures.
- Authentication requirements.
- Authorization requirements.
- Status values.
- Error responses.

---

## 3. Frontend API Directory

The primary frontend API services are maintained under:

```text
src/services/api/
```

The current project structure includes:

```text
src/services/
└── api/
    ├── academicRecordsApi.tsx
    ├── academicVerificationApi...
    ├── adminApi.tsx
    ├── apiSlice.tsx
    └── ...
```

The API directory contains feature-specific service modules.

Additional API services may be added as new Ogera features are implemented.

The service structure should follow the existing project organization instead of creating API calls directly inside unrelated pages or components.

---

## 4. Shared API Slice

The shared API infrastructure is located at:

```text
src/services/api/apiSlice.tsx
```

The API slice provides the common RTK Query infrastructure used by frontend API services.

It is responsible for shared API behavior such as:

- API configuration.
- Query management.
- Mutation management.
- Client-side API caching.
- Tag types.
- Cache invalidation.
- Shared request behavior.

Conceptually:

```text
Feature API Service
        |
        v
apiSlice
        |
        v
Ogera Backend API
```

The API cache is only a client-side representation of backend data. It is not the authoritative source of persistent data.

---

## 5. Feature API Services

Feature-specific API integrations are maintained under:

```text
src/services/api/
```

The current structure includes services such as:

### Academic Records

```text
src/services/api/academicRecordsApi.tsx
```

This service handles frontend API communication related to academic records.

### Academic Verification

```text
src/services/api/academicVerificationApi...
```

This service handles frontend API communication related to academic verification workflows.

### Administration

```text
src/services/api/adminApi.tsx
```

This service handles API communication for supported administrative functionality.

Other feature-specific API services may cover areas such as:

- Jobs.
- Job applications.
- Tasks.
- Referrals.
- Assessments.
- Courses.
- Trust-related functionality.
- Notifications.
- Messaging.
- Disputes.
- Payments.
- Profiles.

The exact available services must be verified from the current repository before implementation changes are made.

---

## 6. Referral Storage

The frontend also contains:

```text
src/services/referralStorage.ts
```

This module is separate from the API directory and should not be treated as a backend API service unless its implementation explicitly communicates with an API.

It should be reviewed before modifying referral-related frontend data handling to determine whether a change belongs in local/client storage or in the backend API service layer.

---

## 7. API Request Flow

The normal frontend API flow is:

```text
User Interaction
       |
       v
Page / Feature / Component
       |
       v
Feature API Service
       |
       v
apiSlice
       |
       v
Ogera Backend API
       |
       +-- Authentication
       +-- Authorization
       +-- Validation
       +-- Business Logic
       |
       +-- PostgreSQL
       +-- External Services
       |
       v
API Response
       |
       v
RTK Query / Application State
       |
       v
React Component
       |
       v
Updated UI
```

This structure keeps HTTP communication separate from presentation logic.

---

## 8. API Authentication

Protected API requests use the authentication mechanism provided by the Ogera backend.

The general authentication flow is:

```text
User
 |
 v
Login / Registration
 |
 v
Frontend API Service
 |
 v
Ogera Backend
 |
 +-- Validate Credentials
 +-- Authenticate User
 +-- Create / Refresh Session
 |
 v
Frontend Authentication State
 |
 v
Protected API Requests
```

The frontend may use authenticated user state to determine which parts of the application should be displayed.

The backend remains responsible for validating authentication for protected API requests.

---

## 9. API Authorization

Frontend role and permission checks are used to control navigation and user experience.

The frontend may use:

- Protected routes.
- Role-based layouts.
- Feature gates.
- Permission-aware UI.
- Hidden or disabled actions.

These controls do not replace backend authorization.

The backend must independently verify:

- User identity.
- User role.
- Required permissions.
- Resource ownership.
- Sensitive operations.

```text
Frontend Access Check
        |
        v
User Experience

Backend Authorization
        |
        v
Security Boundary
```

---

## 10. API Request and Response Types

Frontend API data should be represented using TypeScript types.

Relevant locations in the current frontend structure include:

```text
src/type/
src/types/
```

Types should be used for:

- Request parameters.
- Request bodies.
- API responses.
- Query results.
- Mutation results.
- Domain entities.
- Component-facing API data.

Existing types should be reviewed before creating new types to avoid duplicate representations of the same backend entity.

Frontend types should reflect the backend API contract.

---

## 11. Query and Mutation Handling

Where RTK Query is used, API services should define queries and mutations according to the backend endpoint behavior.

### Queries

Queries are used to retrieve backend data.

Examples include:

- Fetching jobs.
- Fetching applications.
- Fetching academic records.
- Fetching verification information.
- Fetching administrative data.
- Fetching referrals.

### Mutations

Mutations are used to change backend state.

Examples include:

- Creating records.
- Updating records.
- Applying for jobs.
- Updating application status.
- Updating tasks.
- Submitting academic information.
- Updating verification data.
- Creating or updating disputes.
- Performing supported payment operations.

The appropriate cache invalidation or data refresh behavior should be configured after mutations.

---

## 12. API Caching

RTK Query provides client-side caching for supported API services.

Caching can:

- Reduce unnecessary requests.
- Reuse recently fetched data.
- Keep related pages synchronized.
- Refresh affected data after mutations.

Developers should use the existing API slice and tag strategy rather than introducing a separate caching mechanism for the same backend data.

The frontend cache must not be treated as permanent storage.

---

## 13. API Error Handling

Frontend API integrations must handle expected API failures consistently.

Common HTTP responses include:

| Status | Meaning |
|---|---|
| `400` | Invalid request or validation failure |
| `401` | Authentication failure |
| `403` | Insufficient permission |
| `404` | Resource not found |
| `409` | Business or resource conflict |
| `422` | Validation/business-rule failure where applicable |
| `429` | Rate limit exceeded |
| `500` | Backend/server error |
| `502/503/504` | Upstream or service availability failure |

The frontend should:

1. Capture the API error.
2. Determine whether authentication recovery is required.
3. Display an appropriate user-facing message.
4. Preserve useful backend error information.
5. Avoid exposing internal stack traces or sensitive information.

---

## 14. API Loading and UI States

Pages and components consuming API data should handle the appropriate request states.

```text
API Request
    |
    +-- Loading
    |
    +-- Success
    |
    +-- Empty
    |
    +-- Error
```

The UI should provide appropriate feedback for:

- Loading data.
- Empty results.
- Failed requests.
- Successful mutations.
- Pending operations.
- Disabled actions.

When RTK Query already provides the required request state, components should reuse that state rather than creating duplicate request-state management.

---

## 15. Pagination and Filtering

API services may support pagination and filtering for datasets such as jobs, applications, referrals, assessments, and administrative records.

Depending on the endpoint, supported parameters may include:

```text
page
limit
status
search
location
category
currency
payment_range
```

The exact parameters must be based on the backend endpoint contract.

When implementing a new pagination or filtering option:

1. Confirm that the backend supports it.
2. Update the frontend API request type.
3. Update the API service.
4. Update the consuming page or feature.
5. Update cache behavior where required.
6. Test the complete request and response flow.
7. Update backend API documentation if the backend contract changed.

---

## 16. File Uploads and Downloads

Some Ogera workflows require file operations.

Examples include:

- Academic evidence.
- Resumes.
- Profile images.
- Dispute evidence.
- Other permitted user documents.

File requests must use the existing frontend API/service pattern applicable to the feature.

File operations must follow backend authorization and storage rules.

The frontend must not assume that a file URL is publicly accessible or that possession of a URL automatically grants permission to view a document.

---

## 17. API Status Values

Frontend API services must use the status values defined by the backend contract.

For example, job status values may include:

```text
Pending
Active
Inactive
Completed
```

Other Ogera entities have their own backend-defined status values.

Status values should not be renamed or independently redefined in the frontend because this can cause request/response incompatibility.

Whenever a backend status changes, all affected:

- API types.
- API services.
- Filters.
- Pages.
- Components.
- Tests.

must be reviewed.

---

## 18. API and Page Separation

Pages and components should not contain large amounts of raw API implementation.

Preferred structure:

```text
Page / Component
       |
       v
API Service / Hook
       |
       v
apiSlice
       |
       v
Backend API
```

Avoid placing the following directly throughout page components:

- Repeated endpoint URLs.
- Raw HTTP configuration.
- Duplicate request logic.
- Duplicate error handling.
- Repeated authentication handling.
- Backend business logic.

API communication should remain centralized in the established service architecture.

---

## 19. Backend and Frontend API Synchronization

When a backend API contract changes, the corresponding frontend integration must be reviewed.

The change process should be:

1. Update the backend endpoint.
2. Update backend API/OpenAPI documentation.
3. Update the frontend API service.
4. Update frontend TypeScript types.
5. Update affected pages and components.
6. Update API-related tests.
7. Verify authentication and authorization behavior.
8. Verify cache invalidation.
9. Test the complete workflow.
10. Update this documentation when the API architecture changes.

---

## 20. API Security Requirements

The frontend API documentation and examples must never contain real credentials.

Do not include:

- Real access tokens.
- Refresh tokens.
- Passwords.
- API secrets.
- Database credentials.
- Private signing keys.
- Production-only credentials.

Use placeholders in examples:

```text
Authorization: Bearer <access-token>
```

instead of real tokens.

Production credentials must never be committed to the frontend repository.

---

## 21. Environment Configuration

Frontend API configuration should use the project's established environment/configuration mechanism.

Relevant frontend configuration is organized under:

```text
src/config/
```

Environment-specific API values should not be hard-coded throughout individual API service files.

The frontend may use different API configuration for:

- Local development.
- Development/staging.
- Production.

Only values that are intentionally safe for client-side exposure should be included in frontend environment configuration.

Server-side secrets must remain in the backend environment.

---

## 22. API Testing

API-consuming frontend functionality should be tested as part of the relevant feature tests.

Testing should cover where applicable:

- Correct endpoint usage.
- Request parameters.
- Request payloads.
- Successful responses.
- Error responses.
- Authentication failures.
- Authorization-related UI behavior.
- Loading states.
- Empty states.
- Mutation behavior.
- Cache invalidation.
- Pagination and filtering.
- File operations.

Backend API behavior must also be tested separately according to the backend testing strategy.

---

## 23. API Change Guidelines

Before creating or modifying an API integration:

1. Review the existing frontend API directory.
2. Review the corresponding backend endpoint.
3. Review the backend API documentation.
4. Check whether the endpoint already exists in a frontend service.
5. Check existing TypeScript types.
6. Check the shared `apiSlice`.
7. Reuse the established API pattern.
8. Update the consuming page, feature, or component.
9. Verify loading and error states.
10. Verify cache invalidation.
11. Test the affected workflow.
12. Update documentation when the architecture or contract changes.

Do not create duplicate API services for an endpoint that is already implemented.

---

## 24. API Documentation Maintenance

This document should be updated when there are significant changes to:

- Frontend API service organization.
- RTK Query architecture.
- `apiSlice` configuration.
- API authentication behavior.
- API caching strategy.
- File upload/download handling.
- API environment configuration.
- Frontend/backend API boundaries.

Endpoint-level API contracts should remain documented by the backend API documentation.

---

## 25. Source of Truth

For frontend API integration, the primary source locations are:

```text
src/services/
├── api/
│   ├── academicRecordsApi.tsx
│   ├── academicVerificationApi...
│   ├── adminApi.tsx
│   ├── apiSlice.tsx
│   └── ...
│
└── referralStorage.ts
```

Related frontend locations include:

```text
src/config/
src/type/
src/types/
src/hooks/
src/features/
src/pages/
src/components/
```

For backend API contracts, review:

```text
ogera-be/doc/04-api-documentation.md
ogera-be/API_DOCUMENTATION.md
```

Interactive Swagger documentation:

```text
/api-docs
```

When documentation and implementation differ, the backend implementation and current backend API contract should be verified before changing the frontend integration.

---

## 26. Summary

The Ogera frontend uses a centralized API architecture:

```text
React Pages / Features / Components
              |
              v
       Feature API Services
              |
              v
       apiSlice / RTK Query
              |
              v
       Ogera Backend API
              |
      +-------+-------+
      |               |
      v               v
 PostgreSQL      External Services
```

The primary API integration location is:

```text
src/services/api/
```

The shared API infrastructure is:

```text
src/services/api/apiSlice.tsx
```

The frontend API layer is responsible for communicating with the backend and managing client-side API state.

The backend remains the authoritative source for:

- API contracts.
- Authentication.
- Authorization.
- Validation.
- Business rules.
- Persistent data.
- Database operations.
- External service integrations.

Any significant API contract or frontend integration change must be reflected in the appropriate API services, types, tests, and documentation.
