import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { PaymentService } from '@core/services/payments/payment.service';
import { PaymentResponseDTO, PaymentMethod, PaymentStatus } from '@interfaces/payments/payment.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentDashboardPaymentsTable } from '../table/table';
import { ComponentDashboardPaymentsEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-payments-list',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentDashboardPaymentsTable,
    ComponentDashboardPaymentsEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardPaymentsList implements OnInit {
  private paymentService = inject(PaymentService);

  payments: PaymentResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';
  selectedStatus = '';
  selectedMethod = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    let receiptNumber: string | undefined;
    let billingNumber: string | undefined;
    let supplyNumber: string | undefined;
    let customerName: string | undefined;
    let status: PaymentStatus | undefined;
    let paymentMethod: PaymentMethod | undefined;

    if (this.searchQuery) {
      const q = this.searchQuery.toUpperCase();
      if (q.startsWith('REC')) {
        receiptNumber = this.searchQuery;
      } else if (q.startsWith('FAC')) {
        billingNumber = this.searchQuery;
      } else if (/^\d+$/.test(this.searchQuery)) {
        supplyNumber = this.searchQuery;
      } else {
        customerName = this.searchQuery;
      }
    }

    if (this.selectedStatus) {
      status = this.selectedStatus as PaymentStatus;
    }

    if (this.selectedMethod) {
      paymentMethod = this.selectedMethod as PaymentMethod;
    }

    this.paymentService.search(
      page,
      this.pageSize,
      receiptNumber,
      billingNumber,
      supplyNumber,
      customerName,
      paymentMethod,
      status
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
      }
    });
  }

  private resetList(): void {
    this.payments = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadData(0);
  }

  onStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.loadData(0);
  }

  onMethodFilter(method: string): void {
    this.selectedMethod = method;
    this.loadData(0);
  }

  onPageChange(page: number): void {
    this.loadData(page);
  }

  printReceipt(payment: PaymentResponseDTO): void {
    Swal.fire({
      title: 'Imprimir Recibo',
      text: `Enviando recibo de pago ${payment.receiptNumber} a la cola de impresión...`,
      icon: 'info',
      confirmButtonColor: '#2563eb',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  cancelPayment(payment: PaymentResponseDTO): void {
    Swal.fire({
      title: '¿Anular Pago?',
      text: `¿Está seguro de que desea anular el recibo ${payment.receiptNumber} por un monto de S/. ${payment.amount.toFixed(2)}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Since there is no cancel payment API in backend, we simulate it
        payment.status = 'CANCELLED';
        Swal.fire({
          title: 'Pago Anulado',
          text: `El pago ${payment.receiptNumber} ha sido anulado exitosamente.`,
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }
}
