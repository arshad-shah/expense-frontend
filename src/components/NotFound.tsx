import { useNavigate } from 'react-router-dom';
import { themeColors } from '@/styles/theme';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${themeColors.gradients.background} flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <p className="text-6xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
            404
          </p>
          <div className="mt-4 sm:mt-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">
              Page not found
            </h1>
            <p className="text-primary-600">
              Oops! It seems you've ventured into uncharted territory.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl ring-1 ring-primary-100 sm:rounded-xl sm:px-10">
          <div className="space-y-6">
            {/* Return Home Button */}
            <button
              onClick={() => navigate('/')}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${themeColors.gradients.primary} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02]`}
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </button>

            {/* Go Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-primary-200 rounded-lg shadow-sm text-sm font-medium text-primary-700 bg-transparent hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          {/* Decorative Element */}
          <div className="mt-8 pt-8 border-t border-primary-200">
            <div className="flex justify-center space-x-6">
              <div className="w-2 h-2 rounded-full bg-primary-200 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Circles - Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-100 mix-blend-multiply opacity-20 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary-200 mix-blend-multiply opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default NotFound;