import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Edit2,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Dialog } from '@/components/Dialog';
import { Dropdown, DropdownItemType } from '@/components/Dropdown';
import EditBudgetModal from './EditBudgetModel';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { deleteBudget } from '@/services/BudgetService';
import { Budget } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

type Status = 'EXCEEDED' | 'WARNING' | 'ON_TRACK';
type BadgeVariant = 'danger' | 'warning' | 'success';
interface BudgetPerformance {
  status: Status;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

interface StatusConfig {
  variant: BadgeVariant;
  icon: React.ElementType;
  className: string;
  progressColor: string;
  alertIcon: React.ElementType;
  message: string;
}

interface BudgetCardProps {
  budget: Budget;
  performance: BudgetPerformance;
  onUpdate: () => void;
}

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  EXCEEDED: {
    variant: 'danger',
    icon: TrendingUp,
    className: 'text-red-600 bg-red-50',
    progressColor: 'bg-red-500',
    alertIcon: AlertTriangle,
    message: 'Budget exceeded'
  },
  WARNING: {
    variant: 'warning',
    icon: AlertCircle,
    className: 'text-amber-600 bg-amber-50',
    progressColor: 'bg-amber-500',
    alertIcon: AlertCircle,
    message: 'Approaching limit'
  },
  ON_TRACK: {
    variant: 'success',
    icon: TrendingDown,
    className: 'text-emerald-600 bg-emerald-50',
    progressColor: 'bg-emerald-500',
    alertIcon: CheckCircle,
    message: 'On track'
  }
};

// Emoji mapping for the icons
const emojiMap: Record<string, string> = {
  // Income related
  'dollar': '💵',
  'plus-circle': '➕',
  'trending-up': '📈',
  'briefcase': '💼',
  
  // Food & Shopping
  'coffee': '☕',
  'shopping-cart': '🛒',
  'shopping-bag': '🛍️',
  
  // Transportation
  'car': '🚗',
  
  // Home & Bills
  'home': '🏠',
  'file-text': '📄',
  
  // Entertainment & Lifestyle
  'film': '🎬',
  'heart': '❤️',
  'user': '👤',
  
  // Education & Services
  'book': '📚',
  'repeat': '🔄',
  'shield': '🛡️',
  
  // Finance & Savings
  'piggy-bank': '🐷',
  'bar-chart': '📊',
  'credit-card': '💳',
  
  // Miscellaneous
  'gift': '🎁',
  'plane': '✈️',
  'more-horizontal': '⋯',

  // Additional useful mappings
  'calendar': '📅',
  'clock': '⏰',
  'alert-circle': '⚠️',
  'check-circle': '✅',
  'phone': '📱',
  'wifi': '📶',
  'tv': '📺',
  'music': '🎵',
  'truck': '🚚',
  'scissors': '✂️',
  'tool': '🔧',
  'zap': '⚡',
};

const getEmoji = (name: string): string => {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
  return emojiMap[normalizedName] || '❔';
};

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, performance, onUpdate }) => {
  const { user } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const statusConfig = STATUS_CONFIG[performance.status];
  const StatusIcon = statusConfig.icon;
  const AlertIcon = statusConfig.alertIcon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryStatus = (spent: number, allocated: number): BadgeVariant => {
    const percentage = (spent / allocated) * 100;
    return percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'success';
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteBudget(budget.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting budget:', error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const dropdownItems: DropdownItemType[] = [
    {
      icon: Edit2,
      label: 'Edit',
      onClick: () => setIsEditModalOpen(true),
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => setIsDeleteDialogOpen(true),
      variant: 'danger',
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 border border-gray-200">
        {/* Compact Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-md ${statusConfig.className}`}>
                <StatusIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{budget.name}</h3>
                <p className="text-sm text-gray-500">{formatCurrency(budget.amount)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={statusConfig.variant} className="text-xs">
                {performance.status.replace('_', ' ')}
              </Badge>
              <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowDropdown(!showDropdown)}
                className="hover:bg-gray-50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              
              <Dropdown
                show={showDropdown}
                onClose={() => setShowDropdown(false)}
                items={dropdownItems}
              />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-md bg-gray-50">
              <p className="text-xs text-gray-500">Spent</p>
              <p className="font-medium text-gray-900">{formatCurrency(performance.spent)}</p>
            </div>
            <div className="p-2 rounded-md bg-gray-50">
              <p className="text-xs text-gray-500">Left</p>
              <p className="font-medium text-gray-900">{formatCurrency(performance.remaining)}</p>
            </div>
            <div className="p-2 rounded-md bg-gray-50">
              <p className="text-xs text-gray-500">Used</p>
              <p className="font-medium text-gray-900">{performance.percentageUsed.toFixed(0)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${statusConfig.progressColor} transition-all duration-300`}
              style={{ width: `${Math.min(performance.percentageUsed, 100)}%` }}
            />
          </div>

          {/* Categories */}
          {budget.categories && budget.categories.length > 0 && (
            <div className="space-y-2">
              {budget.categories.slice(0, 2).map((categoryAllocation) => {
                const percentage = (categoryAllocation.spentAmount / categoryAllocation.allocatedAmount) * 100;
                return (
                  <div
                    key={categoryAllocation.category.id}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white text-lg">
                        {getEmoji(categoryAllocation.category.icon)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {categoryAllocation.category.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(categoryAllocation.spentAmount)} / {formatCurrency(categoryAllocation.allocatedAmount)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
              {budget.categories.length > 2 && (
                <button
                  className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                  onClick={() => setIsDetailsOpen(true)}
                >
                  View all {budget.categories.length} categories
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dialog Content */}
        <Dialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Budget Details"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{budget.name}</h2>
                <p className="text-sm text-gray-500">
                  {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                </p>
              </div>
              <Badge variant={statusConfig.variant} className="text-sm">
                <AlertIcon className="h-4 w-4 mr-1" />
                {statusConfig.message}
              </Badge>
            </div>

            <div className="space-y-2">
              {budget.categories?.map((categoryAllocation) => {
                const percentage = (categoryAllocation.spentAmount / categoryAllocation.allocatedAmount) * 100;
                const status = getCategoryStatus(categoryAllocation.spentAmount, categoryAllocation.allocatedAmount);
                
                return (
                  <div key={categoryAllocation.category.id} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-white text-xl">
                          {getEmoji(categoryAllocation.category.icon)}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {categoryAllocation.category.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(categoryAllocation.spentAmount)} of {formatCurrency(categoryAllocation.allocatedAmount)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={status}>{percentage.toFixed(0)}%</Badge>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${STATUS_CONFIG[status === 'danger' ? 'EXCEEDED' : status === 'warning' ? 'WARNING' : 'ON_TRACK'].progressColor} transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Budget
              </Button>
            </div>
          </div>
        </Dialog>

        <EditBudgetModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          budget={budget}
          onSave={onUpdate}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          entityName={budget.name}
          description="This action will permanently delete the budget and all its associated data."
        />
      </div>
    </>
  );
};