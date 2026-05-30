import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideFileText,
  LucideEye,
  LucideBadgeCheck,
  LucideBadgeAlert,
  LucideBadgeDollarSign,
  LucideCircleX,
} from '@lucide/angular';
import { BillingService } from '@core/services/billings/billing.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';

@Component({
  selector: 'component-dashboard-supplies-details-billings',
  imports: [
    CommonModule,
    RouterLink,
    LucideFileText,
    LucideEye,
    LucideBadgeCheck,
    LucideBadgeAlert,
    LucideBadgeDollarSign,
    LucideCircleX,
    ComponentSharedPaginator,
  ],
  templateUrl: './billings.html',
})
export class ComponentDashboardSuppliesDetailsBillings implements OnInit {
  private billingService = inject(BillingService);

  @Input() supplyId!: string;

  billings: BillingResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (this.supplyId) {
      this.loadBillings();
    }
  }

  loadBillings(page: number = 0): void {
    this.isLoading = true;
    this.billingService.getBySupply(this.supplyId, page, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.billings = res.data.content ?? [];
          this.totalPages = res.data.totalPages ?? 0;
          this.totalElements = res.data.totalElements ?? 0;
          this.currentPage = page;
        } else {
          this.resetList();
        }
        this.isLoading = false;
      },
      error: () => {
        this.resetList();
        this.isLoading = false;
      },
    });
  }

  private resetList(): void {
    this.billings = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadBillings(page);
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

  getPendingAmount(bill: BillingResponseDTO): number {
    return Number(bill.totalAmount) - (Number(bill.amountPaid) || 0);
  }

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
}
