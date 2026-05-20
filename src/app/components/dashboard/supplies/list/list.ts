import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentDashboardSuppliesEmpty } from '@components/dashboard/supplies/empty/empty';

import { SupplyService } from '@core/services/supplies/supply.service';
import { SupplyResponseDTO } from '@core/interfaces/supplies/supply.interface';
import { ComponentDashboardSuppliesTable } from '../table/table';

@Component({
  selector: 'component-dashboard-supplies-list',
  imports: [
    CommonModule,
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

  supplies: SupplyResponseDTO[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadSupplies();
  }

  loadSupplies(page: number = 0): void {
    this.isLoading = true;

    this.supplyService.findAll(page, this.pageSize, this.searchQuery.trim() || undefined).subscribe({
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
      }
    });
  }

  onPageChange(page: number): void {
    this.loadSupplies(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadSupplies(0);
  }
}
