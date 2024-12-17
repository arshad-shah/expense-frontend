import React from 'react';
import { Filter, Download, Plus, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';

interface TransactionHeaderProps {
  onOpenFilter: () => void;
  onExport: () => void;
  onAddTransaction: () => void;
  disableAdd?: boolean;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  onOpenFilter,
  onExport,
  onAddTransaction,
  disableAdd = false
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
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-100">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Transactions
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 hidden sm:flex items-center gap-2">
            Manage your income and expenses
          </p>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Mobile view: Action buttons in a grid */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenFilter}
                disabled={disableAdd}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={onExport}
                disabled={disableAdd}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.95 }}
              className="w-full col-span-2"
            >
              <Button
                variant="primary"
                size="sm"
                onClick={onAddTransaction}
                disabled={disableAdd}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </motion.div>
          </div>

          {/* Desktop view: Action buttons in a row */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="secondary"
                size="md"
                onClick={onOpenFilter}
                className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="secondary"
                size="md"
                onClick={onExport}
                className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <Button
                variant="primary"
                size="md"
                onClick={onAddTransaction}
                disabled={disableAdd}
                className="relative bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-100/50"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Transaction
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHeader;