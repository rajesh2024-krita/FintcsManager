export function generateEDPNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `EDP${timestamp}`;
}

export function generateMemberNumber(lastNumber: number = 0): string {
  const nextNumber = lastNumber + 1;
  return `MEM_${nextNumber.toString().padStart(3, '0')}`;
}

export function generateLoanNumber(year: number = new Date().getFullYear()): string {
  const yearSuffix = year.toString().slice(-2);
  const timestamp = Date.now().toString().slice(-3);
  return `L${yearSuffix}${timestamp}`;
}

export function generateVoucherNumber(type: string, year: number = new Date().getFullYear()): string {
  const typePrefix = type.charAt(0).toUpperCase();
  const yearSuffix = year.toString().slice(-2);
  const timestamp = Date.now().toString().slice(-3);
  return `${typePrefix}${yearSuffix}${timestamp}`;
}

export function calculateNetLoan(loanAmount: number, previousLoan: number = 0): number {
  return loanAmount - previousLoan;
}

export function calculateInstallmentAmount(netLoan: number, numberOfInstallments: number): number {
  return numberOfInstallments > 0 ? netLoan / numberOfInstallments : 0;
}
