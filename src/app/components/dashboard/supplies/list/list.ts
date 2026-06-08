import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentDashboardSuppliesEmpty } from '@components/dashboard/supplies/empty/empty';

import { SupplyService } from '@core/services/supplies/supply.service';
import {
  SupplyResponseDTO,
  SupplyStatus,
} from '@core/interfaces/supplies/supply.interface';
import { ServiceZoneService } from '@core/services/settings/service-zone.service';
import { ComponentDashboardSuppliesTable } from '../table/table';
import { ServiceZoneResponse } from '@interfaces/settings/settings.interface';

@Component({
  selector: 'component-dashboard-supplies-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardSuppliesTable,
    ComponentDashboardSuppliesEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardSuppliesList implements OnInit {
  private supplyService = inject(SupplyService);
  private zoneService = inject(ServiceZoneService);
  private fb = inject(FormBuilder);

  supplies: SupplyResponseDTO[] = [];
  zones: ServiceZoneResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  isLoading = false;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      zoneId: [''],
    });
  }

  ngOnInit(): void {
    this.loadZones();
    this.loadSupplies();
  }

  loadZones(): void {
    this.zoneService.getAll(0, 100).subscribe({
      next: (res: any) => {
        this.zones = res.data.content;
      },
    });
  }

  loadSupplies(page: number = 0): void {
    this.isLoading = true;

    const statusFilter = this.filterForm.value.status || undefined;
    const zoneIdFilter = this.filterForm.value.zoneId || undefined;

    this.supplyService
      .findAll(
        page,
        this.pageSize,
        this.searchQuery.trim() || undefined,
        statusFilter as SupplyStatus,
        zoneIdFilter,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.supplies = res.data.content ?? [];
            this.totalPages = res.data.totalPages ?? 0;
            this.totalElements = res.data.totalElements ?? 0;
            this.currentPage = page;
          } else {
            this.supplies = [];
            this.totalPages = 0;
            this.totalElements = 0;
          }
          this.isLoading = false;
        },
        error: () => {
          this.supplies = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadSupplies(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadSupplies(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach((key) => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadSupplies(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      zoneId: '',
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadSupplies(0);
  }
}
