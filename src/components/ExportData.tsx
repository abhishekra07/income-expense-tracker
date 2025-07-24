import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Transaction, useApp } from '@/contexts/AppContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ExportDataProps {
  transactions: Transaction[];
}

export function ExportData({ transactions }: ExportDataProps) {
  const { state } = useApp();
  const { categories, currentUser } = state;
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

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

  const prepareDataForExport = () => {
    return transactions.map((transaction) => ({
      'Transaction ID': transaction.id,
      'Date': format(new Date(transaction.date), 'yyyy-MM-dd'),
      'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
      'Amount': transaction.amount,
      'Description': transaction.description,
      'Category': getCategoryName(transaction.categoryId),
      'Payment Mode': transaction.paymentMode.charAt(0).toUpperCase() + transaction.paymentMode.slice(1),
      'Label': transaction.label || '',
      'Proof URL': transaction.proofUrl || '',
    }));
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const data = prepareDataForExport();
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      const wscols = [
        { wch: 15 }, // Transaction ID
        { wch: 12 }, // Date
        { wch: 10 }, // Type
        { wch: 12 }, // Amount
        { wch: 30 }, // Description
        { wch: 15 }, // Category
        { wch: 12 }, // Payment Mode
        { wch: 15 }, // Label
        { wch: 20 }, // Proof URL
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      
      // Add summary sheet
      const summaryData = [
        { Metric: 'Total Transactions', Value: transactions.length },
        { Metric: 'Total Income', Value: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) },
        { Metric: 'Total Expenses', Value: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) },
        { Metric: 'Net Balance', Value: transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0) },
      ];
      
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      const fileName = `expense-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: 'Export successful',
        description: `Data exported to ${fileName}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data to Excel.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Expense Tracker Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 30);
      doc.text(`User: ${currentUser?.name || 'Unknown'}`, 20, 40);
      
      // Summary
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const netBalance = totalIncome - totalExpenses;
      
      doc.setFontSize(14);
      doc.text('Financial Summary', 20, 60);
      doc.setFontSize(10);
      doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 20, 70);
      doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 20, 80);
      doc.text(`Net Balance: ${formatCurrency(netBalance)}`, 20, 90);
      
      // Transactions table
      doc.setFontSize(14);
      doc.text('Transactions', 20, 110);
      
      let yPosition = 120;
      const pageHeight = doc.internal.pageSize.height;
      
      doc.setFontSize(8);
      doc.text('Date', 20, yPosition);
      doc.text('Type', 50, yPosition);
      doc.text('Amount', 70, yPosition);
      doc.text('Description', 100, yPosition);
      doc.text('Category', 150, yPosition);
      
      yPosition += 10;
      
      transactions.slice(0, 50).forEach((transaction) => { // Limit to 50 for PDF
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(format(new Date(transaction.date), 'MM/dd/yy'), 20, yPosition);
        doc.text(transaction.type, 50, yPosition);
        doc.text(formatCurrency(transaction.amount), 70, yPosition);
        doc.text(transaction.description.substring(0, 20), 100, yPosition);
        doc.text(getCategoryName(transaction.categoryId), 150, yPosition);
        
        yPosition += 8;
      });
      
      if (transactions.length > 50) {
        doc.text(`... and ${transactions.length - 50} more transactions`, 20, yPosition + 10);
      }
      
      const fileName = `expense-tracker-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Export successful',
        description: `Report exported to ${fileName}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error generating the PDF report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || transactions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}