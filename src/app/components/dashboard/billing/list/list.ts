import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { BillingService } from '@core/services/billings/billing.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentDashboardBillingTable } from '../table/table';
import { ComponentDashboardBillingEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-billing-list',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentDashboardBillingTable,
    ComponentDashboardBillingEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardBillingList implements OnInit {
  private billingService = inject(BillingService);

  billings: BillingResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';
  selectedStatus = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    let billingNumber: string | undefined;
    let customerName: string | undefined;
    let status: string | undefined;
    let overdue: boolean | undefined;

    if (this.searchQuery) {
      if (this.searchQuery.toUpperCase().startsWith('FAC')) {
        billingNumber = this.searchQuery;
      } else {
        customerName = this.searchQuery;
      }
    }

    if (this.selectedStatus) {
      if (this.selectedStatus === 'OVERDUE') {
        overdue = true;
      } else {
        status = this.selectedStatus;
      }
    }

    this.billingService.search(
      page,
      this.pageSize,
      billingNumber,
      customerName,
      status,
      undefined,
      undefined,
      overdue
    ).subscribe({
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
      }
    });
  }

  private resetList(): void {
    this.billings = [];
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

  onPageChange(page: number): void {
    this.loadData(page);
  }

  generatePDF(bill: BillingResponseDTO): void {
    Swal.fire({
      title: 'Generar PDF',
      text: `Esta función se implementará después. (Factura: ${bill.billingNumber})`,
      icon: 'info',
      confirmButtonColor: '#2563eb'
    });
  }

  registerPayment(bill: BillingResponseDTO): void {
    Swal.fire({
      title: 'Registrar Pago',
      text: `Esta función se implementará después. (Factura: ${bill.billingNumber})`,
      icon: 'info',
      confirmButtonColor: '#2563eb'
    });
  }
}
