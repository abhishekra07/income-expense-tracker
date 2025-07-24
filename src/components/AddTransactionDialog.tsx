import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useApp, Transaction } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AddTransactionDialog() {
  const { state, dispatch } = useApp();
  const { categories, currentUser } = state;
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    categoryId: '',
    label: '',
    paymentMode: 'online' as 'cash' | 'online',
    date: new Date(),
    proofUrl: '',
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'expense',
      description: '',
      categoryId: '',
      label: '',
      paymentMode: 'online',
      date: new Date(),
      proofUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
      categoryId: formData.categoryId,
      label: formData.label || undefined,
      paymentMode: formData.paymentMode,
      date: formData.date.toISOString(),
      proofUrl: formData.proofUrl || undefined,
      userId: currentUser.id,
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

    toast({
      title: 'Transaction added',
      description: `Successfully added ${
        formData.type
      } of ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentUser.preferences.currency,
      }).format(transaction.amount)}`,
    });

    resetForm();
    setOpen(false);
  };

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type || category.type === 'both'
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-3">
              <Label>Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as 'income' | 'expense',
                    categoryId: '',
                  })
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="text-income font-medium">
                    Income
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="text-expense font-medium">
                    Expense
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Mode */}
            <div className="space-y-3">
              <Label>Payment Mode</Label>
              <RadioGroup
                value={formData.paymentMode}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    paymentMode: value as 'cash' | 'online',
                  })
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online">Online</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Label (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="label">Label (Optional)</Label>
              <Input
                id="label"
                placeholder="Add a label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />
            </div>

            {/* Proof Upload (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="proof">Proof of Transaction (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  className="flex-1"
                  onChange={(e) => {
                    // In a real app, you would upload the file and get a URL
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, proofUrl: file.name });
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                Add Transaction
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
