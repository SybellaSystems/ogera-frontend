# Architecture

**File:** `/doc/03-architecture.md`

This document describes the architecture of the Ogera frontend application, including its source-code organization, routing, state management, API services, reusable components, feature modules, layouts, validation, localization, and communication with the backend.

The Ogera frontend is a React and TypeScript application. It acts as the client and presentation layer of the platform, while the backend remains responsible for business logic, authorization, persistent data, database operations, and external service integrations.

---

## 1. High-Level Architecture

```text
Browser
   |
   v
Ogera React Frontend
   |
   +-- main.tsx
   |     |
   |     +-- i18n
   |     +-- Theme
   |     +-- Redux Store
   |     +-- Toast/Notifications
   |     +-- App
   |
   v
App.tsx
   |
   +-- React Router
   |     |
   |     +-- Public Routes
   |     +-- Protected Routes
   |     +-- Role-based Layouts
   |     +-- Feature Gates
   |
   +-- Pages
   +-- Features
   +-- Components
   +-- Hooks
   +-- Contexts
   |
   +-- Services
   |     |
   |     +-- API Services
   |     +-- RTK Query apiSlice
   |     +-- Axios-based services
   |
   +-- Validation
   +-- Utils
   +-- Constants
   +-- Types
   |
   v
Ogera Backend
   |
   +-- REST API
   +-- Authentication
   +-- Authorization
   +-- Business Logic
   +-- Socket.IO
   |
   +------------------+
                      |
                      v
              PostgreSQL
              External Services
```

---

## 2. Frontend Technology Stack

The Ogera frontend is built using:

| Technology | Responsibility |
|---|---|
| React | UI and component architecture |
| TypeScript | Static typing |
| Vite | Frontend development and build tooling |
| React Router | Client-side routing |
| Redux / Redux Toolkit | Global application state |
| RTK Query | API data fetching and caching |
| Axios | HTTP API communication where applicable |
| Material UI | UI component library |
| i18n | Internationalization |
| Context API | Shared contextual application state |
| CSS | Application styling |
| Form validation | Client-side form validation |

---

## 3. Frontend Directory Structure

The current Ogera frontend follows this high-level structure:

```text
frontend/
│
├── public/
├── scripts/
│
├── src/
│   ├── appStore/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── constants/
│   ├── contexts/
│   ├── examples/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── locales/
│   ├── pages/
│   ├── services/
│   │   └── api/
│   │       ├── academicRecordsApi.tsx
│   │       ├── academicVerificationApi.tsx
│   │       ├── adminApi.tsx
│   │       ├── apiSlice.tsx
│   │       └── ...
│   ├── type/
│   ├── types/
│   ├── utils/
│   ├── validation/
│   ├── App.tsx
│   ├── i18n.ts
│   ├── index.css
│   ├── main.tsx
│   ├── theme.ts
│   └── vite-env.d.ts
│
├── .dockerignore
├── .env
├── .gitignore
├── Dockerfile
├── eslint.config.js
└── ...
```

The exact contents of feature, page, component, and API directories may change as the project evolves.

---

## 4. Application Entry Point

The frontend application starts from:

```text
src/main.tsx
```

`main.tsx` initializes the application and composes the providers and global configuration required by the frontend, including:

- React rendering.
- Internationalization.
- Redux store/provider.
- Theme configuration.
- Application-level context.
- Toast or notification functionality.
- The root `App` component.

---

## 5. Application Root and Routing

The root application component is:

```text
src/App.tsx
```

`App.tsx` composes the frontend route structure and connects the application to its layouts and protected areas.

The routing architecture separates:

- Public pages.
- Authenticated pages.
- Role-specific pages.
- Administrative pages.
- Feature-specific pages.

Route protection and feature access are controlled at the frontend level for navigation and user experience. The backend remains the authoritative authorization layer.

---

## 6. Layout Architecture

The frontend contains:

```text
src/layouts/
```

Layouts provide common application structures around pages belonging to particular user areas.

Role-oriented layouts include areas such as:

```text
Student Layout
Employer Layout
Admin Layout
```

Layouts are responsible for shared structures such as:

- Navigation.
- Sidebars.
- Headers.
- Dashboard structure.
- Common page containers.
- Role-specific navigation.

---

## 7. Pages

Application screens are organized under:

```text
src/pages/
```

Pages represent complete application views and normally compose:

- Reusable components.
- Feature components.
- API services.
- Hooks.
- Forms.
- Validation.
- Application state.

Pages should coordinate feature-specific screens rather than duplicating reusable component or API-service logic.

---

## 8. Feature Modules

Feature-specific functionality is organized under:

```text
src/features/
```

Feature modules provide a location for functionality belonging to specific business or application features.

Feature-specific implementation should remain close to the feature it supports where this improves maintainability.

---

## 9. Reusable Components

Shared UI components are organized under:

```text
src/components/
```

Reusable components provide common UI and interaction patterns, including:

- Cards.
- Forms.
- Modals.
- Tables.
- Tabs.
- Filters.
- Buttons.
- Status indicators.
- Loading states.
- Empty states.
- Navigation elements.

