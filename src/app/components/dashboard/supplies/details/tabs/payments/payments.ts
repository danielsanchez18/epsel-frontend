import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCreditCard } from '@lucide/angular';
import { PaymentService } from '@core/services/payments/payment.service';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';

@Component({
  selector: 'component-dashboard-supplies-details-payments',
  imports: [
    CommonModule,
    LucideCreditCard,
    ComponentSharedPaginator,
  ],
  templateUrl: './payments.html',
})
export class ComponentDashboardSuppliesDetailsPayments implements OnInit {
  private paymentService = inject(PaymentService);

  @Input() supplyNumber!: string | null;

  payments: PaymentResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (this.supplyNumber) {
      this.loadPayments();
    } else {
      this.isLoading = false;
    }
  }

  loadPayments(page: number = 0): void {
    if (!this.supplyNumber) return;
    this.isLoading = true;
    this.paymentService.search(
      page,
      this.pageSize,
      undefined,
      undefined,
      this.supplyNumber
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.payments = res.data.content ?? [];
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
    this.payments = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadPayments(page);
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
}
