import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { motion, AnimatePresence } from "framer-motion";
import { PASSWORD_REQUIREMENTS } from "@/constants";
import Alert from "@/components/Alert";
import { FirebaseErrorHandler } from "@/lib/firebase-error-handler";
import PasswordRequirements from "@/components/PasswordRequirements";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [oobCode] = useState(
    searchParams.get("oobCode") || searchParams.get("code") || "",
  );
  const navigate = useNavigate();

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("Invalid password reset link");
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
      } catch (err: any) {
        console.error("Error verifying reset code:", err);
        setError(FirebaseErrorHandler.auth(err, "Reset Password").message);
      }
    };

    verifyCode();
  }, [oobCode]);

  const validatePassword = (password: string) => {
    for (const requirement of PASSWORD_REQUIREMENTS) {
      if (!requirement.validator(password)) {
        return requirement.label;
      }
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      // Show success message for 3 seconds before redirecting
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password successfully reset. Please log in with your new password.",
          },
        });
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(FirebaseErrorHandler.auth(err, "Reset Password").message);
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
        <Alert
          variant="error"
          title="Invalid Reset Link"
          actions={[
            {
              label: "Back to Login",
              onClick: () => navigate("/login"),
            },
          ]}
        >
          <p>This password reset link is invalid or has expired.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="space-y-6 rounded-2xl bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-indigo-200/20">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Reset Your Password
            </h2>
            {email && (
              <p className="text-sm text-gray-600">
                Create a new password for {email}
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {(error || success) && (
              <Alert variant={success ? "success" : "error"}>
                {success
                  ? "Password reset successful! Redirecting to login..."
                  : error}
              </Alert>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onFocus={() => setPasswordFocus(true)}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              disabled={loading || success}
            />
            <PasswordRequirements
              password={password}
              isVisible={passwordFocus}
            />

            <Input
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              // if the password and confirm password do not match, the input field will be outlined in red
              //when the password and confirm password match, the input field will be outlined in green
              className={
                confirmPassword && confirmPassword !== password
                  ? "border-red-500"
                  : confirmPassword && confirmPassword === password
                    ? "border-green-500"
                    : ""
              }
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              disabled={loading || success}
            />

            <motion.div
              whileHover={{ scale: loading || success ? 1 : 1.01 }}
              whileTap={{ scale: loading || success ? 1 : 0.99 }}
            >
              <Button
                type="submit"
                disabled={loading || success}
                variant="primary"
                size="lg"
                isLoading={loading}
                fullWidth
              >
                Reset Password
              </Button>
            </motion.div>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
