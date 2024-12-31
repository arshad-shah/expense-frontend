import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts } from "@/services/AccountService";
import { getTransactions } from "@/services/TransactionService";
import type { Transaction } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import Alert from "@/components/Alert";

interface StatData {
  totalBalance: number;
  monthlySpending: number;
  monthlySavings: number;
  balanceChange: number;
  spendingChange: number;
  savingsChange: number;
}

const StatCards = () => {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const accountsResponse = await getAccounts(user.id);
        if (accountsResponse.status !== 200 || !accountsResponse.data) {
          throw new Error(accountsResponse.error || "Failed to fetch accounts");
        }

        const totalBalance = accountsResponse.data.items.reduce(
          (sum, account) => sum + account.balance,
          0,
        );

        const now = new Date();
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        );
        const currentMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        );
        const previousMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const [currentMonthResponse, previousMonthResponse] = await Promise.all(
          [
            getTransactions(
              user.id,
              {
                dateRange: {
                  startDate: currentMonthStart.toISOString(),
                  endDate: currentMonthEnd.toISOString(),
                },
              },
              1,
              1000,
            ),
            getTransactions(
              user.id,
              {
                dateRange: {
                  startDate: previousMonthStart.toISOString(),
                  endDate: previousMonthEnd.toISOString(),
                },
              },
              1,
              1000,
            ),
          ],
        );

        if (!currentMonthResponse.data || !previousMonthResponse.data) {
          throw new Error("Failed to fetch transactions");
        }

        const currentMonthData = calculateMonthlyData(
          currentMonthResponse.data.items,
        );
        const previousMonthData = calculateMonthlyData(
          previousMonthResponse.data.items,
        );

        const spendingChange = calculatePercentageChange(
          previousMonthData.spending,
          currentMonthData.spending,
        );

        const savingsChange = calculatePercentageChange(
          previousMonthData.income - previousMonthData.spending,
          currentMonthData.income - currentMonthData.spending,
        );

        const currentNetFlow =
          currentMonthData.income - currentMonthData.spending;
        const previousNetFlow =
          previousMonthData.income - previousMonthData.spending;
        const balanceChange = calculatePercentageChange(
          previousNetFlow,
          currentNetFlow,
        );

        const monthlySavings =
          currentMonthData.income - currentMonthData.spending;

        setStats({
          totalBalance,
          monthlySpending: currentMonthData.spending,
          monthlySavings: monthlySavings > 0 ? monthlySavings : 0,
          balanceChange,
          spendingChange,
          savingsChange,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load statistics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const calculateMonthlyData = (transactions: Transaction[]) => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "EXPENSE") {
          acc.spending += transaction.amount;
        } else if (transaction.type === "INCOME") {
          acc.income += transaction.amount;
        }
        return acc;
      },
      { spending: 0, income: 0 },
    );
  };

  const calculatePercentageChange = (previous: number, current: number) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return current > 0 ? 100 : -100;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-xl shadow-sm p-4 md:p-6"
          >
            <div className="h-20 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <Alert title="Error" variant="error">
          {error}
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  const getChangeStyle = (change: number, inverse: boolean = false) => {
    const isPositive = inverse ? change <= 0 : change >= 0;
    return {
      colors: isPositive
        ? "text-emerald-600 bg-emerald-50"
        : "text-indigo-600 bg-indigo-50",
      icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  const handleCardChange = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveCard(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const statCards = [
    {
      title: "Total Balance",
      amount: stats?.totalBalance || 0,
      change: stats?.balanceChange || 0,
      icon: Wallet,
      gradientFrom: "from-blue-600",
      gradientVia: "via-blue-500",
      gradientTo: "to-sky-400",
      description: "Total across all accounts",
      tag: "Assets",
      trend: stats?.balanceChange >= 0 ? "Up" : "Down",
      trendDetail: `${Math.abs(stats?.balanceChange || 0).toFixed(1)}% from last month`,
    },
    {
      title: "Monthly Expenses",
      amount: stats?.monthlySpending || 0,
      change: stats?.spendingChange || 0,
      icon: CreditCard,
      inverse: true,
      gradientFrom: "from-rose-600",
      gradientVia: "via-rose-500",
      gradientTo: "to-orange-400",
      description: "Total spent this month",
      tag: "Spending",
      trend: stats?.spendingChange <= 0 ? "Good" : "High",
      trendDetail: `${Math.abs(stats?.spendingChange || 0).toFixed(1)}% vs last month`,
    },
    {
      title: "Money Saved",
      amount: stats?.monthlySavings || 0,
      change: stats?.savingsChange || 0,
      icon: PiggyBank,
      gradientFrom: "from-emerald-600",
      gradientVia: "via-emerald-500",
      gradientTo: "to-teal-400",
      description: "Amount saved this month",
      tag: "Savings",
      trend: stats?.savingsChange >= 0 ? "On Track" : "Below Target",
      trendDetail: `${Math.abs(stats?.savingsChange || 0).toFixed(1)}% vs last month`,
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const changeStyle = getChangeStyle(stat.change, stat.inverse);
          const ChangeIcon = changeStyle.icon;

          return (
            <div
              key={index}
              className={cn(
                "relative overflow-hidden rounded-xl shadow-lg",
                "bg-gradient-to-br",
                stat.gradientFrom,
                stat.gradientVia,
                stat.gradientTo,
                "p-6 group hover:shadow-xl transition-all duration-300",
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  {stat.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(
                    stat.amount,
                    user?.preferences?.currency || "USD",
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={cn(
                      "flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
                      "bg-white/20 backdrop-blur-sm text-white",
                    )}
                  >
                    <ChangeIcon className="h-4 w-4 mr-1" />
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                  <p className="text-sm text-white/80">{stat.trendDetail}</p>
                </div>
              </div>

              <div
                className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 blur-2xl transition-all 
                            group-hover:bg-white/10 group-hover:w-40 group-hover:h-40"
              ></div>
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="relative overflow-hidden rounded-xl">
          <NavigationButton
            direction="left"
            onClick={() =>
              handleCardChange(
                (activeCard - 1 + statCards.length) % statCards.length,
              )
            }
          />
          <NavigationButton
            direction="right"
            onClick={() =>
              handleCardChange((activeCard + 1) % statCards.length)
            }
          />

          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeCard * 100}%)` }}
          >
            {statCards.map((stat, index) => {
              const changeStyle = getChangeStyle(stat.change, stat.inverse);
              const ChangeIcon = changeStyle.icon;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex-shrink-0 w-full px-12 py-6",
                    "bg-gradient-to-br",
                    stat.gradientFrom,
                    stat.gradientVia,
                    stat.gradientTo,
                    " overflow-hidden",
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                          {stat.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {stat.title}
                    </h3>
                    <p className="text-3xl font-bold text-white mb-4">
                      {formatCurrency(
                        stat.amount,
                        user?.preferences?.currency || "USD",
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center px-2.5 py-1 rounded-full text-sm 
                                    bg-white/20 backdrop-blur-sm text-white"
                      >
                        <ChangeIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          {Math.abs(stat.change).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-white/80">
                        {stat.trendDetail}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 blur-2xl"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Carousel Indicator */}
        <div className="flex justify-center items-center gap-3 mt-6">
          {statCards.map((_, index) => {
            const isActive = index === activeCard;
            return (
              <button
                key={index}
                onClick={() => handleCardChange(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  "shadow-sm hover:scale-110",
                  isActive
                    ? cn(
                        "w-8 h-2",
                        index === 0 ? "bg-blue-500" : "",
                        index === 1 ? "bg-rose-500" : "",
                        index === 2 ? "bg-emerald-500" : "",
                      )
                    : cn(
                        "w-2 h-2",
                        "bg-gray-300 hover:bg-gray-400",
                        "dark:bg-gray-600 dark:hover:bg-gray-500",
                      ),
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const NavigationButton = ({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-sm 
              hover:bg-white/20 transition-all z-10 text-white"
    style={{ [direction]: "0.5rem" }}
  >
    {direction === "left" ? (
      <ChevronLeft size={20} />
    ) : (
      <ChevronRight size={20} />
    )}
  </button>
);

export default StatCards;
