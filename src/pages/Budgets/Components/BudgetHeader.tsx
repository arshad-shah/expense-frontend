import React from 'react';
import { Filter, Plus } from 'lucide-react';
import { Button } from '@/components/Button';

interface BudgetHeaderProps {
  onOpenFilter: () => void;
  onAddBudget: () => void;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onOpenFilter,
  onAddBudget,
}) => {
  return (
    <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          Budgets
        </h1>
        <p className="mt-1 text-sm text-gray-500 hidden sm:block">
          Track and manage your spending limits
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Mobile view */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilter}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="info"
            size="sm"
            onClick={onAddBudget}
            className="w-full col-span-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>

        {/* Desktop view */}
        <div className="hidden sm:flex sm:items-center sm:space-x-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onOpenFilter}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
          <Button
            variant="info"
            size="md"
            onClick={onAddBudget}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Budget
          </Button>
        </div>
      </div>
    </div>
  );
};