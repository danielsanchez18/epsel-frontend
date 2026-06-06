import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { LucideDroplets } from '@lucide/angular';

import { SupplyService } from '@services/supplies/supply.service';
import { MeterReadingService } from '@services/readings/meter-reading.service';
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';
import {
  MeterReadingResponseDTO,
  ReadingStatus,
} from '@interfaces/readings/meter-reading.interface';

@Component({
  selector: 'page-dashboard-properties-details-consumption',
  imports: [
    CommonModule,
    RouterLink,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    LucideDroplets,
  ],
  templateUrl: './consumption.html',
})
export class PageDashboardPropertiesDetailsConsumption implements OnInit {
  private supplyService = inject(SupplyService);
  private readingService = inject(MeterReadingService);
  private parent = inject(PageDashboardPropertiesDetailsGeneral);
  private route = inject(ActivatedRoute);

  propertyId: string | null = null;
  readings: MeterReadingResponseDTO[] = [];
  filteredReadings: MeterReadingResponseDTO[] = [];
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
      this.loadReadings();
    } else {
      this.isLoading = false;
    }
  }

  loadReadings(page: number = 0): void {
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
          const supplyNumbers = suppliesRes.data.content.map(
            (s) => s.supplyNumber,
          );
          const readingRequests = supplyNumbers.map((sn) =>
            (this.readingService.search as Function)(
              sn,
              undefined,
              undefined,
              undefined,
              undefined,
              page,
              this.pageSize,
            ).pipe(
              catchError(() =>
                of({
                  success: true,
                  data: { content: [], totalPages: 0, totalElements: 0 },
                }),
              ),
            ),
          );

          forkJoin(readingRequests).subscribe({
            next: (results) => {
              const allReadings: MeterReadingResponseDTO[] = [];
              let combinedTotalElements = 0;
              let maxTotalPages = 0;

              results.forEach((res: any) => {
                if (res && res.success && res.data) {
                  if (res.data.content) {
                    allReadings.push(...res.data.content);
                  }
                  combinedTotalElements += res.data.totalElements || 0;
                  maxTotalPages = Math.max(
                    maxTotalPages,
                    res.data.totalPages || 0,
                  );
                }
              });

              this.readings = allReadings.sort(
                (a, b) =>
                  new Date(b.readingDate).getTime() -
                  new Date(a.readingDate).getTime(),
              );
              this.totalElements = combinedTotalElements;
              this.totalPages = maxTotalPages;
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
    this.readings = [];
    this.filteredReadings = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadReadings(page);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredReadings = [...this.readings];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredReadings = this.readings.filter(
        (r) =>
          r.supplyNumber.toLowerCase().includes(q) ||
          (r.meterNumber && r.meterNumber.toLowerCase().includes(q)) ||
          this.getStatusLabel(r.status).toLowerCase().includes(q),
      );
    }
  }

  getStatusLabel(status?: ReadingStatus): string {
    switch (status) {
      case 'RECORDED':
        return 'Registrada';
      case 'VALIDATED':
        return 'Validada';
      case 'BILLED':
        return 'Facturada';
      case 'CANCELLED':
        return 'Anulada';
      default:
        return status || '-';
    }
  }

  getStatusClass(status?: ReadingStatus): string {
    switch (status) {
      case 'RECORDED':
        return 'text-blue-600 bg-blue-100';
      case 'VALIDATED':
        return 'text-green-600 bg-green-100';
      case 'BILLED':
        return 'text-purple-600 bg-purple-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-black bg-gray-100';
    }
  }
}
