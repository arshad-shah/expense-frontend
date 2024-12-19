import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  PiggyBank as Bank,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { getRecentTransactions } from "@/services/TransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { cn, formatCurrency } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { getCategories } from "@/services/userService";
import { Category, Transaction, TransactionType } from "@/types";
interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  formatDate: (date: string) => string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const TransactionTypeIcon: React.FC<{ type: TransactionType }> = ({ type }) => (
  <motion.div
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    className={cn(
      "flex items-center justify-center w-10 h-10 rounded-xl",
      type === "INCOME"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-rose-50 text-rose-600",
    )}
  >
    {type === "INCOME" ? (
      <ArrowUpRight className="h-5 w-5" />
    ) : (
      <ArrowDownRight className="h-5 w-5" />
    )}
  </motion.div>
);

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  formatDate,
  isHovered,
  onHover,
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <motion.div
      onHoverStart={() => onHover(transaction.id)}
      onHoverEnd={() => onHover(null)}
      className={cn(
        "transition-colors duration-150",
        isHovered ? "bg-gray-50" : "hover:bg-gray-50",
      )}
    >
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <TransactionTypeIcon type={transaction.type} />

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                {transaction.description}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                  "transition-opacity duration-150 shadow-sm",
                  isHovered ? "opacity-100" : "opacity-90",
                )}
                style={{
                  backgroundColor: `${category?.color || "#6B7280"}15`,
                  color: category?.color || "#6B7280",
                }}
              >
                <Tag className="w-3 h-3" />
                {transaction.categoryName}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(transaction.transactionDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bank className="w-4 h-4 text-gray-400" />
                <span>{transaction.accountName}</span>
              </div>
            </div>
          </div>
        </div>

        <span
          className={cn(
            "text-sm font-medium px-3 py-1 rounded-lg",
            transaction.type === "INCOME"
              ? "text-emerald-700 bg-emerald-50"
              : "text-rose-700 bg-rose-50",
          )}
        >
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatCurrency(
            transaction.amount,
            user?.preferences.currency || "USD",
          )}
        </span>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <TransactionTypeIcon type={transaction.type} />
            <div>
              <span className="text-sm font-medium text-gray-900">
                {transaction.description}
              </span>
              <span
                className={cn(
                  "text-sm font-medium ml-2",
                  transaction.type === "INCOME"
                    ? "text-emerald-700"
                    : "text-rose-700",
                )}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatCurrency(
                  transaction.amount,
                  user?.preferences.currency || "USD",
                )}
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span
                className="text-sm"
                style={{ color: category?.color || "#6B7280" }}
              >
                {transaction.categoryName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatDate(transaction.transactionDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bank className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {transaction.accountName}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const { user } = useAuth();
  const [categories, setCategories] = useState<(Category | undefined)[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await getRecentTransactions(user.id, 5);
        if (response.status === 200 && response.data) {
          const categoriesOfTransactions = response.data.map((t) => ({
            categoryId: t.categoryId,
            category: t.categoryName,
          }));

          const allCategories = await getCategories(user.id);
          if (allCategories.error || !allCategories.data) {
            throw new Error("Failed to fetch categories");
          }

          const categoriesForTransactions = categoriesOfTransactions.map((c) =>
            allCategories.data?.find((cat) => cat.id === c.categoryId),
          );

          setCategories(categoriesForTransactions);
          setTransactions(response.data);
        } else {
          setError(response.error || "Failed to load recent transactions");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load recent transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your latest financial activity
            </p>
          </div>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
              <div className="h-6 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your latest financial activity
            </p>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest financial activity
              </p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          <EmptyState
            heading="No Recent Transactions"
            message="Start tracking your finances by adding your first transaction."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your latest financial activity
            </p>
          </div>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            category={categories[index]}
            formatDate={formatDate}
            isHovered={hoveredRow === transaction.id}
            onHover={setHoveredRow}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
