import PrivateRoute from "@/components/PrivateRoute";
import Accounts from "@/pages/Accounts";
import Budgets from "@/pages/Budgets";
import {
  AuthenticatedLayout,
  AuthVerificationHandler,
  UnauthenticatedLayout,
} from "@/pages/common/Layouts";
import Dashboard from "@/pages/Dashboard";
import ForgotPassword from "@/pages/forgotPassword/ForgotPassword";
import { PrivacyPolicy, TermsOfService } from "@/pages/legal";
import Login from "@/pages/login";
import ProfileComponent from "@/pages/Profile";
// import VerifyEmail from '@/pages/Profile/VerifyEmail';
import Register from "@/pages/register";
import ResetPassword from "@/pages/resetPassword/ResetPassword";
import Transactions from "@/pages/Transactions";
import { createBrowserRouter, Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorFallback";
import NotFound from "./404";
import VerifyEmail from "../Profile/VerifyEmail";

export const router = createBrowserRouter([
  // Protected Routes (with Navigation)
  {
    element: (
      <ErrorBoundary>
        <PrivateRoute>
          <AuthenticatedLayout>
            <Outlet />
          </AuthenticatedLayout>
        </PrivateRoute>
      </ErrorBoundary>
    ),
    children: [
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/accounts",
        element: <Accounts />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
      {
        path: "/budgets",
        element: <Budgets />,
      },
      {
        path: "/profile",
        element: <ProfileComponent />,
      },
    ],
  },

  // Public Routes (without Navigation)
  {
    element: (
      <ErrorBoundary>
        <UnauthenticatedLayout>
          <Outlet />
        </UnauthenticatedLayout>
      </ErrorBoundary>
    ),
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/terms",
        element: <TermsOfService />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />,
      },
      { path: "/auth-verfication", element: <AuthVerificationHandler /> },
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },
    ],
  },
]);
