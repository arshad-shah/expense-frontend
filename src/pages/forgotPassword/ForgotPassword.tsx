import React, { useState } from 'react';
import {  Link } from 'react-router-dom';
import { Mail, ArrowLeft, Layout, Send } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError('Failed to reset password. Please check your email address.');
      console.error(err);
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
              Reset Password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-green-200 bg-green-50 p-4"
            >
              <p className="text-sm text-green-600">{successMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200"
              >
                <Send className="mr-2 h-5 w-5" />
                {loading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPassword;