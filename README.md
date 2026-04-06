# 🎓 Ogera Frontend

<div align="center">

A modern, full-featured frontend application for the Ogera platform - connecting students with employers through a comprehensive job management and academic verification system.

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC.svg)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [User Roles](#-user-roles)
- [Features by Module](#-features-by-module)
- [Authentication Flow](#-authentication-flow)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Ogera** is a comprehensive platform that bridges the gap between students and employers. This frontend application provides an intuitive interface for managing users, jobs, academic verifications, disputes, and analytics across three distinct user roles: Students, Employers, and Administrators.

Built with modern web technologies including React 19, TypeScript, and Tailwind CSS, the application offers a fast, responsive, and type-safe user experience.

---

## ✨ Key Features

### 🔐 **Authentication & Authorization**

- Secure login and registration system
- JWT-based authentication with automatic token refresh
- Password reset and OTP verification
- Role-based access control (RBAC)
- Protected routes with middleware

### 👥 **User Management**

- Multi-role support (Admin, Employer, Student)
- User approval workflow
- Account suspension management
- Comprehensive user profiles
- Real-time user status tracking

### 💼 **Job Management**

- Job posting and approval system
- Active/completed job tracking
- Job categories management
- Application workflow
- Job status monitoring

### 🎓 **Academic Verification**

- Document verification system
- Approval/rejection workflow
- Performance tracking
- Account lock management
- Review history

### ⚖️ **Dispute Resolution**

- Open dispute tracking
- In-progress dispute management
- Resolved dispute history
- Dispute escalation system

### 📊 **Analytics & Reporting**

- Platform analytics dashboard
- Transaction history
- User activity metrics
- Performance insights

### 💳 **Transaction Management**

- Payment tracking
- Transaction history
- Financial reporting
- Refund management

---

## 🛠️ Tech Stack

### **Core**

- **[React 19](https://reactjs.org/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling

### **State Management**

- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management
- **[RTK Query](https://redux-toolkit.js.org/rtk-query/overview)** - Data fetching and caching

### **Routing**

- **[React Router v7](https://reactrouter.com/)** - Client-side routing

### **Styling**

- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Material-UI (MUI)](https://mui.com/)** - React component library
- **[Emotion](https://emotion.sh/)** - CSS-in-JS library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### **Form Handling**

- **[Formik](https://formik.org/)** - Form management
- **[Yup](https://github.com/jquense/yup)** - Schema validation

### **API Communication**

- **[Axios](https://axios-http.com/)** - HTTP client with interceptors

### **UI Components**

- **[Heroicons](https://heroicons.com/)** - Icon library
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### **Utilities**

- **[jwt-decode](https://github.com/auth0/jwt-decode)** - JWT token decoding

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - Version 22.x or higher
  ```bash
  node --version  # Should output v22.x.x
  ```
- **npm** - Comes with Node.js (or use yarn/pnpm)
- **Git** - For version control

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd ogera-frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Copy the provided template to create your local environment configuration:

```bash
# Copy the example file to create your local .env.local
cp .env.local.example .env.local

# Or use this if .env.local doesn't exist
cp .env.local.example .env
```

Then update the variables as needed (see [Environment Variables](#-environment-variables)).

> **Note:** The `.env.local` file is git-ignored and will not be committed. Never commit sensitive information like API keys or tokens.

### 4️⃣ Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite)

---

## 🔑 Environment Variables

A template file (`.env.local.example`) is provided in the repository. To set up your environment:

1. **Copy the template:** `cp .env.local.example .env.local`
2. **Edit the values:** Update `.env.local` with your specific configuration
3. **Never commit:** The `.env.local` file is git-ignored for security

### Configuration Variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Optional: Other configuration variables
# VITE_APP_NAME=Ogera
# VITE_APP_VERSION=1.0.0
```

### Variable Reference:

| Variable       | Description          | Required | Default                      |
| -------------- | -------------------- | -------- | ----------------------------- |
| `VITE_API_URL` | Backend API base URL | ✅ Yes   | `http://localhost:5000/api`  |

**Environment File Precedence:**
- Vite loads environment variables from `.env.local` (highest priority)
- Falls back to `.env` if `.env.local` doesn't exist
- Local files (`.env.local`) are git-ignored to protect sensitive data

> **Note:** All Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## 📁 Project Structure

```
ogera-frontend/
├── public/                 # Static assets
│   └── vite.svg
├── src/
│   ├── appStore/          # Redux store configuration
│   │   ├── rootReducer.tsx
│   │   └── store.tsx
│   ├── assets/            # Images, logos, icons
│   ├── components/        # Reusable components
│   │   ├── button.tsx
│   │   ├── Header/
│   │   ├── Loader/
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar/
│   │   └── Table/
│   ├── features/          # Redux slices
│   │   └── auth/
│   │       └── authSlice.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useRefreshOnLoad.ts
│   ├── layouts/           # Layout components
│   │   ├── adminLayout.tsx
│   │   ├── EmployerLayout.tsx
│   │   └── StudentLayout.tsx
│   ├── pages/             # Page components
│   │   ├── AcademicVerification/
│   │   ├── Disputes/
│   │   ├── Jobs/
│   │   ├── Users/
│   │   ├── Analytics.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── Register.tsx
│   │   └── Transactions.tsx
│   ├── services/          # API services
│   │   └── api/
│   │       ├── apiSlice.tsx
│   │       ├── authApi.tsx
│   │       ├── axiosInstance.ts
│   │       └── profileApi.tsx
│   ├── type/              # TypeScript type definitions
│   ├── utils/             # Utility functions
│   │   └── routes.tsx
│   ├── validation/        # Validation schemas
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # Vite type definitions
├── .gitignore
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # TypeScript app configuration
├── tsconfig.node.json     # TypeScript node configuration
└── vite.config.ts         # Vite configuration
```

---

## 📜 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production (TypeScript + Vite) |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint to check code quality         |

### Development Workflow:

```bash
# Start development
npm run dev

# In another terminal, run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 👤 User Roles

The application supports three distinct user roles, each with specific permissions:

### 1. **Admin / SuperAdmin** 🔑

- Full system access
- User management (approve, suspend, view all users)
- Academic verification management
- Job approval and management
- Dispute resolution
- Analytics and reporting
- Platform configuration

### 2. **Employer** 💼

- Post job opportunities
- Manage job listings
- View student profiles
- Track applications
- Manage disputes
- View analytics for own listings

### 3. **Student** 🎓

- Complete profile with academic information
- Browse and apply for jobs
- Submit documents for verification
- Track application status
- Raise disputes
- View transaction history

---

## 🎯 Features by Module

### 🔐 **Authentication Module**

| Feature         | Route                   | Description           |
| --------------- | ----------------------- | --------------------- |
| Login           | `/auth/login`           | User authentication   |
| Register        | `/auth/register`        | New user registration |
| Forgot Password | `/auth/forgot-password` | Password recovery     |
| Reset Password  | `/auth/reset-password`  | Set new password      |
| Verify OTP      | `/auth/verify-otp`      | OTP verification      |
| Change Password | `/auth/change-password` | Update password       |

### 👥 **User Management Module** (Admin Only)

| Feature          | Route                        | Access            |
| ---------------- | ---------------------------- | ----------------- |
| All Users        | `/dashboard/users/all`       | Admin, SuperAdmin |
| Students         | `/dashboard/users/students`  | Admin, SuperAdmin |
| Employers        | `/dashboard/users/employers` | Admin, SuperAdmin |
| Pending Approval | `/dashboard/users/pending`   | Admin, SuperAdmin |
| Suspended Users  | `/dashboard/users/suspended` | Admin, SuperAdmin |

### 🎓 **Academic Verification Module**

| Feature           | Route                             | Description                   |
| ----------------- | --------------------------------- | ----------------------------- |
| Pending Reviews   | `/dashboard/academic/pending`     | Documents awaiting review     |
| Approved          | `/dashboard/academic/approved`    | Verified documents            |
| Rejected          | `/dashboard/academic/rejected`    | Rejected documents            |
| Performance Track | `/dashboard/academic/performance` | Academic performance tracking |
| Account Locks     | `/dashboard/academic/locks`       | Locked accounts management    |

### 💼 **Jobs Module**

| Feature          | Route                        | Description             |
| ---------------- | ---------------------------- | ----------------------- |
| All Jobs         | `/dashboard/jobs/all`        | Complete job listings   |
| Active Jobs      | `/dashboard/jobs/active`     | Currently active jobs   |
| Completed Jobs   | `/dashboard/jobs/completed`  | Finished jobs           |
| Pending Approval | `/dashboard/jobs/pending`    | Jobs awaiting approval  |
| Job Categories   | `/dashboard/jobs/categories` | Job category management |

### ⚖️ **Disputes Module**

| Feature       | Route                             | Description               |
| ------------- | --------------------------------- | ------------------------- |
| All Disputes  | `/dashboard/disputes`             | Dispute overview          |
| Open Disputes | `/dashboard/disputes/open`        | Unresolved disputes       |
| In Progress   | `/dashboard/disputes/in-progress` | Active dispute resolution |
| Resolved      | `/dashboard/disputes/resolved`    | Closed disputes           |

### 📊 **Other Modules**

| Feature      | Route                     | Description                    |
| ------------ | ------------------------- | ------------------------------ |
| Dashboard    | `/dashboard`              | Main dashboard (role-specific) |
| Profile      | `/dashboard/profile`      | User profile management        |
| Analytics    | `/dashboard/analytics`    | Platform analytics             |
| Transactions | `/dashboard/transactions` | Transaction history            |

---

## 🔒 Authentication Flow

### JWT Token Management

The application uses a sophisticated JWT authentication system with automatic token refresh:

```typescript
// Axios interceptor automatically:
1. Attaches access token to requests
2. Detects 401 (unauthorized) responses
3. Attempts to refresh the token
4. Retries the original request
5. Logs out user if refresh fails
```

### Token Storage

- **Access Token**: Stored in Redux state (in-memory)
- **Refresh Token**: Stored as HTTP-only cookie (backend)

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
// Example: Admin-only route
<ProtectedRoute allowedRoles={["admin", "superadmin"]} />
```

---

## 🏗️ Architecture Highlights

### State Management

- **Redux Toolkit** for global state
- **RTK Query** for API caching and data fetching
- Automatic request deduplication
- Optimistic updates for better UX

### Form Handling

- **Formik** for form state management
- **Yup** schemas for validation
- Reusable validation schemas in `/src/validation`

### API Layer

- Centralized Axios instance with interceptors
- Automatic token refresh on 401
- Request/response transformation
- Error handling middleware

### Type Safety

- Full TypeScript coverage
- Type definitions in `/src/type`
- IntelliSense support throughout

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### 1. Fork the Repository

```bash
git clone <your-fork-url>
cd ogera-frontend
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Follow the existing code style
- Add TypeScript types for new code
- Update documentation as needed

### 4. Run Linting

```bash
npm run lint
```

### 5. Commit Your Changes

```bash
git commit -m "feat: add your feature description"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**

```bash
# Kill the process using the port
npx kill-port 5173
# Or specify a different port
npm run dev -- --port 3000
```

**2. Module Not Found Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. TypeScript Errors**

```bash
# Restart TypeScript server in VSCode
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

**4. CORS Issues**

- Ensure `VITE_API_URL` is correctly set in `.env`
- Check backend CORS configuration
- Verify `withCredentials: true` in Axios config

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Material-UI Components](https://mui.com/components/)

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

## 👨‍💻 Development Team

For questions, issues, or contributions, please contact the development team.

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

</div>