Existing shared components should be reviewed before creating new ones.

---

## 10. State Management

The frontend contains:

```text
src/appStore/
```

for application-level state management.

The architecture separates:

```text
Application State
       +
Server/API State
       +
Local Component State
```

Redux is used for shared application state.

RTK Query is used for server/API data fetching, caching, mutations, and synchronization where the corresponding API service uses the shared API slice.

Local component state should be used for temporary UI state that does not need to be shared globally.

---

## 11. API Service Architecture

API communication is organized under:

```text
src/services/
```

with API-specific services under:

```text
src/services/api/
```

The current structure includes API modules such as:

```text
src/services/api/
├── academicRecordsApi.tsx
├── academicVerificationApi.tsx
├── adminApi.tsx
├── apiSlice.tsx
└── ...
```

API services are organized around Ogera feature/domain functionality and are responsible for communicating with the backend.

---

## 12. RTK Query Architecture

The shared RTK Query infrastructure is represented by:

```text
src/services/api/apiSlice.tsx
```

RTK Query provides:

- Data fetching.
- Query caching.
- Mutations.
- Request lifecycle management.
- Cache invalidation.
- API state management.

Conceptually:

```text
React Page
    |
    v
Feature API Module
    |
    v
apiSlice
    |
    v
Ogera Backend API
```

The RTK Query cache is a client-side representation of backend data and is not the authoritative source of business data.

---

## 13. Axios Services

The frontend also contains Axios-based API communication where required.

Axios services can centralize:

- API requests.
- Request configuration.
- Authentication handling.
- Response processing.
- Error handling.
- Reauthentication where applicable.

New API integrations should follow the established RTK Query or Axios pattern instead of introducing another HTTP client unnecessarily.

---

## 14. Authentication Architecture

Authentication follows a frontend-to-backend flow:

```text
User
 |
 v
Login / Registration Page
 |
 v
Frontend API Service
 |
 v
Ogera Backend
 |
 +-- Authenticate User
 +-- Validate Credentials
 +-- Create/Refresh Session
 |
 v
Frontend Authentication State
 |
 v
Protected Routes
 |
 v
Role-specific Application
```

The frontend maintains the client-side authentication state required to render the appropriate application experience.

The backend remains responsible for credential validation, token/session validation, authorization, and permission enforcement.

---

## 15. Role and Permission Architecture

Ogera supports different user experiences based on roles and permissions.

The frontend supports role-specific areas for:

- Students.
- Employers.
- Administrators.
- Super administrators.

Administrative access may also be divided into specialized roles.

The frontend uses the authenticated user's role and application state to determine which UI elements and routes should be presented.

The backend must independently verify permissions for every protected operation.

---

## 16. Context Architecture

The frontend contains:

```text
src/contexts/
```

for React Context-based shared state and configuration.

Context should be used for application concerns that benefit from shared access without requiring Redux.

Context should not replace the API service layer or backend business logic.

---

## 17. Custom Hooks

Reusable React hooks are organized under:

```text
src/hooks/
```

Hooks encapsulate reusable frontend behavior such as:

- Shared UI behavior.
- State-related logic.
- API-related interaction.
- Authentication-related behavior.
- Feature-specific reusable logic.

---

## 18. Configuration

Application configuration is organized under:

```text
src/config/
```

Environment-dependent and application-level configuration should be centralized where practical.

Sensitive secrets must not be exposed through frontend source code or client-accessible environment variables.

---

## 19. Constants

Shared application constants are maintained under:

```text
src/constants/
```

Constants should be used for values shared across multiple application areas, such as status values, identifiers, and feature configuration.

---

## 20. Type Definitions

The frontend contains:

```text
src/type/
src/types/
```

for TypeScript type definitions.

Types should describe:

- API responses.
- API requests.
- Component props.
- Application state.
- Domain entities.
- Form data.
- Shared TypeScript structures.

Existing type definitions should be reviewed before creating duplicate types.

---

## 21. Validation

Frontend validation logic is organized under:

```text
src/validation/
```

Client-side validation is used for forms and input validation where required.

Client-side validation improves user experience but does not replace backend validation.

---

## 22. Utilities

Shared helper functionality is maintained under:

```text
src/utils/
```

Utilities should contain generic reusable logic rather than feature-specific business workflows.

---

## 23. Localization

Localization resources are maintained under:

```text
src/locales/
```

and internationalization is initialized through:

```text
src/i18n.ts
```

Internationalized user-facing content should use the established i18n mechanism where translation support is required.

---

## 24. Theme and Styling

The frontend contains:

```text
src/theme.ts
src/index.css
```

The theme provides shared visual configuration, while global CSS provides global styling requirements.

New UI should follow the existing Ogera Material UI, theme, and styling conventions.

---

## 25. Assets and Static Resources

Frontend assets are organized under:

```text
src/assets/
```

Static public resources are maintained under:

```text
public/
```

The distinction should be maintained:

