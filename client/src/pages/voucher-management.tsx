import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { authenticatedApiRequest } from '../lib/auth';
import { DataTable } from '../components/tables/data-table';
import { Plus, Edit, Receipt, Printer, Trash2, Search, RotateCcw } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface VoucherEntry {
  particulars: string;
  debit: number;
  credit: number;
}

interface Voucher {
  id: string;
  voucherNo: string;
  voucherType: string;
  voucherDate: string;
  entries: VoucherEntry[];
  totalDebit: string;
  totalCredit: string;
  chequeNo?: string;
  chequeDate?: string;
  narration?: string;
  remarks?: string;
  isActive: boolean;
  createdAt: string;
}

const VOUCHER_TYPES = [
  { value: 'payment', label: 'Payment' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'journal', label: 'Journal' },
  { value: 'contra', label: 'Contra' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'others', label: 'Others' },
];

export default function VoucherManagement() {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    voucherType: 'payment',
    voucherNo: '',
    voucherDate: new Date().toISOString().split('T')[0],
    chequeNo: '',
    chequeDate: '',
    narration: '',
    remarks: '',
  });
  const [entries, setEntries] = useState<VoucherEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    particulars: '',
    debit: 0,
    credit: 0,
    type: 'debit' as 'debit' | 'credit',
    amount: 0,
  });

  const { toast } = useToast();
  const { hasRole } = useAuth();

  const { data: vouchers, isLoading, refetch } = useQuery<Voucher[]>({
    queryKey: ['/api/vouchers'],
    queryFn: async () => {
      const response = await authenticatedApiRequest('GET', '/api/vouchers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await authenticatedApiRequest('POST', '/api/vouchers', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Voucher created successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
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
      const response = await authenticatedApiRequest('PUT', `/api/vouchers/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Voucher updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedApiRequest('DELETE', `/api/vouchers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Voucher deleted successfully",
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

  const resetForm = () => {
    setFormData({
      voucherType: 'payment',
      voucherNo: '',
      voucherDate: new Date().toISOString().split('T')[0],
      chequeNo: '',
      chequeDate: '',
      narration: '',
      remarks: '',
    });
    setEntries([]);
    setCurrentEntry({
      particulars: '',
      debit: 0,
      credit: 0,
      type: 'debit',
      amount: 0,
    });
    setSelectedVoucher(null);
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      voucherType: voucher.voucherType,
      voucherNo: voucher.voucherNo,
      voucherDate: voucher.voucherDate.split('T')[0],
      chequeNo: voucher.chequeNo || '',
      chequeDate: voucher.chequeDate ? voucher.chequeDate.split('T')[0] : '',
      narration: voucher.narration || '',
      remarks: voucher.remarks || '',
    });
    setEntries(voucher.entries || []);
    setIsDialogOpen(true);
  };

  const addEntry = () => {
    if (!currentEntry.particulars) {
      toast({
        title: "Error",
        description: "Please enter particulars",
        variant: "destructive",
      });
      return;
    }

    const newEntry: VoucherEntry = {
      particulars: currentEntry.particulars,
      debit: currentEntry.type === 'debit' ? currentEntry.amount : 0,
      credit: currentEntry.type === 'credit' ? currentEntry.amount : 0,
    };

    setEntries([...entries, newEntry]);
    setCurrentEntry({
      particulars: '',
      debit: 0,
      credit: 0,
      type: 'debit',
      amount: 0,
    });
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const clearEntry = () => {
    setCurrentEntry({
      particulars: '',
      debit: 0,
      credit: 0,
      type: 'debit',
      amount: 0,
    });
  };

  const calculateTotals = () => {
    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced) {
      toast({
        title: "Error",
        description: "Debit and Credit totals must be equal and greater than zero",
        variant: "destructive",
      });
      return;
    }

    const voucherData = {
      ...formData,
      entries,
      totalDebit: totalDebit.toString(),
      totalCredit: totalCredit.toString(),
    };

    if (selectedVoucher) {
      updateMutation.mutate({ id: selectedVoucher.id, updates: voucherData });
    } else {
      createMutation.mutate(voucherData);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getVoucherTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'payment':
        return 'destructive';
      case 'receipt':
        return 'default';
      case 'journal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const voucherColumns = [
    {
      header: 'Voucher Details',
      accessorKey: 'voucherDetails',
      cell: (row: Voucher) => (
        <div className="flex items-center space-x-3">
          <Receipt className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium font-mono">{row.voucherNo}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(row.voucherDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'voucherType',
      cell: (row: Voucher) => (
        <Badge variant={getVoucherTypeBadgeVariant(row.voucherType)}>
          {row.voucherType.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'totalDebit',
      cell: (row: Voucher) => (
        <span className="font-mono text-sm">
          {formatCurrency(row.totalDebit)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (row: Voucher) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Cancelled'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: Voucher) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            data-testid={`button-edit-voucher-${row.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            data-testid={`button-print-voucher-${row.id}`}
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate(row.id)}
            data-testid={`button-delete-voucher-${row.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const entryColumns = [
    {
      header: 'Particulars',
      accessorKey: 'particulars',
      cell: (row: VoucherEntry) => (
        <span className="text-sm">{row.particulars}</span>
      ),
    },
    {
      header: 'Debit',
      accessorKey: 'debit',
      cell: (row: VoucherEntry) => (
        <span className="font-mono text-sm text-right">
          {row.debit > 0 ? formatCurrency(row.debit) : '-'}
        </span>
      ),
    },
    {
      header: 'Credit',
      accessorKey: 'credit',
      cell: (row: VoucherEntry) => (
        <span className="font-mono text-sm text-right">
          {row.credit > 0 ? formatCurrency(row.credit) : '-'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (row: VoucherEntry, index?: number) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => removeEntry(index)}
          data-testid={`button-remove-entry-${index}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (!hasRole(['super_admin', 'society_admin'])) {
    return (
      <MainLayout title="Voucher Management" subtitle="Access Denied">
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
      title="Voucher Management" 
      subtitle="Create and manage financial vouchers"
    >
      <div className="p-6 space-y-6">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vouchers</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} data-testid="button-create-voucher">
                  <Plus className="w-4 h-4 mr-2" />
                  New Voucher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedVoucher ? 'Edit Voucher' : 'Create New Voucher'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Voucher Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="voucherType">Voucher Type *</Label>
                      <Select
                        value={formData.voucherType}
                        onValueChange={(value) => setFormData({ ...formData, voucherType: value })}
                      >
                        <SelectTrigger data-testid="select-voucher-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {VOUCHER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="voucherNo">Voucher No.</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="voucherNo"
                          value={formData.voucherNo}
                          onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })}
                          placeholder="Auto-generated"
                          readOnly
                          data-testid="input-voucher-no"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          data-testid="button-search-voucher"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="voucherDate">Date *</Label>
                      <Input
                        id="voucherDate"
                        type="date"
                        value={formData.voucherDate}
                        onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })}
                        required
                        data-testid="input-voucher-date"
                      />
                    </div>
                  </div>

                  {/* Entries Table */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Voucher Entries</h4>
                    <div className="data-table rounded-md overflow-hidden">
                      <DataTable
                        data={entries}
                        columns={entryColumns}
                        isLoading={false}
                        emptyMessage="No entries added yet"
                      />
                      {/* Totals Row */}
                      {entries.length > 0 && (
                        <div className="bg-muted/50 px-4 py-3 border-t">
                          <div className="grid grid-cols-4 gap-4 text-sm font-semibold">
                            <div>Totals</div>
                            <div className="text-right font-mono">
                              {formatCurrency(totalDebit)}
                            </div>
                            <div className="text-right font-mono">
                              {formatCurrency(totalCredit)}
                            </div>
                            <div className="text-center">
                              <Badge variant={isBalanced ? 'default' : 'destructive'}>
                                {isBalanced ? 'Balanced' : 'Unbalanced'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Entry Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Add Entry</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entryType">Db/Cr</Label>
                          <Select
                            value={currentEntry.type}
                            onValueChange={(value) => setCurrentEntry({ ...currentEntry, type: value as 'debit' | 'credit' })}
                          >
                            <SelectTrigger data-testid="select-entry-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debit">Debit</SelectItem>
                              <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={currentEntry.amount}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, amount: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            data-testid="input-entry-amount"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="particulars">Particulars</Label>
                        <Input
                          id="particulars"
                          value={currentEntry.particulars}
                          onChange={(e) => setCurrentEntry({ ...currentEntry, particulars: e.target.value })}
                          placeholder="Account name"
                          data-testid="input-entry-particulars"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={addEntry}
                          data-testid="button-add-entry"
                        >
                          Add Entry
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearEntry}
                          data-testid="button-clear-entry"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Additional Details</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="chequeNo">Cheque No.</Label>
                            <Input
                              id="chequeNo"
                              value={formData.chequeNo}
                              onChange={(e) => setFormData({ ...formData, chequeNo: e.target.value })}
                              placeholder="Cheque number"
                              data-testid="input-cheque-no"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="chequeDate">Cheque Date</Label>
                            <Input
                              id="chequeDate"
                              type="date"
                              value={formData.chequeDate}
                              onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                              data-testid="input-cheque-date"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="narration">Narration</Label>
                          <Textarea
                            id="narration"
                            value={formData.narration}
                            onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                            placeholder="Transaction description..."
                            rows={3}
                            data-testid="input-narration"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            placeholder="Additional remarks..."
                            rows={2}
                            data-testid="input-remarks"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isBalanced || createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-voucher"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? 'Saving...'
                        : selectedVoucher
                        ? 'Update Voucher'
                        : 'Save Voucher'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
              data={vouchers || []}
              columns={voucherColumns}
              isLoading={isLoading}
              emptyMessage="No vouchers found"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
