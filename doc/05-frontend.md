# Frontend Documentation

**File:** `/doc/06-frontend.md`

This document describes the implementation standards and conventions used by the Ogera frontend. It explains the frontend framework, project structure, routing, components, state management, API integration, authentication and authorization handling, forms, validation, error and loading states, responsive design, accessibility, environment configuration, and build process.

The Ogera frontend is a React and TypeScript application that communicates with the Ogera backend through the project's API service layer. The backend remains responsible for business logic, authorization, validation, and persistent data.

---

## 1. Frontend Framework

The Ogera frontend uses:

| Technology | Purpose |
|---|---|
| React | UI framework |
| TypeScript | Static typing |
| Vite | Development server and production build tooling |
| React Router | Client-side routing |
| Redux Toolkit | Global application state |
| RTK Query | Server/API state and caching |
| Axios | API requests where imperative communication is required |
| Material UI | UI component library |
| Formik | Complex form state management |
| Yup | Form validation |
| i18n | Internationalization |
| CSS | Global and application styling |

The exact package versions are defined by the frontend project's package manifest and lock file. Developers must use the versions currently specified by the repository rather than documenting or installing arbitrary versions.

---

## 2. Project Structure

The current Ogera frontend follows this structure:

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
│   │       ├── academicVerificationApi...
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

### Main responsibilities

| Location | Responsibility |
|---|---|
| `src/main.tsx` | Application bootstrap and provider composition |
| `src/App.tsx` | Application route tree and access/layout selection |
| `src/pages/` | Route-level application screens |
| `src/components/` | Reusable UI components |
| `src/layouts/` | Shared role/application layouts |
| `src/features/` | Feature-specific frontend functionality |
| `src/appStore/` | Redux store and application state |
| `src/services/api/` | API service integrations |
| `src/contexts/` | Shared React Context functionality |
| `src/hooks/` | Reusable React hooks |
| `src/utils/` | Generic reusable utilities |
| `src/validation/` | Frontend validation logic |
| `src/locales/` | Translation resources |
| `src/config/` | Frontend configuration |
| `src/constants/` | Shared application constants |
| `src/type/`, `src/types/` | TypeScript definitions |
| `src/assets/` | Build-managed frontend assets |
| `public/` | Public static resources |

Developers should analyze the existing structure before creating a new file or directory.

---

## 3. Application Bootstrap

The frontend entry point is:

```text
src/main.tsx
```

`main.tsx` bootstraps the React application and composes the application-level configuration and providers.

The bootstrap layer is responsible for connecting the application to concerns such as:

- Redux.
- Internationalization.
- Theme configuration.
- Toast/notification functionality.
- React application rendering.
- Other application-wide providers used by the current implementation.

Application initialization should remain centralized rather than being duplicated across pages.

---

## 4. Application Root

The root application component is:

```text
src/App.tsx
```

`App.tsx` defines the application route tree and connects routes with the appropriate layouts and access controls.

The application separates:

- Public routes.
- Protected routes.
- Student routes.
- Employer routes.
- Administrative routes.
- Feature-specific routes.

Route-level access should follow the existing Ogera routing and protection pattern.

---

## 5. Routing

React Router is used for client-side navigation.

Routing is primarily composed in:

```text
src/App.tsx
```

The routing architecture uses protected and role-specific application areas.

Important access boundaries include:

```text
ProtectedRoute
FeatureGate
Role-specific layouts
```

Routing should be used for navigation and frontend access control, while the backend must independently enforce authorization for protected operations.

When adding a route:

1. Determine whether it is public or protected.
2. Determine the required role or feature access.
3. Use the appropriate layout.
4. Follow the existing route naming convention.
5. Confirm that navigation and direct URL access behave consistently.
6. Verify backend authorization for any protected data or operation.

---

## 6. Layouts

Role and application shells are maintained under:

```text
src/layouts/
```

Layouts provide common structures around related pages.

Examples include role-specific areas for:

- Students.
- Employers.
- Administrators.
- Super administrators.

Layouts may contain shared:

- Navigation.
- Sidebars.
- Headers.
- Dashboard containers.
- Role-specific navigation items.
- Common page structure.

Page-specific UI should remain in pages/components rather than being unnecessarily placed in global layouts.

---

## 7. Components

Reusable UI components are maintained under:

```text
src/components/
```

Components should be designed around clear responsibilities and reused when the same UI or behavior appears in multiple areas.

Common reusable component responsibilities include:

- Cards.
- Buttons.
- Forms.
- Modals.
- Tables.
- Tabs.
- Filters.
- Status indicators.
- Loading states.
- Empty states.
- Notifications/toasts.