- `src/assets/` for assets managed through the frontend build system.
- `public/` for resources served directly as public static files.

---

## 26. Scripts and Development Support

The project contains:

```text
scripts/
```

for project-specific development or automation scripts.

Scripts should support repeatable project operations without embedding operational procedures into unrelated components.

---

## 27. Examples

The project contains:

```text
src/examples/
```

Example implementations should remain clearly distinguishable from production application functionality.

Production features should not depend on example code unless explicitly intended and documented.

---

## 28. Realtime Communication

The Ogera backend supports Socket.IO.

Where realtime functionality is required, the frontend communicates with the backend through the configured realtime connection.

This can support areas such as:

- Messaging.
- Dispute communication.
- Realtime notifications or supported events.

Socket.IO should complement the REST API rather than becoming an independent source of persistent business truth.

---

## 29. Frontend-to-Backend Boundary

The frontend communicates with the backend through:

```text
HTTP API
   +
Socket.IO
```

The frontend does not directly communicate with PostgreSQL.

```text
Ogera Frontend
      |
      +-- REST API
      +-- Socket.IO
      |
      v
Ogera Backend
      |
      +-- Business Logic
      +-- Authorization
      +-- Database Access
      +-- External Services
      |
      v
PostgreSQL
```

The backend is authoritative for users, permissions, jobs, applications, tasks, payments, academic verification, trust-related records, disputes, and other persistent business data.

---

## 30. Data Flow

The normal data flow is:

```text
User Interaction
       |
       v
React Page / Component
       |
       v
Hook / Feature Logic
       |
       v
RTK Query / Axios Service
       |
       v
Ogera Backend API
       |
       v
Backend Business Logic
       |
       +----> PostgreSQL
       |
       +----> External Services
       |
       v
API Response
       |
       v
RTK Query Cache / Redux / Local State
       |
       v
React Component
       |
       v
Updated UI
```

This architecture keeps backend business rules outside the frontend.

---

## 31. Security Boundary

The frontend should be treated as an untrusted client from a security perspective.

Frontend controls such as:

```text
ProtectedRoute
FeatureGate
Role-based navigation
Hidden buttons
Disabled actions
```

improve user experience but do not provide sufficient security by themselves.

The backend must independently enforce:

- Authentication.
- Authorization.
- Role permissions.
- Input validation.
- Resource ownership.
- Sensitive operations.

No security-sensitive business rule should rely exclusively on frontend implementation.

---

## 32. Architectural Principles

The Ogera frontend should follow these principles:

1. Use the existing project structure.
2. Keep pages, components, hooks, API services, state, validation, and utilities separated by responsibility.
3. Reuse existing components, hooks, services, and types before creating duplicates.
4. Centralize API communication through the established RTK Query or Axios architecture.
5. Keep backend business rules and persistent data under backend control.
6. Use TypeScript appropriately throughout the application.
7. Avoid unnecessary duplication.
8. Maintain clear role separation.
9. Follow the existing Material UI and theme system.
10. Never rely exclusively on frontend checks for security.

---

## 33. Architecture Change Guidelines

Before modifying the frontend architecture:

1. Review the existing directory and feature structure.
2. Analyze the existing implementation pattern.
3. Check for reusable components, hooks, services, and types.
4. Reuse the established API communication pattern.
5. Avoid introducing duplicate state-management or HTTP patterns.
6. Ensure existing role-specific routes remain functional.
7. Test affected API and UI workflows.
8. Update this document when the architecture changes significantly.

For an existing feature, developers should analyze the current implementation first and then update or create files according to the established Ogera frontend structure.

---

## 34. Source of Truth

The actual frontend repository is the source of truth for implementation details.

Primary areas include:

```text
src/
├── appStore/
├── assets/
├── components/
├── config/
├── constants/
├── contexts/
├── examples/
├── features/
├── hooks/
├── layouts/
├── locales/
├── pages/
├── services/
├── type/
├── types/
├── utils/
├── validation/
├── App.tsx
├── i18n.ts
├── main.tsx
├── theme.ts
└── index.css
```

If the repository structure changes, this architecture documentation must be updated accordingly.

---

## 35. Summary

The Ogera frontend follows a layered React architecture:

```text
Browser
   |
   v
main.tsx
   |
   v
App.tsx
   |
   +-- Routing
   +-- Protected Routes
   +-- Role Layouts
   |
   v
Pages / Features
   |
   +-- Components
   +-- Hooks
   +-- Contexts
   +-- Validation
   +-- Utils
   |
   v
Redux / RTK Query
   |
   v
Services / API
   |
   +-- apiSlice
   +-- Feature API Services
   +-- Axios Services
   |
   v
Ogera Backend
   |
   +-- REST API
   +-- Socket.IO
   +-- Business Logic
   +-- Authorization
   |
   v
PostgreSQL / External Services
```

The frontend is responsible for presentation, navigation, client-side state, user interaction, API consumption, and frontend validation.

The Ogera backend remains responsible for authentication, authorization, business rules, persistent data, database operations, and external service integrations.
