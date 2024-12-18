import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-8">
          {/* Animated 404 */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-[12rem] font-bold leading-none bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent select-none">
              404
            </div>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-20 blur-2xl"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Message and Buttons */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Page Not Found
              </h1>
              <p className="text-gray-600">
                Oops! The page you're looking for seems to have gone missing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;