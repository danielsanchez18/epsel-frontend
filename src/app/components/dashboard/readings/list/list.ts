import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentDashboardReadingsEmpty } from '@components/dashboard/readings/empty/empty';
import { ComponentDashboardReadingsTable } from '../table/table';

import { MeterReadingService } from '@services/readings/meter-reading.service';
import {
  MeterReadingResponseDTO,
  ReadingStatus,
} from '@interfaces/readings/meter-reading.interface';

@Component({
  selector: 'component-dashboard-readings-list',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardReadingsTable,
    ComponentDashboardReadingsEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardReadingsList implements OnInit {
  private readingService = inject(MeterReadingService);

  readings: MeterReadingResponseDTO[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  selectedStatus?: ReadingStatus;
  selectedZoneId?: string;
  startDate?: string;
  endDate?: string;
  sort: string = 'updatedAt,asc';
  isLoading = false;

  ngOnInit(): void {
    this.loadReadings();
  }

  loadReadings(page: number = 0): void {
    this.isLoading = true;

    this.readingService
      .search(
        this.searchQuery.trim() || undefined,
        this.selectedZoneId,
        this.selectedStatus,
        this.startDate,
        this.endDate,
        page,
        this.pageSize,
        this.sort,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.readings = res.data.content ?? [];
            this.totalPages = res.data.totalPages ?? 0;
            this.totalElements = res.data.totalElements ?? 0;
            this.currentPage = page;
          } else {
            this.readings = [];
            this.totalPages = 0;
            this.totalElements = 0;
          }
          this.isLoading = false;
          console.log(this.readings);
        },
        error: () => {
          this.readings = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadReadings(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadReadings(0);
  }
}
