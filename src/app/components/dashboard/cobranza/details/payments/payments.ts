import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideHistory } from '@lucide/angular';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'component-dashboard-cobranza-detail-payments',
  imports: [CommonModule, LucideHistory],
  templateUrl: './payments.html',
})
export class ComponentDashboardCobranzaDetailPayments {
  @Input() payments: PaymentResponseDTO[] = [];
  @Input() billing: BillingResponseDTO | null = null;

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'CASH':
        return 'Efectivo';
      case 'CARD':
        return 'Tarjeta';
      case 'YAPE':
        return 'Yape';
      case 'PLIN':
        return 'Plin';
      case 'BANK_TRANSFER':
        return 'Transf. Bancaria';
      default:
        return method;
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'PENDING':
        return 'Pendiente';
      case 'FAILED':
        return 'Fallido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getDaysOverdueAtPayment(paymentDateStr: string): number {
    if (!this.billing) return 0;
    const due = new Date(this.billing.dueDate);
    const payDate = new Date(paymentDateStr);
    due.setHours(0, 0, 0, 0);
    payDate.setHours(0, 0, 0, 0);
    if (payDate <= due) {
      return 0;
    }
    const diffTime = Math.abs(payDate.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCobranzaLabel(paymentDateStr: string): string {
    const days = this.getDaysOverdueAtPayment(paymentDateStr);
    if (days > 0) {
      return 'Extrajudicial';
    }
    return 'Ordinaria';
  }
}
