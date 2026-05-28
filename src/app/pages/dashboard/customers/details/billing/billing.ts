import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import {
  LucideBadgeCheck,
  LucidePrinter,
  LucideBadgeAlert,
  LucideFileText,
  LucideInfo,
} from '@lucide/angular';

import { SupplyService } from '@core/services/supplies/supply.service';
import { BillingService } from '@core/services/billings/billing.service';
import { PageDashboardCustomersDetailsGeneral } from '../general/general';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'page-dashboard-customers-details-billing',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedPaginator,
    LucideBadgeCheck,
    LucidePrinter,
    LucideBadgeAlert,
    LucideFileText,
    LucideInfo,
    RouterLink,
  ],
  templateUrl: './billing.html',
})
export class PageDashboardCustomersDetailsBilling implements OnInit, OnDestroy {
  private supplyService = inject(SupplyService);
  private billingService = inject(BillingService);
  private parent = inject(PageDashboardCustomersDetailsGeneral);
  private route = inject(ActivatedRoute);

  customerId: string | null = null;
  billings: BillingResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  private parentSub?: Subscription;

  ngOnInit(): void {
    this.customerId =
      this.parent.customerId ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null;

    if (this.customerId) {
      this.loadBillings();
    }
  }

  ngOnDestroy(): void {
    this.parentSub?.unsubscribe();
  }

  loadBillings(page: number = 0): void {
    if (!this.customerId) return;

    this.isLoading = true;
    this.supplyService.getByCustomerId(this.customerId, 0, 100).subscribe({
      next: (suppliesRes) => {
        if (
          suppliesRes.success &&
          suppliesRes.data &&
          suppliesRes.data.content &&
          suppliesRes.data.content.length > 0
        ) {
          const supplyIds = suppliesRes.data.content.map((s) => s.id);
          const billingRequests = supplyIds.map((id) =>
            this.billingService.getBySupply(id, page, this.pageSize).pipe(
              catchError(() =>
                of({
                  success: true,
                  data: { content: [], totalPages: 0, totalElements: 0 },
                }),
              ),
            ),
          );

          forkJoin(billingRequests).subscribe({
            next: (results) => {
              const allBillings: BillingResponseDTO[] = [];
              let combinedTotalElements = 0;
              let maxTotalPages = 0;

              results.forEach((res: any) => {
                if (res && res.success && res.data) {
                  if (res.data.content) {
                    allBillings.push(...res.data.content);
                  }
                  combinedTotalElements += res.data.totalElements || 0;
                  maxTotalPages = Math.max(
                    maxTotalPages,
                    res.data.totalPages || 0,
                  );
                }
              });

              this.billings = allBillings.sort(
                (a, b) =>
                  new Date(b.billingDate).getTime() -
                  new Date(a.billingDate).getTime(),
              );
              this.totalElements = combinedTotalElements;
              this.totalPages = maxTotalPages;
              this.currentPage = page;
              this.isLoading = false;
            },
            error: () => {
              this.billings = [];
              this.isLoading = false;
            },
          });
        } else {
          this.billings = [];
          this.isLoading = false;
        }
      },
      error: () => {
        this.billings = [];
        this.isLoading = false;
      },
    });
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  onPageChange(page: number): void {
    this.loadBillings(page);
  }

  get filteredBillings(): BillingResponseDTO[] {
    if (!this.searchQuery) return this.billings;
    const q = this.searchQuery.toLowerCase();
    return this.billings.filter(
      (b) =>
        b.billingNumber.toLowerCase().includes(q) ||
        b.supplyNumber.toLowerCase().includes(q) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)),
    );
  }

  getStatusClass(status?: string): string {
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

  getStatusLabel(status?: string): string {
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
        return 'Pendiente';
    }
  }

  viewInvoice(bill: BillingResponseDTO): void {
    Swal.fire({
      title: `Factura: ${bill.billingNumber}`,
      html: `
        <div class="text-left space-y-2.5 p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm">
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Suministro:</span>
            <span class="font-semibold text-gray-900">${bill.supplyNumber}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Cliente:</span>
            <span class="font-semibold text-gray-900">${bill.customerName}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Consumo Facturado:</span>
            <span class="font-semibold text-blue-700">${bill.consumption} m³</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Cargo Fijo:</span>
            <span class="font-semibold text-gray-900">S/. ${bill.fixedCharge.toFixed(2)}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Tarifa de Agua:</span>
            <span class="font-semibold text-gray-900">S/. ${bill.unitPrice.toFixed(2)} / m³</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Subtotal:</span>
            <span class="font-semibold text-gray-900">S/. ${bill.subtotal.toFixed(2)}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">IGV (${bill.taxPercentage}%):</span>
            <span class="font-semibold text-gray-900">S/. ${bill.taxAmount.toFixed(2)}</span>
          </div>
          ${
            bill.lateFeeAmount > 0
              ? `
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-red-500">Mora por pago tardío:</span>
            <span class="font-semibold text-red-600">S/. ${bill.lateFeeAmount.toFixed(2)}</span>
          </div>
          `
              : ''
          }
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Total a pagar:</span>
            <span class="font-bold text-green-700 text-base">S/. ${bill.totalAmount.toFixed(2)}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Fecha de Emisión:</span>
            <span class="font-semibold text-gray-900">${new Date(bill.billingDate).toLocaleDateString('es-PE')}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-500">Vencimiento:</span>
            <span class="font-semibold text-red-600">${new Date(bill.dueDate).toLocaleDateString('es-PE')}</span>
          </div>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#2563eb',
    });
  }
}
