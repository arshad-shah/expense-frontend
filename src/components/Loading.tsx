import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0">
          <svg className="animate-spin" viewBox="0 0 100 100">
            <circle 
              className="stroke-primary-300" 
              strokeWidth="4"
              strokeDasharray="200"
              strokeDashoffset="50"
              strokeLinecap="round"
              fill="none"
              cx="50" 
              cy="50" 
              r="40"
            />
            <circle 
              className="stroke-secondary-400" 
              strokeWidth="4"
              strokeDasharray="150"
              strokeDashoffset="75"
              strokeLinecap="round"
              fill="none"
              cx="50" 
              cy="50" 
              r="30"
            />
          </svg>
        </div>
      </div>
      <div className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500 font-medium text-lg animate-pulse">
        Loading...
      </div>
      <div className="mt-2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;