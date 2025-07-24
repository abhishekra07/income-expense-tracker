import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  User,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from '@/components/DateRangePicker';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { FinancialCharts } from '@/components/FinancialCharts';
import { ExportData } from '@/components/ExportData';

export default function Dashboard() {
  const { state, logout } = useApp();
  const { currentUser, transactions, categories, dateRange } = state;

  const navigate = useNavigate();

  const stripTime = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Filter transactions by date range and current user
  const filteredTransactions = useMemo(() => {
    const start = stripTime(dateRange.start);
    const end = stripTime(dateRange.end);

    return transactions.filter((transaction) => {
      const txnDate = stripTime(new Date(transaction.date));
      return (
        transaction.userId === currentUser?.id &&
        txnDate >= start &&
        txnDate <= end
      );
    });
  }, [transactions, currentUser?.id, dateRange]);

  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [filteredTransactions]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentUser?.preferences.currency || 'USD',
    }).format(amount);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-[var(--gradient-card)] backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-lg">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">ExpenseTracker</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AddTransactionDialog />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto">
                    <Avatar>
                      <AvatarImage
                        src={currentUser.avatar}
                        alt={currentUser.name}
                      />
                      <AvatarFallback>
                        {currentUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your financial activity for the selected
            period.
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="mb-6">
          <Card className="card-modern hover:shadow-[var(--shadow-hover)] transition-all duration-300 transform hover:scale-[1.01] cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Date Range:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <DateRangePicker />
                  <ExportData transactions={filteredTransactions} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-modern hover:shadow-[var(--shadow-hover)] transition-all duration-300 transform hover:scale-101 bg-[var(--gradient-card)] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <div className="p-2 rounded-full bg-[var(--gradient-subtle)]">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-primary">
                {formatCurrency(financialSummary.balance)}
              </div>
              <Badge
                variant={
                  financialSummary.balance >= 0 ? 'default' : 'destructive'
                }
                className="mt-2"
              >
                {financialSummary.balance >= 0 ? 'Positive' : 'Negative'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="card-modern hover:shadow-[var(--shadow-hover)] transition-all duration-300 transform hover:scale-101 bg-gradient-to-br from-income-light to-income-light/30 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <div className="p-2 rounded-full bg-income/10">
                <TrendingUp className="h-4 w-4 text-income" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-income">
                {formatCurrency(financialSummary.income)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {filteredTransactions.filter((t) => t.type === 'income').length}{' '}
                transactions
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover:shadow-[var(--shadow-hover)] transition-all duration-300 transform hover:scale-101 bg-gradient-to-br from-expense-light to-expense-light/30 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <div className="p-2 rounded-full bg-expense/10">
                <TrendingDown className="h-4 w-4 text-expense" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-expense">
                {formatCurrency(financialSummary.expenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {
                  filteredTransactions.filter((t) => t.type === 'expense')
                    .length
                }{' '}
                transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <FinancialCharts
            transactions={filteredTransactions}
            categories={categories}
          />
        </div>

        {/* Recent Transactions */}
        <Card className="card-modern cursor-pointer hover:!scale-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial activities for the selected period
                </CardDescription>
              </div>
              {/* <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div> */}
            </div>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={filteredTransactions.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