Before creating a new shared component, developers should check whether an existing component can be reused or extended.

---

## 8. Feature Architecture

Feature-specific functionality is organized under:

```text
src/features/
```

Feature modules should keep closely related frontend functionality together where appropriate.

A feature may use:

```text
Feature
  |
  +-- Components
  +-- Hooks
  +-- API Services
  +-- Types
  +-- Validation
  |
  v
Pages / Application UI
```

Feature code should avoid unnecessary dependencies on unrelated application areas.

---

## 9. State Management

The Ogera frontend separates state into appropriate categories:

```text
Global Application State
        +
Server/API State
        +
Local Component State
```

### Redux

Redux Toolkit is used for shared application state.

The Redux store is maintained under:

```text
src/appStore/
```

Redux should be used for state that needs to be shared across application areas.

### RTK Query

RTK Query is used for server/API data where the existing API service pattern supports it.

It provides:

- Data fetching.
- Query state.
- Mutations.
- Caching.
- Cache invalidation.
- Request lifecycle state.

### Local State

React component state should be used for temporary UI state that does not need to be shared globally.

Examples include:

- Modal visibility.
- Local input state where Formik is not required.
- Temporary UI selections.
- Component-specific display state.

Developers should avoid putting temporary component state into Redux without a clear reason.

---

## 10. API Integration

Frontend API services are maintained under:

```text
src/services/api/
```

The current structure includes:

```text
src/services/api/
├── academicRecordsApi.tsx
├── academicVerificationApi...
├── adminApi.tsx
├── apiSlice.tsx
└── ...
```

The shared RTK Query API infrastructure is maintained by:

```text
src/services/api/apiSlice.tsx
```

API communication should be centralized in the existing service architecture.

The preferred flow is:

```text
Page / Component
       |
       v
Feature API Service / Hook
       |
       v
RTK Query / Axios
       |
       v
Ogera Backend API
```

Do not place repeated raw API request logic directly inside page components.

The backend is the authoritative source for API contracts and business rules.

---

## 11. Authentication Handling

Authentication is handled through the frontend API and application-state architecture.

The general flow is:

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
 +-- Credential validation
 +-- Authentication/session handling
 |
 v
Frontend Authentication State
 |
 v
Protected Routes
```

The frontend uses authenticated state to provide the appropriate user experience.

Authentication validation remains a backend responsibility.

The frontend must not treat a stored client-side authentication value as proof that an API operation is authorized.

---

## 12. Authorization Handling

Frontend authorization-related behavior includes:

- Protected routes.
- Role-specific layouts.
- Feature gates.
- Permission-aware navigation.
- Conditional actions.
- Role-specific UI.

The frontend should keep role checks consistent with the backend role and permission model.

However, frontend authorization controls are not a security boundary.

The backend must independently validate:

- Authentication.
- User role.
- Permissions.
- Resource ownership.
- Sensitive operations.

For example:

```text
Frontend:
Can this action be displayed?

Backend:
Is this action actually permitted?
```

Both checks should remain consistent.

---

## 13. Forms

Form implementation should follow the existing Ogera form conventions.

For complex forms, use:

```text
Formik
+
Yup
```

Formik should manage complex form state and submission behavior, while Yup should provide schema-based validation.

Forms should:

- Define clear initial values.
- Validate user input.
- Display field-level errors.
- Prevent invalid submissions.
- Show submission/loading states.
- Provide useful feedback after successful or failed submissions.
- Submit data through the appropriate API service.

Simple forms may use lighter React state where the existing implementation does not require Formik.

---

## 14. Validation

Frontend validation is organized under:

```text
src/validation/
```

Client-side validation improves user experience by identifying invalid input before submission.

Validation should cover appropriate constraints such as:

- Required fields.
- Field formats.
- Length restrictions.
- Numeric ranges.
- Date formats.
- Selection requirements.

Frontend validation does not replace backend validation.

The backend must validate all requests independently because API requests can be made without using the frontend.

---

## 15. Error Handling

Frontend API and application errors should be handled consistently.

Expected API failures may include:

```text
400  Invalid request
401  Authentication failure
403  Permission denied
404  Resource not found
409  Resource/business conflict
422  Validation/business-rule failure where applicable
429  Rate limit exceeded
500  Server error
502/503/504  Service availability failure
```

The frontend should:

1. Capture the error.
2. Determine whether authentication recovery is required.
3. Display an appropriate user-facing message.
4. Preserve useful backend error information.
5. Avoid exposing internal implementation details.
6. Keep the user in a recoverable application state where possible.

Internal errors, stack traces, tokens, credentials, and other sensitive information must not be displayed to users.

---

## 16. Loading States

All asynchronous operations should provide appropriate loading feedback.

The normal UI lifecycle is:

```text
Request
  |
  +-- Loading
  |
  +-- Success
  |
  +-- Empty
  |
  +-- Error
