import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentDashboardApplicationsTable } from '../table/table';
import { ComponentDashboardApplicationsEmpty } from '../empty/empty';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { InstallationRequestService } from '@services/supplies/installation-request.service';
import { InstallationRequestResponse, InstallationRequestStatus } from '@interfaces/supplies/installation-request.interface';

@Component({
  selector: 'component-dashboard-applications-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  private fb = inject(FormBuilder);

  requests: InstallationRequestResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  sort = 'createdAt,desc';
  searchQuery = '';
  isLoading = false;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      zoneName: ['']
    });
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(page: number = 0): void {
    this.isLoading = true;

    const statusFilter = this.filterForm.value.status || undefined;
    const zoneNameFilter = this.filterForm.value.zoneName || undefined;

    this.requestService
      .findAll(page, this.pageSize, this.sort, this.searchQuery || undefined, statusFilter as InstallationRequestStatus, zoneNameFilter)
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

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadRequests(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      zoneName: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadRequests(0);
  }
}
