import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Settings,
  Palette,
  Globe,
  DollarSign,
  LogOut,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { state, dispatch, logout } = useApp();
  const { currentUser, transactions, categories } = state;
  const { toast } = useToast();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState(
    currentUser?.preferences || {
      currency: 'USD',
      language: 'en',
      theme: 'light' as 'light' | 'dark' | 'system',
    }
  );

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleSavePreferences = () => {
    dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });
    toast({
      title: 'Preferences updated',
      description: 'Your preferences have been saved successfully.',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  // Calculate user statistics
  const userTransactions = transactions.filter(
    (t) => t.userId === currentUser.id
  );
  const totalIncome = userTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = userTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferences.currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-[var(--gradient-card)] backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-semibold">Profile Settings</h1>
            <div className="w-32" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="card-modern cursor-pointer hover:!scale-100">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20 shadow-[var(--shadow-glow)]">
                  <AvatarImage
                    src={currentUser.avatar}
                    alt={currentUser.name}
                  />
                  <AvatarFallback className="text-2xl bg-[var(--gradient-primary)] text-primary-foreground">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl bg-[var(--gradient-primary)] bg-clip-text text-primary">
                  {currentUser.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                {/* Account Stats */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Account Overview
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Transactions:
                      </span>
                      <Badge variant="secondary">
                        {userTransactions.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Income:
                      </span>
                      <span className="font-medium text-income">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Expenses:
                      </span>
                      <span className="font-medium text-expense">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Net Balance:
                      </span>
                      <span
                        className={`font-semibold ${
                          netBalance >= 0 ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {formatCurrency(netBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Logout Button */}
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preferences */}
            <Card className="card-modern cursor-pointer hover:!scale-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your expense tracker experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Currency
                  </Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">
                        AUD - Australian Dollar
                      </SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Language
                  </Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Theme
                  </Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, theme: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSavePreferences}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow"
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Category Management */}
            <Card className="card-modern cursor-pointer hover:!scale-100">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage your transaction categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2 p-2 rounded-lg border bg-card/50"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium truncate">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Add Custom Category
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
