import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { LucideClipboardList } from '@lucide/angular';

import { SupplyService } from '@services/supplies/supply.service';
import { SupplyWorkOrdersService } from '@services/supply-work-orders/supply-work-orders.service';
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';
import {
  SupplyWorkOrderResponseDTO,
  WorkOrderStatus,
  WorkOrderType,
} from '@interfaces/supply-work-orders/supply-work-orders.interface';

@Component({
  selector: 'page-dashboard-properties-details-work-orders',
  imports: [
    CommonModule,
    RouterLink,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    LucideClipboardList,
  ],
  templateUrl: './work-orders.html',
})
export class PageDashboardPropertiesDetailsWorkOrders implements OnInit {
  private supplyService = inject(SupplyService);
  private workOrderService = inject(SupplyWorkOrdersService);
  private parent = inject(PageDashboardPropertiesDetailsGeneral);
  private route = inject(ActivatedRoute);

  propertyId: string | null = null;
  workOrders: SupplyWorkOrderResponseDTO[] = [];
  filteredWorkOrders: SupplyWorkOrderResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  searchQuery = '';

  ngOnInit(): void {
    this.propertyId =
      this.parent.propertyId ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null;
    if (this.propertyId) {
      this.loadWorkOrders();
    } else {
      this.isLoading = false;
    }
  }

  loadWorkOrders(page: number = 0): void {
    if (!this.propertyId) return;
    this.isLoading = true;

    this.supplyService.getByPropertyId(this.propertyId, 0, 100).subscribe({
      next: (suppliesRes) => {
        if (
          suppliesRes.success &&
          suppliesRes.data &&
          suppliesRes.data.content &&
          suppliesRes.data.content.length > 0
        ) {
          const supplyIds = suppliesRes.data.content.map((s) => s.id);
          const woRequests = supplyIds.map((id) =>
            (this.workOrderService.search as Function)(page, this.pageSize, id)
              .pipe(
                catchError(() =>
                  of({
                    success: true,
                    data: { content: [], totalPages: 0, totalElements: 0 },
                  }),
                ),
              ),
          );

          forkJoin(woRequests).subscribe({
            next: (results) => {
              const allWOs: SupplyWorkOrderResponseDTO[] = [];
              let combinedTotal = 0;
              let maxPages = 0;

              results.forEach((res: any) => {
                if (res && res.success && res.data) {
                  if (res.data.content) {
                    allWOs.push(...res.data.content);
                  }
                  combinedTotal += res.data.totalElements || 0;
                  maxPages = Math.max(maxPages, res.data.totalPages || 0);
                }
              });

              this.workOrders = allWOs.sort(
                (a, b) =>
                  new Date(b.requestedDate).getTime() -
                  new Date(a.requestedDate).getTime(),
              );
              this.totalElements = combinedTotal;
              this.totalPages = maxPages;
              this.currentPage = page;
              this.applyFilter();
              this.isLoading = false;
            },
            error: () => {
              this.resetList();
              this.isLoading = false;
            },
          });
        } else {
          this.resetList();
          this.isLoading = false;
        }
      },
      error: () => {
        this.resetList();
        this.isLoading = false;
      },
    });
  }

  private resetList(): void {
    this.workOrders = [];
    this.filteredWorkOrders = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadWorkOrders(page);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredWorkOrders = [...this.workOrders];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredWorkOrders = this.workOrders.filter(
        (wo) =>
          wo.supplyNumber.toLowerCase().includes(q) ||
          this.getTypeLabel(wo.type).toLowerCase().includes(q) ||
          wo.reason.toLowerCase().includes(q) ||
          this.getStatusLabel(wo.status).toLowerCase().includes(q),
      );
    }
  }

  getTypeLabel(type?: WorkOrderType): string {
    switch (type) {
      case 'INSTALLATION':
        return 'Instalación';
      case 'SUSPENSION':
        return 'Suspensión';
      case 'CUT_OFF':
        return 'Corte';
      case 'RECONNECTION':
        return 'Reconexión';
      case 'INSPECTION':
        return 'Inspección';
      case 'METER_CHANGE':
        return 'Cambio de medidor';
      default:
        return type || '-';
    }
  }

  getStatusLabel(status?: WorkOrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'ASSIGNED':
        return 'Asignada';
      case 'IN_PROGRESS':
        return 'En progreso';
      case 'COMPLETED':
        return 'Completada';
      case 'FAILED':
        return 'Fallida';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status || '-';
    }
  }

  getStatusClass(status?: WorkOrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100';
      case 'ASSIGNED':
        return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS':
        return 'text-amber-600 bg-amber-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'CANCELLED':
        return 'text-black bg-gray-100';
      default:
        return 'text-black bg-gray-100';
    }
  }

  getTypeClass(type?: WorkOrderType): string {
    switch (type) {
      case 'INSTALLATION':
        return 'text-green-700 bg-green-100';
      case 'SUSPENSION':
        return 'text-yellow-700 bg-yellow-100';
      case 'CUT_OFF':
        return 'text-red-700 bg-red-100';
      case 'RECONNECTION':
        return 'text-blue-700 bg-blue-100';
      case 'INSPECTION':
        return 'text-purple-700 bg-purple-100';
      case 'METER_CHANGE':
        return 'text-cyan-700 bg-cyan-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  }
}
