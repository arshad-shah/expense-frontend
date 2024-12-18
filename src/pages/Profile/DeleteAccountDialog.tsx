import React, { useState } from 'react';
import { Dialog } from '@/components/Dialog';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Lock, AlertTriangle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  // Get the user's authentication provider
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const providerId = currentUser?.providerData[0]?.providerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (providerId === 'password' && !password.trim()) {
        setError('Please enter your password');
        return;
      }

      await onConfirm(providerId === 'password' ? password : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(undefined);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Delete Account">
      <div className="space-y-4">
        {/* Warning Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-800">
              This action cannot be undone
            </p>
            <p className="text-sm text-red-700">
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              <li>All accounts and transactions</li>
              <li>Budgets and categories</li>
              <li>Personal settings and preferences</li>
            </ul>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show password input only for email/password users */}
          {providerId === 'password' ? (
            <Input
              label="Confirm your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              icon={<Lock className="h-5 w-5" />}
              placeholder="Enter your password"
              required
            />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Shield className="h-5 w-5 text-blue-500" />
              <div className="text-sm text-blue-700">
                You'll need to re-authenticate with {
                  providerId === 'google.com' ? 'Google' : 'your provider'
                } to confirm this action
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isDeleting}
            >
              Delete Account
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};