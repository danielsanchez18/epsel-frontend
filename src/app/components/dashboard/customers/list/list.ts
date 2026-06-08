import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { CustomerService } from '@services/customers/customer.service';
import { CustomerResponse, CustomerType } from '@interfaces/customers/customer.interface';
import { ComponentDashboardCustomersTable } from '../table/table';
import { ComponentDashboardCustomersEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-customers-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentDashboardCustomersTable,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardCustomersEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardCustomersList implements OnInit {
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);

  customers: CustomerResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  sort = 'createdAt,desc';
  isLoading = false;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      type: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(page: number = 0): void {
    this.isLoading = true;

    const typeFilter = this.filterForm.value.type || undefined;

    this.customerService
      .search(page, this.pageSize, this.sort, this.searchQuery || undefined, typeFilter as CustomerType)
      .subscribe({
        next: (res: any) => {
          this.customers = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            '[ComponentCustomersList] Error loading clientes',
            err.message,
          );
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadCustomers(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadCustomers(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      type: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadCustomers(0);
  }
}
