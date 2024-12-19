import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";

// Layout for authenticated pages (with navigation)
export const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
};

// Layout for non-authenticated pages (without navigation)
export const UnauthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
};

export const AuthVerificationHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const continueUrl = searchParams.get("continueUrl");

  if (mode === "resetPassword" && oobCode) {
    // Redirect to reset password page with the oobCode
    return <Navigate to={`/reset-password?oobCode=${oobCode}`} replace />;
  }
  if (mode === "verifyEmail" && oobCode) {
    //extract new email from the query string of continueUrl
    const newEmail = continueUrl
      ? new URL(continueUrl).searchParams.get("newEmail")
      : null;

    // Redirect to verify email page with the oobCode
    return (
      <Navigate
        to={`/verify-email?mode=verifyEmail&oobCode=${oobCode}&newEmail=${newEmail}`}
        replace
      />
    );
  }

  // If no valid parameters, redirect to login
  return <Navigate to="/login" replace />;
};
