import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Lock, ArrowLeft, Layout } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { PASSWORD_REQUIREMENTS } from '@/constants';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [oobCode] = useState(
    searchParams.get('oobCode') || 
    searchParams.get('code') || 
    ''
  );
  const navigate = useNavigate();

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Invalid password reset link');
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
      } catch (err: any) {
        console.error('Error verifying reset code:', err);
        // More specific error handling
        if (err.code === 'auth/invalid-action-code') {
          setError('This password reset link has expired or already been used');
        } else if (err.code === 'auth/invalid-oob-code') {
          setError('Invalid password reset link');
        } else {
          setError('Unable to verify reset link. Please try again');
        }
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

    return '';
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
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      // Show success message for 3 seconds before redirecting
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password successfully reset. Please log in with your new password.' 
          }
        });
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      // More specific error handling
      if (err.code === 'auth/expired-action-code') {
        setError('This password reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This password reset link is no longer valid. Please request a new one.');
      } else if (err.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  if (!oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>
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
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <Layout className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ExpenseTracker
                </span>
              </motion.div>
            </div>

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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl border p-4 ${
                  success
                    ? 'border-green-200 bg-green-50 text-green-600'
                    : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                <p className="text-sm">
                  {success
                    ? 'Password reset successful! Redirecting to login...'
                    : error}
                </p>
              </motion.div>
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              disabled={loading || success}
            />

            <Input
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
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
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
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