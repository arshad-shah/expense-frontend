// src/pages/VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { completeEmailChange } from '@/services/EmailChangeService';
import { useAuth } from '@/contexts/AuthContext';
import Alert from '@/components/Alert';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const newEmail = searchParams.get('newEmail');
      
      if (!user || !newEmail) {
        setStatus('error');
        setError('Invalid verification link');
        return;
      }

      try {
        const response = await completeEmailChange(user.id, newEmail);
        
        if (response.status === 200) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(response.error || 'Failed to verify email');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    verifyEmail();
  }, [searchParams, user]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your new email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <Alert
            variant="success"
            title="Email Verified Successfully"
            icon={<CheckCircle2 className="h-5 w-5" />}
            actions={[
              {
                label: "Go to Dashboard",
                onClick: () => navigate('/'),
                variant: "primary"
              }
            ]}
          >
            Your email address has been successfully updated. You can now use your new email to sign in.
          </Alert>
        );

      case 'error':
        return (
          <Alert
            variant="error"
            title="Verification Failed"
            icon={<XCircle className="h-5 w-5" />}
            actions={[
              {
                label: "Try Again",
                onClick: () => window.location.reload(),
                variant: "primary"
              },
              {
                label: "Go to Dashboard",
                onClick: () => navigate('/'),
                variant: "secondary"
              }
            ]}
          >
            {error || 'Failed to verify your email address. Please try again.'}
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;