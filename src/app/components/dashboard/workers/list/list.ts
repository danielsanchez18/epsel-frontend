import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentDashboardWorkersTable } from '../table/table';
import { UserService } from '@services/users/user.service';
import { UserResponse } from '@interfaces/users/user.interface';
import { ComponentDashboardWorkersEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-workers-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentDashboardWorkersTable,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardWorkersEmpty,
    ComponentDashboardWorkersTable,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardWorkersList implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users: UserResponse[] = [];
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
      role: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.isLoading = true;

    // Remove empty properties from the filter form
    const formValues = this.filterForm.value;
    const activeFilters: any = {};
    Object.keys(formValues).forEach(key => {
      if (formValues[key]) {
        activeFilters[key] = formValues[key];
      }
    });

    const searchParams = { ...activeFilters };
    if (this.searchQuery.trim()) {
      searchParams.search = this.searchQuery;
    }

    this.userService
      .getAll(
        searchParams,
        page,
        this.pageSize,
        'createdAt,desc',
      )
      .subscribe({
        next: (res: any) => {
          this.users = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            '[ComponentWorkersOverviewList] Error loading trabajadores',
            err.message,
          );
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadUsers(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadUsers(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      role: '',
      startDate: '',
      endDate: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadUsers(0);
  }
}
