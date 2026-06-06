import { Component, inject, OnInit } from '@angular/core';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentDashboardApplicationsTable } from '../table/table';
import { ComponentDashboardApplicationsEmpty } from '../empty/empty';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { CommonModule } from '@angular/common';
import { InstallationRequestService } from '@services/supplies/installation-request.service';
import { InstallationRequestResponse } from '@interfaces/supplies/installation-request.interface';

@Component({
  selector: 'component-dashboard-applications-list',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedImport,
    ComponentSharedFilters,
    ComponentDashboardApplicationsTable,
    ComponentDashboardApplicationsEmpty,
    ComponentSharedPaginator,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardApplicationsList implements OnInit {
  private requestService = inject(InstallationRequestService);

  requests: InstallationRequestResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  sort = 'createdAt,desc';
  searchQuery = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(page: number = 0): void {
    this.isLoading = true;
    this.requestService
      .findAll(page, this.pageSize, this.sort, this.searchQuery)
      .subscribe({
        next: (res: any) => {
          this.requests = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.currentPage = page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            '[ComponentDashboardApplicationsList] Error loading requests',
            err?.message || err,
          );
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadRequests(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadRequests(0);
  }
}
