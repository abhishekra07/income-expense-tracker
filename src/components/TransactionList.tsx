import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Transaction, useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditTransactionDialog } from '@/components/EditTransactionDialog';
import { useToast } from '@/hooks/use-toast';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { state, dispatch } = useApp();
  const { categories, currentUser } = state;

  const { toast } = useToast();

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentUser?.preferences.currency || 'USD',
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
    setDeletingTransaction(null);
    toast({
      title: 'Transaction deleted',
      description: 'The transaction has been successfully deleted.',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">No transactions found</div>
        <p className="text-sm text-muted-foreground">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 rounded-lg card-modern border hover:shadow-[var(--shadow-hover)] transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                style={{
                  backgroundColor:
                    getCategoryColor(transaction.categoryId) + '20',
                }}
              >
                {transaction.type === 'income' ? (
                  <TrendingUp
                    className="h-4 w-4"
                    style={{ color: getCategoryColor(transaction.categoryId) }}
                  />
                ) : (
                  <TrendingDown
                    className="h-4 w-4"
                    style={{ color: getCategoryColor(transaction.categoryId) }}
                  />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{transaction.description}</h4>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor:
                      getCategoryColor(transaction.categoryId) + '20',
                    color: getCategoryColor(transaction.categoryId),
                  }}
                >
                  {getCategoryName(transaction.categoryId)}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span>
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </span>
                <span>•</span>
                <span className="capitalize">{transaction.paymentMode}</span>
                {transaction.label && (
                  <>
                    <span>•</span>
                    <span>{transaction.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {transaction.id.slice(-6)}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setEditingTransaction(transaction)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeletingTransaction(transaction)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
              <br />
              <br />
              <strong>{deletingTransaction?.description}</strong> -{' '}
              {deletingTransaction &&
                formatCurrency(deletingTransaction.amount)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deletingTransaction &&
                handleDeleteTransaction(deletingTransaction)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
