import React, { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Edit2,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Dialog } from "@/components/Dialog";
import { Dropdown, DropdownItemType } from "@/components/Dropdown";
import EditBudgetModal from "./EditBudgetModel";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { deactivateBudget } from "@/services/BudgetService";
import { getCategoriesByIds } from "@/services/userService";
import { Budget, Category } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/Progressbar";

interface BudgetPerformance {
  status: Status;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

type Status = "EXCEEDED" | "WARNING" | "ON_TRACK";
type BadgeVariant = "danger" | "warning" | "success";

interface StatusConfig {
  variant: BadgeVariant;
  icon: React.ElementType;
  className: string;
  progressColor: string;
  bgGradient: string;
  alertIcon: React.ElementType;
  message: string;
  ringColor: string;
}

interface BudgetCardProps {
  budget: Budget;
  performance: BudgetPerformance;
  onUpdate: () => void;
}

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  EXCEEDED: {
    variant: "danger",
    icon: TrendingUp,
    className: "text-red-600 bg-gradient-to-br from-red-50 to-red-100",
    progressColor: "bg-gradient-to-r from-red-500 to-red-600",
    bgGradient: "bg-gradient-to-br from-red-50 to-red-100",
    alertIcon: AlertTriangle,
    message: "Budget exceeded",
    ringColor: "ring-red-500",
  },
  WARNING: {
    variant: "warning",
    icon: AlertCircle,
    className: "text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100",
    progressColor: "bg-gradient-to-r from-amber-500 to-amber-600",
    bgGradient: "bg-gradient-to-br from-amber-50 to-amber-100",
    alertIcon: AlertCircle,
    message: "Approaching limit",
    ringColor: "ring-amber-500",
  },
  ON_TRACK: {
    variant: "success",
    icon: TrendingDown,
    className:
      "text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100",
    progressColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    alertIcon: CheckCircle,
    message: "On track",
    ringColor: "ring-emerald-500",
  },
};

// Emoji mapping for the icons
const emojiMap: Record<string, string> = {
  // Income related
  dollar: "💵",
  "plus-circle": "➕",
  "trending-up": "📈",
  briefcase: "💼",

  // Food & Shopping
  coffee: "☕",
  "shopping-cart": "🛒",
  "shopping-bag": "🛍️",

  // Transportation
  car: "🚗",

  // Home & Bills
  home: "🏠",
  "file-text": "📄",

  // Entertainment & Lifestyle
  film: "🎬",
  heart: "❤️",
  user: "👤",

  // Education & Services
  book: "📚",
  repeat: "🔄",
  shield: "🛡️",

  // Finance & Savings
  "piggy-bank": "🐷",
  "bar-chart": "📊",
  "credit-card": "💳",

  // Miscellaneous
  gift: "🎁",
  plane: "✈️",
  "more-horizontal": "⋯",

  // Additional useful mappings
  calendar: "📅",
  clock: "⏰",
  "alert-circle": "⚠️",
  "check-circle": "✅",
  phone: "📱",
  wifi: "📶",
  tv: "📺",
  music: "🎵",
  truck: "🚚",
  scissors: "✂️",
  tool: "🔧",
  zap: "⚡",
};

