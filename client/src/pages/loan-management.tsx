import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { authenticatedApiRequest } from '../lib/auth';
import { DataTable } from '../components/tables/data-table';
import { LoanEntryForm } from '../components/forms/loan-entry-form';
import { Plus, Edit, HandCoins, Calendar } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface Loan {
  id: string;
  loanNo: string;
  loanType: string;
  loanDate: string;
  edpNo: string;
  memberName: string;
  loanAmount: string;
  previousLoan: string;
  netLoan: string;
  numberOfInstallments: number;
  installmentAmount: string;
  purpose?: string;
  paymentMode: string;
  isActive: boolean;
  createdAt: string;
}

export default function LoanManagement() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const { hasRole } = useAuth();

  const { data: loans, isLoading, refetch } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/loans');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await authenticatedApiRequest('POST', '/api/loans', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan created successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setSelectedLoan(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await authenticatedApiRequest('PUT', `/api/loans/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setSelectedLoan(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getLoanTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'general':
        return 'default';
      case 'housing':
        return 'secondary';
      case 'education':
        return 'outline';
      case 'vehicle':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const columns = [
    {
      header: 'Loan Details',
      accessorKey: 'loanDetails',
      cell: (row: Loan) => (
        <div className="flex items-center space-x-3">
          <HandCoins className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium font-mono">{row.loanNo}</div>
            <div className="text-sm text-muted-foreground">{row.memberName}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'EDP No',
      accessorKey: 'edpNo',
      cell: (row: Loan) => (
        <span className="font-mono text-sm">{row.edpNo}</span>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'loanType',
      cell: (row: Loan) => (
        <Badge variant={getLoanTypeBadgeVariant(row.loanType)}>
          {row.loanType.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'loanAmount',
      cell: (row: Loan) => (
        <div className="text-right">
          <div className="font-semibold currency">{formatCurrency(row.loanAmount)}</div>
          <div className="text-sm text-muted-foreground">
            Net: {formatCurrency(row.netLoan)}
          </div>
        </div>
      ),
    },
    {
      header: 'Installments',
      accessorKey: 'installments',
      cell: (row: Loan) => (
        <div className="text-center">
          <div className="font-medium">{row.numberOfInstallments}</div>
          <div className="text-sm text-muted-foreground currency">
            {formatCurrency(row.installmentAmount)}
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'loanDate',
      cell: (row: Loan) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(row.loanDate).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (row: Loan) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Closed'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: Loan) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row)}
          data-testid={`button-edit-loan-${row.id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (!hasRole(['super_admin', 'society_admin'])) {
    return (
      <MainLayout title="Loan Management" subtitle="Access Denied">
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
      title="Loan Management" 
      subtitle="Process loans and manage loan applications"
    >
      <div className="p-6 space-y-6">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Loans</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setSelectedLoan(null)} 
                  data-testid="button-create-loan"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Process Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedLoan ? 'Edit Loan' : 'Loan Entry Form'}
                  </DialogTitle>
                </DialogHeader>
                <LoanEntryForm
                  loan={selectedLoan}
                  onSubmit={(data) => {
                    if (selectedLoan) {
                      updateMutation.mutate({ id: selectedLoan.id, updates: data });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  onCancel={() => setIsDialogOpen(false)}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
              data={loans || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No loans found"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
