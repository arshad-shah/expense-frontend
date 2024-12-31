import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions } from "@/services/TransactionService";
import type { Transaction, TransactionFilters } from "@/types";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Alert from "@/components/Alert";

interface MonthlySpending {
  month: string;
  spending: number;
  income: number;
}

const SpendingChart = () => {
  const [data, setData] = useState<MonthlySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");

        // Calculate date range for last 6 months
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Prepare filters
        const filters: TransactionFilters = {
          dateRange: {
            startDate: sixMonthsAgo.toISOString(),
            endDate: now.toISOString(),
          },
        };

        // Fetch transactions
        const response = await getTransactions(user.id, filters, 1, 1000);

        if (response.status !== 200 || !response.data) {
          throw new Error(response.error || "Failed to fetch transactions");
        }

        const monthlyData = processTransactions(response.data.items);
        setData(monthlyData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load spending data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const processTransactions = (
    transactions: Transaction[],
  ): MonthlySpending[] => {
    const monthlyTotals = new Map<
      string,
      { spending: number; income: number }
    >();
    const months: string[] = [];

    // Initialize last 6 months
    const now = new Date();
    const monthsArray = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });
    }).reverse();

    const uniqueMonths = Array.from(new Set(monthsArray));

    uniqueMonths.forEach((monthKey) => {
      months.push(monthKey);
      monthlyTotals.set(monthKey, { spending: 0, income: 0 });
    });

    // Process transactions
    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthKey = date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (monthlyTotals.has(monthKey)) {
        const currentTotals = monthlyTotals.get(monthKey)!;
        if (transaction.type === "EXPENSE") {
          currentTotals.spending += transaction.amount;
        } else if (transaction.type === "INCOME") {
          currentTotals.income += transaction.amount;
        }
      }
    });

    // Convert to array format
    return months.map((month) => ({
      month,
      ...monthlyTotals.get(month)!,
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col space-y-4">
          <div className="h-80 animate-pulse bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <Alert title="Error" variant="error">
          {error}
        </Alert>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ArrowDownRight className="h-4 w-4 text-indigo-600" />
              <p className="text-indigo-600">
                Spending:{" "}
                {formatCurrency(
                  payload[0].value,
                  user?.preferences?.currency || "USD",
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <p className="text-emerald-600">
                Income:{" "}
                {formatCurrency(
                  payload[1].value,
                  user?.preferences?.currency || "USD",
                )}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatCurrency(value, user?.preferences?.currency || "USD")
              }
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e2e8f0" }}
            />

            <Line
              type="monotone"
              dataKey="spending"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ fill: "#4f46e5", strokeWidth: 2, stroke: "#fff", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Spending"
              fill="url(#spendingGradient)"
            />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ fill: "#059669", strokeWidth: 2, stroke: "#fff", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Income"
              fill="url(#incomeGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingChart;
