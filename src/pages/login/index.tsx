import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle,
  Layout,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Checkbox } from '@/components/Checkbox';
import { AnimatePresence, motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  
    const handleEmailLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setError('');
        setLoading(true);
        await login(email, password, rememberMe);
        navigate('/');
      } catch (err) {
        setError('Failed to log in. Please check your credentials.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleLogin = async () => {
      try {
        setError('');
        setLoading(true);
        await loginWithGoogle(rememberMe);
        navigate('/');
      } catch (err) {
        setError('Failed to log in with Google.');
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
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to manage your expenses or{' '}
              <Link 
                to="/register" 
                className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                create an account
                <ArrowRight className="ml-1 h-4 w-4" />
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

          <form className="space-y-5" onSubmit={handleEmailLogin}>
            <div className="space-y-4">
              <Input
                label="Email address"
                id="email-address"
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

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="text-indigo-600 border-gray-300 rounded-md focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

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
                <LogIn className="mr-2 h-5 w-5" />
                {loading ? 'Signing in...' : 'Sign in with Email'}
              </Button>
            </motion.div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full h-11 border-2 border-gray-200 hover:border-gray-300 rounded-xl shadow-lg shadow-gray-100 hover:shadow-gray-200 transition-all duration-200"
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
        </div>
      </motion.div>
    </div>
  );
};

export default Login;