```

Loading states should be handled for:

- Initial page data.
- API queries.
- API mutations.
- Form submissions.
- File uploads.
- File downloads where progress feedback is appropriate.
- Authentication operations.

Use existing shared loaders, disabled states, skeletons, or progress indicators where available.

Avoid creating multiple competing loading-state implementations for the same operation.

---

## 17. Notifications and Toasts

The frontend uses shared notification/toast behavior for user feedback.

Toasts should be used for events such as:

- Successful mutations.
- Failed operations.
- Important status changes.
- User-action confirmation where appropriate.

User feedback should be concise and understandable.

Do not expose raw backend stack traces or sensitive API response details through toast messages.

---

## 18. Responsive Design

The Ogera frontend should support responsive layouts across:

- Mobile.
- Tablet.
- Desktop.

Responsive implementation should follow the existing Material UI, CSS, and component conventions.

Developers should verify:

- Navigation behavior.
- Grid/card layouts.
- Tables and lists.
- Forms.
- Modals.
- Buttons and controls.
- Text wrapping.
- Empty and error states.

Desktop-only assumptions should be avoided unless a feature explicitly requires them.

---

## 19. Accessibility Considerations

Frontend UI should follow accessible implementation practices.

Important considerations include:

- Use semantic HTML where appropriate.
- Provide accessible labels for form controls.
- Ensure buttons and interactive elements are keyboard accessible.
- Provide meaningful alternative text for relevant images.
- Maintain readable text and sufficient visual contrast.
- Do not rely on color alone to communicate important status.
- Provide visible focus states.
- Use appropriate ARIA attributes where native semantics are insufficient.
- Ensure modals and dialogs can be operated with keyboard input.
- Provide useful error messages for invalid form fields.

Accessibility should be considered when creating or modifying reusable components so improvements benefit all pages using them.

---

## 20. Localization

Localization resources are maintained under:

```text
src/locales/
```

Internationalization is initialized through:

```text
src/i18n.ts
```

The current project contains translation files supporting:

- English.
- Afrikaans.
- French.
- Kinyarwanda.
- Swahili.
- Zulu.

User-facing text should use translation keys through the established i18n system.

Avoid hard-coding user-facing strings inside reusable components or feature pages when the text is intended to be translated.

When adding new user-facing text:

1. Add the appropriate translation key.
2. Add the translated value to the supported locale resources as required.
3. Use the translation mechanism from the component/page.
4. Verify that the UI does not break when translated text is longer than the default language.

---

## 21. Theme and Styling

The shared visual system includes:

```text
src/theme.ts
src/index.css
```

The project uses Material UI and the existing theme/styling conventions.

Developers should:

- Reuse existing theme values.
- Follow established spacing and typography patterns.
- Reuse existing component styles.
- Avoid unnecessary inline styling.
- Avoid introducing a separate visual system for a single feature.

Global styles should remain in appropriate global styling locations, while component-specific styles should remain close to the component where practical.

---

## 22. Configuration and Environment Variables

Frontend configuration is organized under:

```text
src/config/
```

The frontend uses environment variables for environment-specific configuration.

Important variables include:

```text
VITE_API_URL
VITE_RECAPTCHA_SITE_KEY
```

### `VITE_API_URL`

Controls the backend API base URL used by the frontend.

### `VITE_RECAPTCHA_SITE_KEY`

Controls optional reCAPTCHA loading when the feature is enabled.

Frontend environment variables must be treated as client-visible values.

Do not place secrets such as:

- Database passwords.
- JWT signing secrets.
- Private API keys.
- Payment provider secrets.
- Cloud provider private credentials.

into frontend environment variables.

The `.env` file must not be committed when it contains environment-specific or sensitive values.

---

## 23. Build and Development Commands

The frontend uses Vite for development and production builds.

### Start development server

```bash
npm run dev
```

Starts the Vite development environment.

### Production build

```bash
npm run build
```

Runs the TypeScript project checks required by the build and creates the Vite production build.

### Lint

```bash
npm run lint
```

Runs ESLint against the project.

### Preview production build

```bash
npm run preview
```

Serves the generated production build locally for verification.

The exact command behavior is defined by the project's `package.json` scripts.

---

## 24. Docker and Deployment

The frontend repository contains:

```text
Dockerfile
.dockerignore
```

Container behavior should follow the current Docker configuration in the repository.

Before deployment, verify:

1. Environment variables are correctly configured.
2. The production build succeeds.
3. Linting succeeds where required by the release process.
4. The configured API URL points to the correct backend environment.
5. Required public configuration such as reCAPTCHA is correctly configured.
6. The generated frontend assets are served correctly.
7. Backend connectivity is available.

Deployment-specific infrastructure details should be maintained in the deployment documentation rather than duplicated here.

---

## 25. Development Conventions

Frontend developers should follow these conventions:

1. Analyze the existing implementation before creating or modifying files.
2. Reuse existing components, hooks, API services, types, and validation schemas.
3. Keep API communication in the service layer.
4. Use RTK Query for server data where the existing architecture supports it.
5. Use Redux for shared application state where appropriate.
6. Use local state for component-specific temporary state.
7. Use Formik/Yup for complex forms.
8. Use `ProtectedRoute` and `FeatureGate` according to the established access pattern.
9. Keep frontend role checks consistent with backend role names and permissions.
10. Use translation keys for user-facing text.
11. Follow the existing Material UI and theme conventions.
12. Provide loading, empty, success, and error states for asynchronous operations.
13. Avoid duplicating business logic that belongs to the backend.
14. Do not use frontend checks as the only security control.
15. Keep TypeScript types aligned with backend API contracts.

---

## 26. File Creation and Modification Guidelines

Before adding or changing a frontend file:

1. Identify which frontend responsibility the file belongs to.
2. Review the existing directory structure.
3. Search for similar implementations.
4. Reuse existing functionality when possible.
5. Follow the existing naming convention.
6. Keep the implementation within the appropriate directory.
7. Update related types, API services, validation, translations, and tests when required.
8. Verify that existing functionality has not been broken.

Examples:

```text
Route-level screen
    -> src/pages/

