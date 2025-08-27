export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'society_admin' | 'user' | 'member';
  name: string;
  email?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  totalSocieties: number;
  activeMembers: number;
  totalLoans: number;
  pendingApprovals: number;
}

export interface LoanFormData {
  loanType: string;
  loanNo?: string;
  loanDate: string;
  edpNo: string;
  memberName: string;
  loanAmount: number;
  previousLoan: number;
  netLoan: number;
  numberOfInstallments: number;
  installmentAmount: number;
  purpose: string;
  authorizedBy: string;
  paymentMode: 'cash' | 'cheque' | 'opening';
  bankName?: string;
  chequeNo?: string;
  chequeDate?: string;
  share: number;
  cd: number;
  lastSalary: number;
  mwf: number;
  payAmount: number;
  givenSection: Array<{ memNo: string; name: string }>;
  takenSection: Array<{ memNo: string; name: string }>;
  societyId?: string;
}

export interface MemberFormData {
  memNo?: string;
  name: string;
  fatherHusbandName?: string;
  officeAddress?: string;
  city?: string;
  phoneOffice?: string;
  branch?: string;
  phoneResidence?: string;
  mobile?: string;
  designation?: string;
  residenceAddress?: string;
  dateOfBirth?: string;
  dateOfJoiningSociety?: string;
  email?: string;
  dateOfJoiningOrg?: string;
  dateOfRetirement?: string;
  nominee?: string;
  nomineeRelation?: string;
  openingBalanceShare: number;
  openingBalanceType?: string;
  bankName?: string;
  bankPayableAt?: string;
  bankAccountNo?: string;
  status: 'active' | 'inactive';
  deductions: string[];
  societyId?: string;
}

export interface VoucherFormData {
  voucherType: 'payment' | 'receipt' | 'journal' | 'contra' | 'adjustment' | 'others';
  voucherNo?: string;
  voucherDate: string;
  entries: Array<{
    particulars: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  chequeNo?: string;
  chequeDate?: string;
  narration?: string;
  remarks?: string;
  societyId?: string;
}

export interface MonthlyDemandData {
  month: number;
  year: number;
  edpNo: string;
  memberName: string;
  loanAmount: number;
  cd: number;
  loan: number;
  interest: number;
  eLoan: number;
  eInterest: number;
  net: number;
  totalAmount: number;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  current: boolean;
  roles: string[];
}
