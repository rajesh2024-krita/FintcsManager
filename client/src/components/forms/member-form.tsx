import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const memberFormSchema = z.object({
  memNo: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  fatherHusbandName: z.string().optional(),
  officeAddress: z.string().optional(),
  city: z.string().optional(),
  phoneOffice: z.string().optional(),
  branch: z.string().optional(),
  phoneResidence: z.string().optional(),
  mobile: z.string().optional(),
  designation: z.string().optional(),
  residenceAddress: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dateOfJoiningSociety: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  dateOfJoiningOrg: z.string().optional(),
  dateOfRetirement: z.string().optional(),
  nominee: z.string().optional(),
  nomineeRelation: z.string().optional(),
  openingBalanceShare: z.number().min(0, 'Opening balance cannot be negative'),
  openingBalanceType: z.string().optional(),
  bankName: z.string().optional(),
  bankPayableAt: z.string().optional(),
  bankAccountNo: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  member?: any;
  onSubmit: (data: MemberFormData & { deductions: string[] }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DEDUCTION_TYPES = [
  { value: 'share', label: 'Share' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'g_loan_instalment', label: 'G Loan Instalment' },
  { value: 'e_loan_instalment', label: 'E Loan Instalment' },
];

const BALANCE_TYPES = [
  { value: 'cr', label: 'Cr' },
  { value: 'dr', label: 'Dr' },
  { value: 'cd', label: 'CD' },
];

const BRANCHES = [
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'pune', label: 'Pune' },
];

const BANKS = [
  { value: 'sbi', label: 'State Bank of India' },
  { value: 'hdfc', label: 'HDFC Bank' },
  { value: 'icici', label: 'ICICI Bank' },
  { value: 'axis', label: 'Axis Bank' },
  { value: 'pnb', label: 'Punjab National Bank' },
  { value: 'canara', label: 'Canara Bank' },
];

export function MemberForm({ member, onSubmit, onCancel, isLoading }: MemberFormProps) {
  const [selectedDeductions, setSelectedDeductions] = useState<string[]>([]);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      memNo: member?.memNo || '',
      name: member?.name || '',
      fatherHusbandName: member?.fatherHusbandName || '',
      officeAddress: member?.officeAddress || '',
      city: member?.city || '',
      phoneOffice: member?.phoneOffice || '',
      branch: member?.branch || '',
      phoneResidence: member?.phoneResidence || '',
      mobile: member?.mobile || '',
      designation: member?.designation || '',
      residenceAddress: member?.residenceAddress || '',
      dateOfBirth: member?.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      dateOfJoiningSociety: member?.dateOfJoiningSociety ? member.dateOfJoiningSociety.split('T')[0] : '',
      email: member?.email || '',
      dateOfJoiningOrg: member?.dateOfJoiningOrg ? member.dateOfJoiningOrg.split('T')[0] : '',
      dateOfRetirement: member?.dateOfRetirement ? member.dateOfRetirement.split('T')[0] : '',
      nominee: member?.nominee || '',
      nomineeRelation: member?.nomineeRelation || '',
      openingBalanceShare: member?.openingBalanceShare ? parseFloat(member.openingBalanceShare) : 0,
      openingBalanceType: member?.openingBalanceType || 'cr',
      bankName: member?.bankName || '',
      bankPayableAt: member?.bankPayableAt || '',
      bankAccountNo: member?.bankAccountNo || '',
      status: member?.status || 'active',
    },
  });

  useEffect(() => {
    if (member?.deductions) {
      setSelectedDeductions(member.deductions);
    }
  }, [member]);

  const handleSubmit = (data: MemberFormData) => {
    onSubmit({
      ...data,
      deductions: selectedDeductions,
    });
  };

  const handleDeductionChange = (deductionValue: string, checked: boolean) => {
    setSelectedDeductions(prev => 
      checked 
        ? [...prev, deductionValue]
        : prev.filter(d => d !== deductionValue)
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="contact">Contact Details</TabsTrigger>
          <TabsTrigger value="financial">Financial Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="form-section">
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memNo">Member No.</Label>
                <Input
                  {...form.register('memNo')}
                  placeholder="Auto-generated"
                  readOnly
                  className="bg-muted"
                  data-testid="input-mem-no"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  {...form.register('name')}
                  placeholder="Full name"
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
                <Input
                  {...form.register('fatherHusbandName')}
                  placeholder="Father or husband name"
                  data-testid="input-father-husband-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  {...form.register('designation')}
                  placeholder="Job designation"
                  data-testid="input-designation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  {...form.register('dateOfBirth')}
                  type="date"
                  data-testid="input-date-of-birth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfJoiningSociety">Date of Joining Society</Label>
                <Input
                  {...form.register('dateOfJoiningSociety')}
                  type="date"
                  data-testid="input-date-joining-society"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfJoiningOrg">Date of Joining Organization</Label>
                <Input
                  {...form.register('dateOfJoiningOrg')}
                  type="date"
                  data-testid="input-date-joining-org"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfRetirement">Date of Retirement</Label>
                <Input
                  {...form.register('dateOfRetirement')}
                  type="date"
                  data-testid="input-date-retirement"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="form-section">
            <CardHeader>
              <CardTitle className="text-base">Nominee Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nominee">Nominee</Label>
                <Input
                  {...form.register('nominee')}
                  placeholder="Nominee name"
                  data-testid="input-nominee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomineeRelation">Nominee Relation</Label>
                <Input
                  {...form.register('nomineeRelation')}
                  placeholder="Relationship with nominee"
                  data-testid="input-nominee-relation"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card className="form-section">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...form.register('email')}
                    type="email"
                    placeholder="email@example.com"
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    {...form.register('mobile')}
                    placeholder="Mobile number"
                    data-testid="input-mobile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneOffice">Phone (Office)</Label>
                  <Input
                    {...form.register('phoneOffice')}
                    placeholder="Office phone"
                    data-testid="input-phone-office"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneResidence">Phone (Residence)</Label>
                  <Input
                    {...form.register('phoneResidence')}
                    placeholder="Residence phone"
                    data-testid="input-phone-residence"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={form.watch('branch')}
                    onValueChange={(value) => form.setValue('branch', value)}
                  >
                    <SelectTrigger data-testid="select-branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch.value} value={branch.value}>
                          {branch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    {...form.register('city')}
                    placeholder="City"
                    data-testid="input-city"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Textarea
                    {...form.register('officeAddress')}
                    rows={3}
                    placeholder="Office address"
                    data-testid="input-office-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceAddress">Residence Address</Label>
                  <Textarea
                    {...form.register('residenceAddress')}
                    rows={3}
                    placeholder="Residence address"
                    data-testid="input-residence-address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card className="form-section">
            <CardHeader>
              <CardTitle className="text-base">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingBalanceShare">Opening Balance (Share) *</Label>
                  <Input
                    {...form.register('openingBalanceShare', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    data-testid="input-opening-balance"
                  />
                  {form.formState.errors.openingBalanceShare && (
                    <p className="text-sm text-destructive">{form.formState.errors.openingBalanceShare.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingBalanceType">Balance Type</Label>
                  <Select
                    value={form.watch('openingBalanceType')}
                    onValueChange={(value) => form.setValue('openingBalanceType', value)}
                  >
                    <SelectTrigger data-testid="select-balance-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BALANCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) => form.setValue('status', value as 'active' | 'inactive')}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Deductions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DEDUCTION_TYPES.map((deduction) => (
                    <div key={deduction.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={deduction.value}
                        checked={selectedDeductions.includes(deduction.value)}
                        onCheckedChange={(checked) => 
                          handleDeductionChange(deduction.value, checked as boolean)
                        }
                        data-testid={`checkbox-deduction-${deduction.value}`}
                      />
                      <Label 
                        htmlFor={deduction.value} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {deduction.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="form-section">
            <CardHeader>
              <CardTitle className="text-base">Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select
                  value={form.watch('bankName')}
                  onValueChange={(value) => form.setValue('bankName', value)}
                >
                  <SelectTrigger data-testid="select-bank-name">
                    <SelectValue placeholder="Select bank" />
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
                <Label htmlFor="bankPayableAt">Payable At</Label>
                <Input
                  {...form.register('bankPayableAt')}
                  placeholder="Branch location"
                  data-testid="input-bank-payable-at"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNo">Account No.</Label>
                <Input
                  {...form.register('bankAccountNo')}
                  placeholder="Account number"
                  data-testid="input-bank-account-no"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="form-section">
            <CardHeader>
              <CardTitle className="text-base">Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Photo Upload</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                        <span className="text-muted-foreground">📷</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to upload member photo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG (Max 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Signature Upload</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-muted rounded-lg mx-auto flex items-center justify-center">
                        <span className="text-muted-foreground">✍️</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to upload signature
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG (Max 1MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">Document Guidelines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Photo should be passport size with clear visibility</li>
                  <li>Signature should be on white background</li>
                  <li>Both documents are required for member activation</li>
                  <li>Files will be validated before upload</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="button-save-member"
        >
          {isLoading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
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