Reusable UI
    -> src/components/

Feature-specific implementation
    -> src/features/

API integration
    -> src/services/api/

Shared application state
    -> src/appStore/

Shared React context
    -> src/contexts/

Reusable hook
    -> src/hooks/

Validation
    -> src/validation/

Configuration
    -> src/config/

Shared constants
    -> src/constants/

Type definitions
    -> src/type/ or src/types/
```

---

## 27. Frontend Security Boundary

The frontend is an untrusted client.

The following mechanisms improve user experience but are not sufficient security controls by themselves:

```text
ProtectedRoute
FeatureGate
Role-based navigation
Hidden buttons
Disabled actions
Client-side validation
```

The backend must independently enforce all security-sensitive operations.

Frontend code must never contain or expose backend-only secrets.

Sensitive data should only be requested and displayed when the authenticated user is authorized to access it.

---

## 28. Testing Considerations

Frontend changes should be verified according to the project's testing setup.

At minimum, developers should verify affected:

- Routes.
- Components.
- Forms.
- API integrations.
- Authentication flows.
- Role-based behavior.
- Loading states.
- Error states.
- Responsive layouts.
- Localization behavior where applicable.

API behavior should be validated against the backend contract.

Changes to shared components, API services, layouts, or authentication behavior should receive broader regression testing because they can affect multiple features.

---

## 29. Source of Truth

The frontend implementation is defined by the current repository.

Primary frontend locations are:

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
├── index.css
├── main.tsx
└── theme.ts
```

API contracts should be verified against the backend API documentation.

When this documentation and the repository differ, developers should verify the current implementation before making architectural assumptions.

---

## 30. Summary

The Ogera frontend follows a structured React architecture:

```text
main.tsx
   |
   v
App.tsx
   |
   +-- Routing
   +-- ProtectedRoute / FeatureGate
   +-- Role-specific Layouts
   |
   v
Pages / Features
   |
   +-- Components
   +-- Hooks
   +-- Contexts
   +-- Validation
   |
   +-- Redux Store
   |
   +-- API Services
         |
         +-- RTK Query
         +-- Axios
         |
         v
   Ogera Backend API
```

The frontend is responsible for:

- User interface.
- Client-side navigation.
- Client-side state.
- API consumption.
- Form handling.
- Client-side validation.
- Responsive presentation.
- Localization.
- User-facing feedback.

The backend remains responsible for:

- Authentication.
- Authorization.
- Business logic.
- Request validation.
- Persistent data.
- Database operations.
- External service integrations.

All frontend development should follow the existing Ogera structure and conventions, with changes based on analysis of the current implementation rather than introducing unnecessary architectural patterns.
