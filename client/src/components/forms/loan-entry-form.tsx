import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';

const loanFormSchema = z.object({
  loanType: z.string().min(1, 'Loan type is required'),
  loanNo: z.string().optional(),
  loanDate: z.string().min(1, 'Loan date is required'),
  edpNo: z.string().min(1, 'EDP number is required'),
  memberName: z.string().min(1, 'Member name is required'),
  loanAmount: z.number().min(1, 'Loan amount must be greater than 0'),
  previousLoan: z.number().min(0, 'Previous loan cannot be negative'),
  netLoan: z.number(),
  numberOfInstallments: z.number().min(1, 'Number of installments must be at least 1'),
  installmentAmount: z.number().min(0, 'Installment amount cannot be negative'),
  purpose: z.string().optional(),
  authorizedBy: z.string().optional(),
  paymentMode: z.enum(['cash', 'cheque', 'opening']),
  bankName: z.string().optional(),
  chequeNo: z.string().optional(),
  chequeDate: z.string().optional(),
  share: z.number().min(0).default(0),
  cd: z.number().min(0).default(0),
  lastSalary: z.number().min(0).default(0),
  mwf: z.number().min(0).default(0),
  payAmount: z.number().min(0).default(0),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

interface LoanEntryFormProps {
  loan?: any;
  onSubmit: (data: LoanFormData & { givenSection: any[]; takenSection: any[] }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface MemberEntry {
  memNo: string;
  name: string;
}

const LOAN_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'personal', label: 'Personal' },
  { value: 'housing', label: 'Housing' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'education', label: 'Education' },
  { value: 'others', label: 'Others' },
];

const BANKS = [
  { value: 'sbi', label: 'State Bank of India' },
  { value: 'hdfc', label: 'HDFC Bank' },
  { value: 'icici', label: 'ICICI Bank' },
  { value: 'axis', label: 'Axis Bank' },
  { value: 'pnb', label: 'Punjab National Bank' },
];

export function LoanEntryForm({ loan, onSubmit, onCancel, isLoading }: LoanEntryFormProps) {
  const [givenSection, setGivenSection] = useState<MemberEntry[]>([]);
  const [takenSection, setTakenSection] = useState<MemberEntry[]>([]);
  const [newGivenMember, setNewGivenMember] = useState({ memNo: '', name: '' });
  const [newTakenMember, setNewTakenMember] = useState({ memNo: '', name: '' });

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loanType: loan?.loanType || '',
      loanNo: loan?.loanNo || '',
      loanDate: loan?.loanDate ? loan.loanDate.split('T')[0] : new Date().toISOString().split('T')[0],
      edpNo: loan?.edpNo || '',
      memberName: loan?.memberName || '',
      loanAmount: loan?.loanAmount ? parseFloat(loan.loanAmount) : 0,
      previousLoan: loan?.previousLoan ? parseFloat(loan.previousLoan) : 0,
      netLoan: loan?.netLoan ? parseFloat(loan.netLoan) : 0,
      numberOfInstallments: loan?.numberOfInstallments || 1,
      installmentAmount: loan?.installmentAmount ? parseFloat(loan.installmentAmount) : 0,
      purpose: loan?.purpose || '',
      authorizedBy: loan?.authorizedBy || '',
      paymentMode: loan?.paymentMode || 'cash',
      bankName: loan?.bankName || '',
      chequeNo: loan?.chequeNo || '',
      chequeDate: loan?.chequeDate ? loan.chequeDate.split('T')[0] : '',
      share: loan?.share ? parseFloat(loan.share) : 0,
      cd: loan?.cd ? parseFloat(loan.cd) : 0,
      lastSalary: loan?.lastSalary ? parseFloat(loan.lastSalary) : 0,
      mwf: loan?.mwf ? parseFloat(loan.mwf) : 0,
      payAmount: loan?.payAmount ? parseFloat(loan.payAmount) : 0,
    },
  });

  const watchedLoanAmount = form.watch('loanAmount');
  const watchedPreviousLoan = form.watch('previousLoan');
  const watchedNetLoan = form.watch('netLoan');
  const watchedInstallments = form.watch('numberOfInstallments');
  const watchedPaymentMode = form.watch('paymentMode');

  // Auto-calculate net loan
  useEffect(() => {
    const netLoan = watchedLoanAmount - watchedPreviousLoan;
    form.setValue('netLoan', netLoan);
  }, [watchedLoanAmount, watchedPreviousLoan, form]);

  // Auto-calculate installment amount
  useEffect(() => {
    if (watchedNetLoan > 0 && watchedInstallments > 0) {
      const installmentAmount = watchedNetLoan / watchedInstallments;
      form.setValue('installmentAmount', installmentAmount);
    }
  }, [watchedNetLoan, watchedInstallments, form]);

  useEffect(() => {
    if (loan?.givenSection) {
      setGivenSection(loan.givenSection);
    }
    if (loan?.takenSection) {
      setTakenSection(loan.takenSection);
    }
  }, [loan]);

  const handleSubmit = (data: LoanFormData) => {
    onSubmit({
      ...data,
      givenSection,
      takenSection,
    });
  };

  const addToGivenSection = () => {
    if (newGivenMember.memNo && newGivenMember.name) {
      setGivenSection([...givenSection, newGivenMember]);
      setNewGivenMember({ memNo: '', name: '' });
    }
  };

  const addToTakenSection = () => {
    if (newTakenMember.memNo && newTakenMember.name) {
      setTakenSection([...takenSection, newTakenMember]);
      setNewTakenMember({ memNo: '', name: '' });
    }
  };

  const removeFromGivenSection = (index: number) => {
    setGivenSection(givenSection.filter((_, i) => i !== index));
  };

  const removeFromTakenSection = (index: number) => {
    setTakenSection(takenSection.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const isValid = form.formState.isValid && 
                   watchedNetLoan > 0 && 
                   watchedInstallments > 0;
    return isValid;
  };

  const clearForm = () => {
    form.reset();
    setGivenSection([]);
    setTakenSection([]);
    setNewGivenMember({ memNo: '', name: '' });
    setNewTakenMember({ memNo: '', name: '' });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Loan Entry Form</h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearForm}
            data-testid="button-clear-form"
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => validateForm()}
            data-testid="button-validate-form"
          >
            Validate
          </Button>
          <Button
            type="submit"
            disabled={!validateForm() || isLoading}
            data-testid="button-save-loan"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanType">Loan Type *</Label>
            <Select
              value={form.watch('loanType')}
              onValueChange={(value) => form.setValue('loanType', value)}
            >
              <SelectTrigger data-testid="select-loan-type">
                <SelectValue placeholder="Select Loan Type" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.loanType && (
              <p className="text-sm text-destructive">{form.formState.errors.loanType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanNo">Loan No.</Label>
            <div className="flex space-x-2">
              <Input
                {...form.register('loanNo')}
                placeholder="Auto-generated"
                readOnly
                className="bg-muted"
                data-testid="input-loan-no"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-testid="button-search-loan"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanDate">Loan Date *</Label>
            <Input
              {...form.register('loanDate')}
              type="date"
              data-testid="input-loan-date"
            />
            {form.formState.errors.loanDate && (
              <p className="text-sm text-destructive">{form.formState.errors.loanDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edpNo">EDP No. *</Label>
            <div className="flex space-x-2">
              <Input
                {...form.register('edpNo')}
                placeholder="Enter EDP No."
                data-testid="input-edp-no"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-testid="button-search-edp"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            {form.formState.errors.edpNo && (
              <p className="text-sm text-destructive">{form.formState.errors.edpNo.message}</p>
            )}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">Name *</Label>
            <Input
              {...form.register('memberName')}
              placeholder="Member Name"
              data-testid="input-member-name"
            />
            {form.formState.errors.memberName && (
              <p className="text-sm text-destructive">{form.formState.errors.memberName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount *</Label>
            <Input
              {...form.register('loanAmount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-loan-amount"
            />
            {form.formState.errors.loanAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.loanAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousLoan">Previous Loan</Label>
            <Input
              {...form.register('previousLoan', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-previous-loan"
            />
            {form.formState.errors.previousLoan && (
              <p className="text-sm text-destructive">{form.formState.errors.previousLoan.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="netLoan">Net Loan</Label>
            <Input
              {...form.register('netLoan', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Auto-calculated"
              readOnly
              className="bg-muted"
              data-testid="input-net-loan"
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numberOfInstallments">No. of Installments *</Label>
            <Input
              {...form.register('numberOfInstallments', { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="12"
              data-testid="input-installments"
            />
            {form.formState.errors.numberOfInstallments && (
              <p className="text-sm text-destructive">{form.formState.errors.numberOfInstallments.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="installmentAmount">Installment Amount</Label>
            <Input
              {...form.register('installmentAmount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Auto-calculated"
              readOnly
              className="bg-muted"
              data-testid="input-installment-amount"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Mode *</Label>
            <RadioGroup
              value={form.watch('paymentMode')}
              onValueChange={(value) => form.setValue('paymentMode', value as 'cash' | 'cheque' | 'opening')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cheque" id="cheque" />
                <Label htmlFor="cheque">Cheque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="opening" id="opening" />
                <Label htmlFor="opening">Opening</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              {...form.register('purpose')}
              rows={3}
              placeholder="Purpose of loan..."
              data-testid="input-purpose"
            />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {watchedPaymentMode === 'cheque' && (
        <Card className="form-section">
          <CardHeader>
            <CardTitle className="text-base">Cheque Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank</Label>
              <Select
                value={form.watch('bankName')}
                onValueChange={(value) => form.setValue('bankName', value)}
              >
                <SelectTrigger data-testid="select-bank">
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chequeNo">Cheque No.</Label>
              <Input
                {...form.register('chequeNo')}
                placeholder="Cheque number"
                data-testid="input-cheque-no"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chequeDate">Cheque Date</Label>
              <Input
                {...form.register('chequeDate')}
                type="date"
                data-testid="input-cheque-date"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Financial Fields */}
      <Card className="form-section">
        <CardHeader>
          <CardTitle className="text-base">Financial Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="share">Share</Label>
            <Input
              {...form.register('share', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-share"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cd">CD</Label>
            <Input
              {...form.register('cd', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-cd"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastSalary">Last Salary</Label>
            <Input
              {...form.register('lastSalary', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-last-salary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mwf">MWF</Label>
            <Input
              {...form.register('mwf', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-mwf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payAmount">Pay Amount</Label>
            <Input
              {...form.register('payAmount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              data-testid="input-pay-amount"
            />
          </div>
        </CardContent>
      </Card>

      {/* Given and Taken Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Given Section */}
        <Card className="form-section">
          <CardHeader>
            <CardTitle className="text-base">Given Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="data-table rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Mem No</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {givenSection.map((member, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-2 text-sm text-foreground font-mono">{member.memNo}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{member.name}</td>
                      <td className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromGivenSection(index)}
                          data-testid={`button-remove-given-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex space-x-2">
              <Input
                value={newGivenMember.memNo}
                onChange={(e) => setNewGivenMember({ ...newGivenMember, memNo: e.target.value })}
                placeholder="Member No."
                data-testid="input-given-mem-no"
              />
              <Input
                value={newGivenMember.name}
                onChange={(e) => setNewGivenMember({ ...newGivenMember, name: e.target.value })}
                placeholder="Name"
                data-testid="input-given-name"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addToGivenSection}
                data-testid="button-add-given"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Taken Section */}
        <Card className="form-section">
          <CardHeader>
            <CardTitle className="text-base">Taken Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="data-table rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Mem No</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {takenSection.map((member, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-2 text-sm text-foreground font-mono">{member.memNo}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{member.name}</td>
                      <td className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromTakenSection(index)}
                          data-testid={`button-remove-taken-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex space-x-2">
              <Input
                value={newTakenMember.memNo}
                onChange={(e) => setNewTakenMember({ ...newTakenMember, memNo: e.target.value })}
                placeholder="Member No."
                data-testid="input-taken-mem-no"
              />
              <Input
                value={newTakenMember.name}
                onChange={(e) => setNewTakenMember({ ...newTakenMember, name: e.target.value })}
                placeholder="Name"
                data-testid="input-taken-name"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addToTakenSection}
                data-testid="button-add-taken"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Close
        </Button>
        <Button
          type="submit"
          disabled={!validateForm() || isLoading}
          data-testid="button-submit-loan"
        >
          {isLoading ? 'Saving...' : loan ? 'Update Loan' : 'Save Loan'}
        </Button>
      </div>

      {/* Validation Status */}
      {form.formState.isSubmitted && !form.formState.isValid && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">Please fix the following errors:</p>
          <ul className="mt-2 text-sm text-destructive list-disc list-inside">
            {Object.entries(form.formState.errors).map(([key, error]) => (
              <li key={key}>{error?.message}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
