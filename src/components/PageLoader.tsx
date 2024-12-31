import React from "react";
import { motion } from "framer-motion";

interface PageLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  text = "Loading...",
  size = "md",
  bgColor = "bg-white",
}) => {
  const containerSize = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  return (
    <div
      className={`flex w-full h-screen inset-0 ${bgColor} flex flex-col items-center justify-center`}
    >
      <div
        className={`relative ${containerSize[size]} flex items-center justify-center`}
      >
        {/* Inner gradient circle */}
        <motion.div
          className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-full"
          animate={{
            scale: [0.8, 1.5, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className=" text-gray-600 font-medium text-sm tracking-wide"
      >
        {text}
      </motion.p>
    </div>
  );
};

export default PageLoader;
