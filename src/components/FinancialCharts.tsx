import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/contexts/AppContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval } from 'date-fns';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface FinancialChartsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function FinancialCharts({ transactions, categories }: FinancialChartsProps) {
  // Prepare data for time series chart
  const timeSeriesData = useMemo(() => {
    if (transactions.length === 0) return [];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const startDate = startOfDay(parseISO(sortedTransactions[0].date));
    const endDate = startOfDay(parseISO(sortedTransactions[sortedTransactions.length - 1].date));
    
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dates.map((date) => {
      const dayTransactions = transactions.filter(
        (t) => startOfDay(parseISO(t.date)).getTime() === date.getTime()
      );

      const income = dayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(date, 'MMM dd'),
        income,
        expenses,
        balance: income - expenses,
      };
    });
  }, [transactions]);

  // Prepare data for category pie chart (expenses only)
  const categoryData = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId);
      const categoryName = category?.name || 'Unknown';
      const categoryColor = category?.color || '#6B7280';
      
      if (!acc[categoryName]) {
        acc[categoryName] = { total: 0, color: categoryColor };
      }
      acc[categoryName].total += transaction.amount;
      return acc;
    }, {} as Record<string, { total: number; color: string }>);

    return Object.entries(categoryTotals)
      .map(([name, data]) => ({
        name,
        value: data.total,
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Time Series Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Financial Trends</CardTitle>
          </div>
          <CardDescription>
            Daily income and expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--income))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(var(--expense))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown Pie Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <CardTitle>Expense Categories</CardTitle>
          </div>
          <CardDescription>
            Breakdown of expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-1 gap-2 text-sm">
                {categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">${entry.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}