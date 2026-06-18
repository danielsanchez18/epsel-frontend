export type PaymentMethod = 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface CreatePaymentDTO {
  billingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  operationNumber?: string;
  observations?: string;
  registeredBy: string; // UUID del usuario que registra el pago
}

export interface PaymentResponseDTO {
  id: string;
  receiptNumber: string;
  billingId: string;
  billingNumber: string;
  supplyId: string;
  supplyNumber: string;
  customerFullName: string;
  amount: number;
  billingTotalAmount: number;
  billingPendingAmount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string; // ISO 8601 LocalDateTime
  operationNumber?: string;
  observations?: string;
  registeredById?: string;
  registeredBy?: string;
}

export interface CancelPaymentDTO {
  reason: string;
}

export interface PaymentKpiDTO {
  totalToday: number;
  totalPeriod: number;
  totalCash: number;
  totalYape: number;
  totalTransfer: number;
}
