import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { ComponentSharedImport } from "@components/shared/import/import";
import { CustomerService } from '@services/customers/customer.service';
import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { ComponentDashboardCustomersTable } from '../table/table';
import { ComponentDashboardCustomersEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-customers-list',
  imports: [
    CommonModule,
    ComponentDashboardCustomersTable,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardCustomersEmpty,
],
  templateUrl: './list.html',
})
export class ComponentDashboardCustomersList {

  private customerService = inject(CustomerService);

  customers: CustomerResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  isLoading = false;


  ngOnInit(): void {
    this.loadCustomers();
  }


  loadCustomers(page: number = 0): void {
    this.isLoading = true;

    this.customerService.search(page, this.pageSize, this.searchQuery).subscribe({
      next: (res: any) => {
        this.customers = res.data.content;
        this.totalPages = res.data.totalPages;
        this.totalElements = res.data.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[ComponentCustomersList] Error loading clientes', err.message);
        this.isLoading = false;
      }
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

}
