import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Currency } from '@/types';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Select';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    currency: 'USD' as Currency,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, currency: value as Currency }));
  };

  // Add these helper functions at the top of your file
const passwordRequirements = [
  { 
    label: "At least one uppercase letter", 
    validator: (password: string) => /[A-Z]/.test(password)
  },
  { 
    label: "At least one lowercase letter", 
    validator: (password: string) => /[a-z]/.test(password)
  },
  { 
    label: "At least one number", 
    validator: (password: string) => /[0-9]/.test(password)
  },
  { 
    label: "At least one special character", 
    validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  },
  { 
    label: "Minimum 8 characters", 
    validator: (password: string) => password.length >= 8
  }
];

// Add this to your component's state
const [passwordFocus, setPasswordFocus] = useState(false);

// Add this function to your component
const validatePassword = (password: string) => {
  return passwordRequirements.every(req => req.validator(password));
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string) => {
  return name.trim().length > 0;
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateEmail(formData.email)) {
    return setError("Invalid email format");
  }

  if (!validateName(formData.firstName) || !validateName(formData.lastName)) {
    return setError("First and last names are required");
  }

  if (!validatePassword(formData.password)) {
    return setError("Password does not meet all requirements");
  }

  if (formData.password !== formData.confirmPassword) {
    return setError("Passwords do not match");
  }

  const userInput = {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    currency: formData.currency,
  };

  try {
    setError("");
    setLoading(true);
    await register(userInput, formData.password);
    navigate("/");
  } catch (err) {
    setError((err as Error).message || "Failed to create an account.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const handleGoogleRegister = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Failed to register with Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-xl">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 rounded-r border-l-4 border-red-400 bg-red-50 p-4" role="alert">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                className="pl-10"
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
                className="pl-10"
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
              className="pl-10"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Currency
              </label>
              <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <SelectValue placeholder="Select your currency" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
                className="pl-10"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
              
              {passwordFocus && (
                <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Password requirements:
                  </p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm"
                      >
                        {req.validator(formData.password) ? (
                          <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`${
                          req.validator(formData.password)
                            ? 'text-green-700'
                            : 'text-gray-600'
                        }`}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="pl-10"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              {loading ? 'Creating Account...' : 'Create Account'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleRegister}
            disabled={loading}
            variant="outline"
            size="lg"
            className="w-full"
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

          <p className="text-center text-xs text-gray-600">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;