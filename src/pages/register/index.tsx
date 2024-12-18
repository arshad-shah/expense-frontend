import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { Currency } from "@/types";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { cn } from "@/lib/utils";
import { CURRENCY, PASSWORD_REQUIREMENTS, VALIDATION_RULES } from "@/constants";
import { FirebaseErrorHandler } from "@/lib/firebase-error-handler";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    currency: "USD" as Currency,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, currency: value as Currency }));
  };

  const validateForm = () => {
    for (const rule of Object.values(VALIDATION_RULES)) {
      if (!rule.test(formData)) {
        setError(rule.message);
        return false;
      }
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError("");
      setLoading(true);
      await register(
        {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          preferences: {
            currency: formData.currency,
            dateFormat: "MM/DD/YYYY",
            budgetStartDay: 1,
            weekStartDay: "monday",
          },
        },
        formData.password,
      );
      navigate("/");
    } catch (err: unknown) {
      setError(FirebaseErrorHandler.auth(err, "register").message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(FirebaseErrorHandler.auth(err, "register").message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="space-y-6 rounded-2xl backdrop-blur-sm p-6 sm:p-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="flex justify-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500 transition-colors ml-1"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Sign in
              </Link>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-4"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-600">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                icon={<User className="h-5 w-5 text-gray-400" />}
              />

              <Input
                label="Last Name"
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                icon={<User className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Currency
              </label>
              <Select
                value={formData.currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <SelectValue placeholder="Select your currency" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              <AnimatePresence>
                {passwordFocus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm p-4"
                  >
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Password requirements:
                    </p>
                    <ul className="space-y-1">
                      {PASSWORD_REQUIREMENTS.map((req, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: req.validator(formData.password)
                                ? [1.2, 1]
                                : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {req.validator(formData.password) ? (
                              <svg
                                className="mr-2 h-4 w-4 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="mr-2 h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </motion.div>
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              req.validator(formData.password)
                                ? "text-green-700"
                                : "text-gray-600",
                            )}
                          >
                            {req.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                Create Account
              </Button>
            </motion.div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 rounded-xl">
                Or continue with
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleGoogleRegister}
              disabled={loading}
              variant="outline"
              size="lg"
              fullWidth
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </motion.div>

          <p className="text-center text-xs text-gray-600">
            By creating an account, you agree to our{" "}
            <Link
              to="/terms"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
