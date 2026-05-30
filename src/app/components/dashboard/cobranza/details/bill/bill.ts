import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideFileText,
  LucideBadgeCheck,
  LucideBadgeAlert,
  LucideBadgeDollarSign,
  LucideCircleX,
} from '@lucide/angular';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'component-dashboard-cobranza-detail-bill',
  imports: [
    CommonModule,
    LucideFileText,
    LucideBadgeCheck,
    LucideBadgeAlert,
    LucideBadgeDollarSign,
    LucideCircleX,
  ],
  templateUrl: './bill.html',
})
export class ComponentDashboardCobranzaDetailBill {
  @Input() billing: BillingResponseDTO | null = null;

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PARTIALLY_PAID':
        return 'bg-blue-100 text-blue-700';
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
      case 'PARTIALLY_PAID':
        return 'Pago Parcial';
      case 'OVERDUE':
        return 'Vencido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getPeriodLabel(month?: number, year?: number): string {
    if (!month || !year) return '';
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

  getPendingAmount(): number {
    if (!this.billing) return 0;
    return Number(this.billing.totalAmount) - (Number(this.billing.amountPaid) || 0);
  }
}
