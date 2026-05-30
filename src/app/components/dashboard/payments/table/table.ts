import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideEye,
  LucidePrinter,
  LucideBan,
  LucideBadgeCheck,
  LucideBadgeAlert,
} from '@lucide/angular';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';

@Component({
  selector: 'component-dashboard-payments-table',
  imports: [
    CommonModule,
    RouterLink,
    LucideEye,
    LucidePrinter,
    LucideBan,
    LucideBadgeCheck,
    LucideBadgeAlert,
  ],
  templateUrl: './table.html',
})
export class ComponentDashboardPaymentsTable {
  @Input() payments: PaymentResponseDTO[] = [];
  @Input() isLoading = false;

  @Output() print = new EventEmitter<PaymentResponseDTO>();
  @Output() cancel = new EventEmitter<PaymentResponseDTO>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'COMPLETED':
        return 'Completado';
      case 'FAILED':
        return 'Fallido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

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

  onPrint(payment: PaymentResponseDTO): void {
    this.print.emit(payment);
  }

  onCancel(payment: PaymentResponseDTO): void {
    this.cancel.emit(payment);
  }
}
