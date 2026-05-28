import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideEye,
  LucideFileDown,
  LucideCreditCard,
  LucideBadgeCheck,
  LucideBadgeAlert,
} from '@lucide/angular';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'component-dashboard-billing-table',
  imports: [
    CommonModule,
    RouterLink,
    LucideEye,
    LucideFileDown,
    LucideCreditCard,
    LucideBadgeCheck,
    LucideBadgeAlert,
  ],
  templateUrl: './table.html',
})
export class ComponentDashboardBillingTable {
  @Input() billings: BillingResponseDTO[] = [];
  @Input() isLoading = false;

  @Output() downloadPdf = new EventEmitter<BillingResponseDTO>();
  @Output() pay = new EventEmitter<BillingResponseDTO>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'OVERDUE':
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
      case 'PAID':
        return 'Pagado';
      case 'OVERDUE':
        return 'Vencido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getPeriodLabel(month: number, year: number): string {
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${months[month - 1] || month} ${year}`;
  }

  onDownloadPdf(bill: BillingResponseDTO): void {
    this.downloadPdf.emit(bill);
  }

  onPay(bill: BillingResponseDTO): void {
    this.pay.emit(bill);
  }
}
