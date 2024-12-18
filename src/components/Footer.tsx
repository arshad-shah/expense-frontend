import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { FaLinkedin, FaGithub, FaEnvelope, FaHackerrank } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/arshadshah",
      icon: FaLinkedin,
    },
    {
      platform: "GitHub",
      url: "https://github.com/arshad-shah",
      icon: FaGithub,
    },
    {
      platform: "Email",
      url: "mailto:arshad@arshadshah.com",
      icon: FaEnvelope,
    },
    {
      platform: "Hackerrank",
      url: "https://www.hackerrank.com/shaharshad57",
      icon: FaHackerrank,
    },
  ];

  return (
    <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      {/* Top Wave Decoration */}
      <div className="absolute left-0 top-0 w-full overflow-hidden">
        <svg
          className="relative block h-6 w-full text-gray-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-current"
            opacity=".25"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            className="fill-current"
            opacity=".5"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-current"
          />
        </svg>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center space-y-6">
          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-full p-2 transition-all duration-300 hover:bg-gray-700"
                aria-label={link.platform}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <link.icon className="h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-white" />
              </motion.a>
            ))}
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-400 to-transparent" />

          {/* Copyright and Credits */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <motion.div
              className="flex items-center text-sm text-gray-400"
              whileHover={{ scale: 1.05 }}
            >
              <span>Made with</span>
              <Heart className="mx-1 h-4 w-4 text-red-500" />
              <span>by Arshad Shah</span>
            </motion.div>
            <div className="text-xs text-gray-500">
              © {currentYear} All rights reserved
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["React", "Tailwind CSS", "Vite"].map((tech) => (
              <motion.span
                key={tech}
                className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400"
                whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
