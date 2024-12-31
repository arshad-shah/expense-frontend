import React from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";

interface AccountHeaderProps {
  onAddAccount: () => void;
  disableAdd?: boolean;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({
  onAddAccount,
  disableAdd = false,
}) => {
  return (
    <div className="relative">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl" />

      <div className="relative sm:py-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-100">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Accounts
            </h1>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Mobile view */}
          <div className="sm:hidden">
            <motion.div whileTap={{ scale: 0.95 }} className="w-full">
              <Button
                variant="primary"
                size="md"
                onClick={onAddAccount}
                disabled={disableAdd}
                fullWidth
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </motion.div>
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <Button
                variant="primary"
                size="md"
                onClick={onAddAccount}
                disabled={disableAdd}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Account
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHeader;
