import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  termsOfServiceContent,
  privacyPolicyContent,
  type LegalContent,
} from "@/data/legal";
import Alert from "@/components/Alert";
import ContentSection from "./ContentSection";

const LegalPage: React.FC<{ content: LegalContent }> = ({ content }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
        >
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {content.title}
          </h1>

          <div className="prose prose-indigo max-w-none">
            <Alert variant="promotional" title="Important Notice">
              {content.notice}
            </Alert>

            <ContentSection content={content} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const TermsOfService = () => {
  return <LegalPage content={termsOfServiceContent} />;
};

export const PrivacyPolicy = () => {
  return <LegalPage content={privacyPolicyContent} />;
};
