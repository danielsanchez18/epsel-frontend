import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { LucideHistory } from '@lucide/angular';

import { SupplyService } from '@services/supplies/supply.service';
import { SuppliesOperationsService } from '@services/supplies-operations/supplies-operations.service';
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';
import {
  SupplyOperationResponseDTO,
  SupplyOperationType,
} from '@interfaces/supplies-operations/supplies-operations.interface';

@Component({
  selector: 'page-dashboard-properties-details-history',
  imports: [
    CommonModule,
    RouterLink,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    LucideHistory,
  ],
  templateUrl: './history.html',
})
export class PageDashboardPropertiesDetailsHistory implements OnInit {
  private supplyService = inject(SupplyService);
  private operationsService = inject(SuppliesOperationsService);
  private parent = inject(PageDashboardPropertiesDetailsGeneral);
  private route = inject(ActivatedRoute);

  propertyId: string | null = null;
  operations: SupplyOperationResponseDTO[] = [];
  filteredOperations: SupplyOperationResponseDTO[] = [];
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
      this.loadOperations();
    } else {
      this.isLoading = false;
    }
  }

  loadOperations(page: number = 0): void {
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
          const opRequests = supplyIds.map((id) =>
            (this.operationsService.search as Function)(page, this.pageSize, id)
              .pipe(
                catchError(() =>
                  of({
                    success: true,
                    data: { content: [], totalPages: 0, totalElements: 0 },
                  }),
                ),
              ),
          );

          forkJoin(opRequests).subscribe({
            next: (results) => {
              const allOps: SupplyOperationResponseDTO[] = [];
              let combinedTotal = 0;
              let maxPages = 0;

              results.forEach((res: any) => {
                if (res && res.success && res.data) {
                  if (res.data.content) {
                    allOps.push(...res.data.content);
                  }
                  combinedTotal += res.data.totalElements || 0;
                  maxPages = Math.max(maxPages, res.data.totalPages || 0);
                }
              });

              this.operations = allOps.sort(
                (a, b) =>
                  new Date(b.operationDate).getTime() -
                  new Date(a.operationDate).getTime(),
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
    this.operations = [];
    this.filteredOperations = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadOperations(page);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOperations = [...this.operations];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredOperations = this.operations.filter(
        (op) =>
          op.supplyNumber.toLowerCase().includes(q) ||
          this.getTypeLabel(op.operationType).toLowerCase().includes(q) ||
          (op.reason && op.reason.toLowerCase().includes(q)) ||
          op.performedBy.toLowerCase().includes(q),
      );
    }
  }

  getTypeLabel(type?: SupplyOperationType): string {
    switch (type) {
      case 'INSTALLATION':
        return 'Instalación';
      case 'SUSPENSION':
        return 'Suspensión';
      case 'CUT_OFF':
        return 'Corte';
      case 'RECONNECTION':
        return 'Reconexión';
      case 'METER_CHANGE':
        return 'Cambio de medidor';
      case 'OWNER_CHANGE':
        return 'Cambio de titular';
      case 'STATUS_CHANGE':
        return 'Cambio de estado';
      default:
        return type || '-';
    }
  }

  getTypeClass(type?: SupplyOperationType): string {
    switch (type) {
      case 'INSTALLATION':
        return 'text-green-700 bg-green-100';
      case 'SUSPENSION':
        return 'text-yellow-700 bg-yellow-100';
      case 'CUT_OFF':
        return 'text-red-700 bg-red-100';
      case 'RECONNECTION':
        return 'text-blue-700 bg-blue-100';
      case 'METER_CHANGE':
        return 'text-cyan-700 bg-cyan-100';
      case 'OWNER_CHANGE':
        return 'text-purple-700 bg-purple-100';
      case 'STATUS_CHANGE':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  }
}
