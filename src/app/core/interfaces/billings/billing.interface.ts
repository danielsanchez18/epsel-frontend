export type BillingStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';

export interface BillingResponseDTO {
  id: string;
  billingNumber: string;
  supplyId: string;
  supplyNumber: string;
  readingId: string;
  customerName: string;
  propertyAddress: string;
  zoneName: string;
  billingMonth: number;
  billingYear: number;
  consumption: number;
  unitPrice: number;
  fixedCharge: number;
  taxPercentage: number;
  subtotal: number;
  taxAmount: number;
  lateFeeAmount: number;
  totalAmount: number;
  amountPaid: number;
  billingDate: string; // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
  status: BillingStatus;
  printed: boolean;
}

export interface BillingKpiDTO {
  pendingCount: number;
  overdueCount: number;
  paidCount: number;
  totalCollected: number;
  totalPending: number;
}
