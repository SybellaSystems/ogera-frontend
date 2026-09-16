# Maintenance

Frontend maintenance should ensure the application remains stable, performant, secure, and compatible with the current backend and deployment environment.

The following areas must be reviewed regularly:

- **Build and linting:** Review TypeScript, ESLint, Vite build, and compilation failures before deployment.
- **Browser console errors:** Monitor JavaScript runtime errors, React warnings, failed component rendering, and unexpected state updates.
- **API failures:** Check failed API requests, HTTP status codes, request payloads, response formats, authentication headers, and frontend handling of backend errors.
- **Authentication:** For login or authentication loops, verify token/refresh-token handling, token expiry, persisted authentication state, role state, and `/auth` API responses.
- **API configuration:** Verify `VITE_API_URL` is correctly configured for the selected environment and points to the intended backend.
- **CORS and connectivity:** When API requests fail, verify CORS configuration, backend availability, environment variables, and network requests from the browser.
- **State management:** For missing or stale data, inspect RTK Query endpoints, cache behavior, invalidation/tags, query parameters, pagination, and API response shapes.
- **Routing and deep links:** Verify protected routes, public routes, role-based navigation, browser refresh behavior, and direct access to nested URLs.
- **Blank or stale pages:** Inspect deployed asset versions, browser network requests, SPA fallback configuration, cached JavaScript bundles, `VITE_API_URL`, CORS, and backend availability.
- **Performance:** Monitor bundle size, unnecessary dependencies, large assets, code-splitting, lazy-loaded components, and unnecessary API requests.
- **Dependencies:** Review outdated packages, dependency vulnerabilities, peer-dependency conflicts, and compatibility with the project's Node.js and frontend framework versions.
- **Translations:** Verify that all supported languages contain the required translation keys and that missing keys do not result in broken or untranslated UI text.
- **UI and component behavior:** Check responsive layouts, reusable components, forms, validation messages, loading states, empty states, error states, and browser compatibility.
- **Deployment configuration:** Keep Vercel, Docker, nginx, SPA fallback, environment variables, and other frontend deployment configuration aligned with the selected deployment target.
- **Cache management:** Investigate stale frontend behavior caused by browser cache, CDN cache, service workers, or outdated deployed assets. Confirm that users receive the latest production build after releases.

## Troubleshooting Guidelines

### Blank or Stale Page

When a deployed frontend displays a blank or outdated page:

1. Verify the deployed build completed successfully.
2. Confirm the latest frontend commit/version is deployed.
3. Inspect browser Console for JavaScript or React errors.
4. Inspect the Network tab for failed JavaScript/CSS assets.
5. Verify SPA fallback/routing configuration.
6. Verify `VITE_API_URL` points to the correct backend environment.
7. Check CORS configuration and backend availability.
8. Clear browser/CDN/service-worker cache when appropriate.
9. Confirm that the deployed asset version matches the latest release.

### Authentication Loop

When users are repeatedly redirected to the login page:

1. Inspect login and `/auth` API responses.
2. Verify token or refresh-token handling.
3. Check token expiry and refresh behavior.
4. Verify persisted authentication state.
5. Confirm the authenticated user's role is available and valid.
6. Verify protected-route and role-based route logic.
7. Check cookie configuration when cookies are used, including `Secure`, `SameSite`, domain, and expiry settings.
8. Inspect failed authentication requests in the browser Network tab.

### Missing or Stale Data

When frontend data is missing or does not update:

1. Verify the API endpoint and request parameters.
2. Inspect the backend response status and response shape.
3. Verify RTK Query endpoint configuration.
4. Check query parameters and pagination values.
5. Verify cache invalidation and RTK Query tags.
6. Confirm the authenticated user's permissions and backend authorization.
7. Check whether stale cached data is being displayed.
8. Compare the frontend model/interface with the current backend response structure.

## Operational Ownership

The following operational responsibilities are pending assignment:

- Frontend ownership and maintenance responsibility
- Monitoring and error-tracking dashboards
- Release approval process
- Incident response contacts
- Production support ownership
- Disaster recovery and frontend rollback procedures