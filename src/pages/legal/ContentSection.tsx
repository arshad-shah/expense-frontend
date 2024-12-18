import React from "react";
import { motion, Variants } from "framer-motion";

interface Section {
  title: string;
  content: string | string[];
}

interface ContentData {
  sections: Section[];
}

interface ContentSectionProps {
  content: ContentData;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const ContentSection: React.FC<ContentSectionProps> = ({
  content,
  className = "",
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`mt-4 mx-auto space-y-12 ${className}`}
    >
      {content.sections.map((section, index) => (
        <motion.section
          key={index}
          variants={itemVariants}
          className="first:mt-0 relative"
        >
          {/* Decorative line */}
          <div
            className="absolute -left-4 top-0 h-full w-0.5 bg-gradient-to-b from-indigo-500 to-indigo-100 opacity-20 rounded-full"
            aria-hidden="true"
          />

          {/* Section title */}
          <motion.h2
            className="text-2xl font-bold text-gray-900 mb-4 group flex items-center"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="absolute -left-2.5 w-1.5 h-6 bg-indigo-500 rounded-full 
                transform -translate-y-1/4 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
            {section.title}
          </motion.h2>

          {/* Section content */}
          {Array.isArray(section.content) ? (
            <ul className="space-y-3 text-gray-600" role="list">
              {section.content.map((item, itemIndex) => (
                <motion.li
                  key={itemIndex}
                  className="flex items-center"
                  variants={itemVariants}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className="mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 opacity-60"
                    aria-hidden="true"
                  />
                  <span className="text-md leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <motion.p
              className="text-lg leading-relaxed text-gray-600"
              variants={itemVariants}
            >
              {section.content}
            </motion.p>
          )}
        </motion.section>
      ))}
    </motion.div>
  );
};

export default ContentSection;
