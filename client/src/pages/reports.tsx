import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/use-auth';
import { authenticatedApiRequest } from '../lib/auth';
import { DataTable } from '../components/tables/data-table';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface LoanReport {
  id: string;
  edpNo: string;
  memberName: string;
  loanAmount: string;
  loanDate: string;
  principal: string;
  interest: string;
  penal: string;
  total: string;
  lastPaymentDate?: string;
}

const REPORT_TYPES = [
  { value: 'all_loans', label: 'All Loans' },
  { value: 'defaulters', label: 'Defaulter\'s List' },
  { value: 'excess_loans', label: 'Excess Loan Over Limit' },
  { value: 'recovered_loans', label: 'Excess Recovered G.Loan & E.Loan' },
  { value: 'monthly_summary', label: 'Monthly Summary' },
  { value: 'society_wise', label: 'Society Wise Report' },
];

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState('all_loans');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { hasRole } = useAuth();

  const { data: loanReports, isLoading } = useQuery<LoanReport[]>({
    queryKey: ['/api/loans'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/loans');
      return response.json();
    },
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const calculateTotal = (principal: string, interest: string, penal: string) => {
    return parseFloat(principal) + parseFloat(interest) + parseFloat(penal);
  };

  const getFilteredReports = () => {
    if (!loanReports) return [];
    
    let filtered = loanReports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.edpNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.memberName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFrom) {
      filtered = filtered.filter(report => 
        new Date(report.loanDate) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filtered = filtered.filter(report => 
        new Date(report.loanDate) <= new Date(dateTo)
      );
    }
    
    // Apply report type filters
    switch (selectedReportType) {
      case 'defaulters':
        // Mock logic for defaulters - loans with penal interest > 0
        filtered = filtered.filter(report => parseFloat(report.penal || '0') > 0);
        break;
      case 'excess_loans':
        // Mock logic for excess loans - loans above certain limit
        filtered = filtered.filter(report => parseFloat(report.loanAmount) > 1000000);
        break;
      case 'recovered_loans':
        // Mock logic for recovered loans
        filtered = filtered.filter(report => report.lastPaymentDate);
        break;
    }
    
    return filtered;
  };

  const filteredReports = getFilteredReports();

  const calculateSummary = () => {
    const totalRecords = filteredReports.length;
    const totalAmount = filteredReports.reduce((sum, report) => {
      return sum + calculateTotal(report.principal || '0', report.interest || '0', report.penal || '0');
    }, 0);
    const totalPrincipal = filteredReports.reduce((sum, report) => sum + parseFloat(report.principal || '0'), 0);
    const totalInterest = filteredReports.reduce((sum, report) => sum + parseFloat(report.interest || '0'), 0);
    const totalPenal = filteredReports.reduce((sum, report) => sum + parseFloat(report.penal || '0'), 0);
    
    return {
      totalRecords,
      totalAmount,
      totalPrincipal,
      totalInterest,
      totalPenal,
    };
  };

  const summary = calculateSummary();

  const handleExport = () => {
    // Mock export functionality
    const csvContent = [
      ['EDP No', 'Name', 'Amount', 'Loan Date', 'Principal', 'Interest', 'Penal', 'Total', 'Last Payment'],
      ...filteredReports.map(report => [
        report.edpNo,
        report.memberName,
        report.loanAmount,
        new Date(report.loanDate).toLocaleDateString(),
        report.principal || '0',
        report.interest || '0',
        report.penal || '0',
        calculateTotal(report.principal || '0', report.interest || '0', report.penal || '0'),
        report.lastPaymentDate ? new Date(report.lastPaymentDate).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `loan_report_${selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'EDP No',
      accessorKey: 'edpNo',
      cell: (row: LoanReport) => (
        <span className="font-mono text-sm font-medium">{row.edpNo}</span>
      ),
    },
    {
      header: 'Name',
      accessorKey: 'memberName',
      cell: (row: LoanReport) => (
        <span className="font-medium">{row.memberName}</span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'loanAmount',
      cell: (row: LoanReport) => (
        <span className="font-mono text-sm">
          {formatCurrency(row.loanAmount)}
        </span>
      ),
    },
    {
      header: 'Loan Date',
      accessorKey: 'loanDate',
      cell: (row: LoanReport) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(row.loanDate).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Principal',
      accessorKey: 'principal',
      cell: (row: LoanReport) => (
        <span className="font-mono text-sm currency">
          {formatCurrency(row.principal || '0')}
        </span>
      ),
    },
    {
      header: 'Interest',
      accessorKey: 'interest',
      cell: (row: LoanReport) => (
        <span className="font-mono text-sm currency">
          {formatCurrency(row.interest || '0')}
        </span>
      ),
    },
    {
      header: 'Penal',
      accessorKey: 'penal',
      cell: (row: LoanReport) => (
        <span className="font-mono text-sm currency text-destructive">
          {parseFloat(row.penal || '0') > 0 ? formatCurrency(row.penal) : '-'}
        </span>
      ),
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (row: LoanReport) => (
        <span className="font-mono text-sm font-semibold currency">
          {formatCurrency(calculateTotal(row.principal || '0', row.interest || '0', row.penal || '0'))}
        </span>
      ),
    },
    {
      header: 'Last Payment',
      accessorKey: 'lastPaymentDate',
      cell: (row: LoanReport) => (
        <span className="text-sm">
          {row.lastPaymentDate 
            ? new Date(row.lastPaymentDate).toLocaleDateString()
            : 'N/A'
          }
        </span>
      ),
    },
  ];

  if (!hasRole(['super_admin', 'society_admin', 'user'])) {
    return (
      <MainLayout title="Reports" subtitle="Access Denied">
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
      title="Reports" 
      subtitle="Generate and view financial reports"
    >
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="financial-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-lg font-semibold">{summary.totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold currency">
                    {formatCurrency(summary.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-semibold currency">
                    {formatCurrency(summary.totalInterest)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Penal</p>
                  <p className="text-lg font-semibold currency">
                    {formatCurrency(summary.totalPenal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select
                  value={selectedReportType}
                  onValueChange={setSelectedReportType}
                >
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by EDP or Name"
                    data-testid="input-search"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Actions */}
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {REPORT_TYPES.find(type => type.value === selectedReportType)?.label} Report
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleExport}
                data-testid="button-export-report"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                data-testid="button-print-report"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredReports}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No records found for the selected criteria"
            />
            
            {/* Grand Total Footer */}
            {filteredReports.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">
                    Grand Total ({summary.totalRecords} Records)
                  </div>
                  <div className="font-bold text-lg currency">
                    {formatCurrency(summary.totalAmount)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
