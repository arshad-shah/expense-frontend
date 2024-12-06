import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearError, register } from '@/store/slices/authslice';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector(state => state.auth);

  const passwordCriteria = {
    length: { label: "At least 8 characters", regex: /.{8,}/ },
    uppercase: { label: "At least one uppercase letter", regex: /[A-Z]/ },
    lowercase: { label: "At least one lowercase letter", regex: /[a-z]/ },
    number: { label: "At least one number", regex: /\d/ },
    special: { label: "At least one special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
  };

  const validatePassword = (password) => {
    return Object.keys(passwordCriteria).reduce((acc, key) => {
      acc[key] = passwordCriteria[key].regex.test(password);
      return acc;
    }, {});
  };

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    currency: 'USD'
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const isFormValid = () => {
    return formData.email && formData.password && formData.firstName && 
           formData.lastName && Object.values(passwordValidation).every(valid => valid);
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!Object.values(passwordValidation).every((valid) => valid)) {
      errors.password = "Password does not meet all the required criteria.";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(register(formData));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

  return (
    <div className={`min-h-screen ${themeColors.gradients.background} flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-primary-900 mb-2">
          Create your account
        </h2>
        <p className="text-center text-sm text-primary-600">Start managing your expenses today</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-2xl ring-1 ring-primary-100 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg shadow-sm transition-colors duration-200 ${
                    validationErrors.firstName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-primary-200 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-primary-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg shadow-sm transition-colors duration-200 ${
                    validationErrors.lastName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-primary-200 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg shadow-sm transition-colors duration-200 ${
                  validationErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-primary-200 focus:border-primary-500 focus:ring-primary-500'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg shadow-sm transition-colors duration-200 ${
                  validationErrors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                }`}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}

              <div className="mt-2">
                <p className="text-sm font-medium text-primary-700">Password must include:</p>
                <ul className="mt-1 space-y-1">
                  {Object.keys(passwordCriteria).map((key) => (
                    <li key={key} className="flex items-center space-x-2">
                      <span
                        className={`h-4 w-4 flex items-center justify-center rounded-full ${
                          passwordValidation[key]
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        {passwordValidation[key] ? "✔" : "✗"}
                      </span>
                      <span className="text-sm text-gray-700">{passwordCriteria[key].label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-primary-700">
                Preferred Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-primary-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${themeColors.gradients.primary} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-primary-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-800 hover:text-primary-900 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;