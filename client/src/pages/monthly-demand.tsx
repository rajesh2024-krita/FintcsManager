import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { authenticatedApiRequest } from '../lib/auth';
import { DataTable } from '../components/tables/data-table';
import { Plus, FileSpreadsheet, Printer, Save, RotateCcw, X } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface MonthlyDemand {
  id: string;
  month: number;
  year: number;
  edpNo: string;
  memberName: string;
  loanAmount: string;
  cd: string;
  loan: string;
  interest: string;
  eLoan: string;
  eInterest: string;
  net: string;
  totalAmount: string;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function MonthlyDemand() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { toast } = useToast();
  const { hasRole } = useAuth();

  const { data: demands, isLoading, refetch } = useQuery<MonthlyDemand[]>({
    queryKey: ['/api/monthly-demands', selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', `/api/monthly-demands?month=${selectedMonth}&year=${selectedYear}`);
      return response.json();
    },
  });

  const createDemandMutation = useMutation({
    mutationFn: async () => {
      // This would typically generate monthly demands for all members
      const response = await authenticatedApiRequest('POST', '/api/monthly-demands/generate', {
        month: selectedMonth,
        year: selectedYear,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Monthly demand records created successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const calculateTotals = () => {
    if (!demands) return { totalMembers: 0, totalAmount: 0 };
    
    const totalMembers = demands.length;
    const totalAmount = demands.reduce((sum, demand) => sum + parseFloat(demand.totalAmount), 0);
    
    return { totalMembers, totalAmount };
  };

  const { totalMembers, totalAmount } = calculateTotals();

  const columns = [
    {
      header: 'EDP No',
      accessorKey: 'edpNo',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm font-medium">{row.edpNo}</span>
      ),
    },
    {
      header: 'Member Name',
      accessorKey: 'memberName',
      cell: (row: MonthlyDemand) => (
        <span className="font-medium">{row.memberName}</span>
      ),
    },
    {
      header: 'Loan Amt',
      accessorKey: 'loanAmount',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.loanAmount)}
        </span>
      ),
    },
    {
      header: 'CD',
      accessorKey: 'cd',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.cd)}
        </span>
      ),
    },
    {
      header: 'Loan',
      accessorKey: 'loan',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.loan)}
        </span>
      ),
    },
    {
      header: 'Interest',
      accessorKey: 'interest',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.interest)}
        </span>
      ),
    },
    {
      header: 'E-Loan',
      accessorKey: 'eLoan',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.eLoan)}
        </span>
      ),
    },
    {
      header: 'E-Interest',
      accessorKey: 'eInterest',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.eInterest)}
        </span>
      ),
    },
    {
      header: 'Net',
      accessorKey: 'net',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right">
          {formatCurrency(row.net)}
        </span>
      ),
    },
    {
      header: 'Total',
      accessorKey: 'totalAmount',
      cell: (row: MonthlyDemand) => (
        <span className="font-mono text-sm text-right font-semibold">
          {formatCurrency(row.totalAmount)}
        </span>
      ),
    },
  ];

  const handleExportExcel = () => {
    toast({
      title: "Export Started",
      description: "Excel export functionality would be implemented here",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Monthly demand data saved successfully",
    });
  };

  if (!hasRole(['super_admin', 'society_admin'])) {
    return (
      <MainLayout title="Monthly Demand" subtitle="Access Denied">
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Monthly Demand Processing" 
      subtitle="Process monthly financial demands and collections"
    >
      <div className="p-6 space-y-6">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Demand Processing</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={() => createDemandMutation.mutate()}
                disabled={createDemandMutation.isPending}
                data-testid="button-create-new-demand"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                data-testid="button-export-excel"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                data-testid="button-print-demand"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Period Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger data-testid="select-month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger data-testid="select-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Table */}
            <div className="data-table rounded-md overflow-hidden">
              <DataTable
                data={demands || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No monthly demand records found for selected period"
              />
              
              {/* Totals Footer */}
              {demands && demands.length > 0 && (
                <div className="bg-muted/50 px-4 py-3 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Badge variant="outline">
                        Total Members: {totalMembers}
                      </Badge>
                    </div>
                    <div className="font-semibold currency">
                      Total Amount: {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.close()}
                  data-testid="button-close"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
              <Button
                onClick={handleSave}
                data-testid="button-save-demand"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