const getEmoji = (name: string): string => {
  const normalizedName = name.toLowerCase().replace(/\s+/g, "-");
  return emojiMap[normalizedName] || "❔";
};

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  performance,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const actionButtonRefs = useRef<{
    [key: string]: React.RefObject<HTMLButtonElement>;
  }>({});

  // Initialize refs for action buttons
  React.useEffect(() => {
    if (!actionButtonRefs.current[budget.id]) {
      actionButtonRefs.current[budget.id] = React.createRef();
    }
  }, [budget]);

  const statusConfig = STATUS_CONFIG[performance.status];
  const StatusIcon = statusConfig.icon;
  const AlertIcon = statusConfig.alertIcon;
  // get the categories for the ids
  const getCategoriesForIds = async (
    categoryIds: string[],
  ): Promise<Category[]> => {
    try {
      if (user?.id) {
        const categories = await getCategoriesByIds(user.id, categoryIds);
        if (categories.data) {
          return categories.data;
        }
      } else {
        console.error("User ID is undefined");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    return [];
  };

  // useeffect to get the categories for the budget
  useEffect(() => {
    const categoryIds = Object.values(budget.categories).map(
      (category) => category.categoryId,
    );
    getCategoriesForIds(categoryIds).then((categories) => {
      setCategories(categories);
    });
  }, [budget.categories]);

  const handleDelete = async (): Promise<void> => {
    try {
      if (user?.id) {
        await deactivateBudget(user.id, budget.id);
      } else {
        console.error("User ID is undefined");
      }
      onUpdate();
    } catch (error) {
      console.error("Error deleting budget:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const dropdownItems: DropdownItemType[] = [
    {
      icon: Edit2,
      label: "Edit",
      onClick: () => setIsEditModalOpen(true),
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => setIsDeleteDialogOpen(true),
      variant: "danger",
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative">
          <div className={`p-4 ${statusConfig.bgGradient}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg shadow-md ${statusConfig.className} ring-2 ${statusConfig.ringColor}`}
                >
                  <StatusIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {budget.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {formatCurrency(
                      budget.amount,
                      user?.preferences.currency || "USD",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    ref={actionButtonRefs.current[budget.id]}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="hover:bg-white/20 rounded-lg"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                  <Dropdown
                    show={showDropdown}
                    alignTo={actionButtonRefs.current[budget.id]?.current}
                    onClose={() => setShowDropdown(false)}
                    items={dropdownItems}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Spent</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  performance.spent,
                  user?.preferences.currency || "USD",
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  performance.remaining,
                  user?.preferences.currency || "USD",
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {performance.percentageUsed.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
            {/* <div
              className={`h-full ${statusConfig.progressColor} transition-all duration-300`}
              style={{ width: `${Math.min(performance.percentageUsed, 100)}%` }}
            /> */}
            <ProgressBar
              value={performance.percentageUsed}
              variant={statusConfig.variant}
            />
          </div>

          {/* Enhanced Categories Section */}
          {budget.categories &&
            Object.entries(budget.categories).length > 0 && (
              <div className="space-y-3 mt-4">
                {Object.entries(budget.categories)
                  .slice(0, 2)
                  .map(([categoryName, category]) => {
                    const percentage = (category.spent / category.amount) * 100;
                    const categoryIcon =
                      categories.find((c) => c.id === category.categoryId)
                        ?.icon || "more-horizontal";

                    return (
                      <div
                        key={category.categoryId}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm text-xl">
                            {getEmoji(categoryIcon)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {categoryName}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">
                                {formatCurrency(
                                  category.spent,
                                  user?.preferences.currency || "USD",
                                )}
                              </p>
                              <span className="text-gray-400">/</span>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(
                                  category.amount,
                                  user?.preferences.currency || "USD",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            percentage > 100
                              ? "danger"
                              : percentage > 80
                                ? "warning"
                                : "success"
                          }
                          className="text-sm"
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    );
                  })}

                {Object.entries(budget.categories).length > 2 && (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsDetailsOpen(true)}
                  >
                    View all {Object.entries(budget.categories).length}{" "}
                    categories
                  </Button>
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {budget.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(budget.startDate, { shortFormat: true })} -{" "}
                  {formatDate(budget.endDate, { shortFormat: true })}
                </p>
              </div>
              <Badge variant={statusConfig.variant} className="text-sm">
                <AlertIcon className="h-4 w-4 mr-1" />
                {statusConfig.message}
              </Badge>
            </div>

            <div className="space-y-2">
              {Object.entries(budget.categories)?.map((categoryAllocation) => {
                const category = categoryAllocation[1];
                const categoryName = categoryAllocation[0];
                const percentage = (category.spent / category.amount) * 100;
                const status = category.status;
                return (
                  <div
                    key={category.categoryId}
                    className="p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-white text-xl">
                          {getEmoji(
                            categories.find((c) => c.id === category.categoryId)
                              ?.icon || "more-horizontal",
                          )}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {categoryName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(
                              category.spent,
                              user?.preferences.currency || "USD",
                            )}{" "}
                            of{" "}
                            {formatCurrency(
                              category.amount,
                              user?.preferences.currency || "USD",
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge variant={STATUS_CONFIG[status as Status].variant}>
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <ProgressBar
                        value={percentage}
                        variant={
                          status === "EXCEEDED"
                            ? "danger"
                            : status === "WARNING"
                              ? "warning"
                              : "success"
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
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
