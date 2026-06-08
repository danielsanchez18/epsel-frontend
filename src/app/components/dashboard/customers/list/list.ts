import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { CustomerService } from '@services/customers/customer.service';
import { CustomerResponse, CustomerType } from '@interfaces/customers/customer.interface';
import { ComponentDashboardCustomersTable } from '../table/table';
import { ComponentDashboardCustomersEmpty } from '../empty/empty';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-customers-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentDashboardCustomersTable,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentSharedPaginator,
    ComponentDashboardCustomersEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardCustomersList implements OnInit {
  private customerService = inject(CustomerService);
  private exportService = inject(ExportService);
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

  handleExport(options: ExportOptions): void {
    const filename = `clientes_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.customers, options.format, filename);
    } else {
      // Export all records
      const typeFilter = this.filterForm.value.type || undefined;
      
      this.customerService.search(0, 10000, this.sort, this.searchQuery || undefined, typeFilter as CustomerType)
        .subscribe({
          next: (res: any) => {
            this.doExport(res.data.content, options.format, filename);
          },
          error: (err) => {
            console.error('Error fetching all customers for export', err);
          }
        });
    }
  }

  private doExport(data: any[], format: 'CSV' | 'EXCEL', filename: string): void {
    // Transform data for export to make it cleaner
    const exportData = data.map(c => ({
      'Tipo de Cliente': c.type === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica',
      'Documento': c.documentNumber || '',
      'Nombre': c.name || '',
      'Razón Social': c.businessName || '',
      'Email': c.email || '',
      'Teléfono': c.phone || '',
      'Dirección': c.address || '',
      'Estado': c.isActive ? 'Activo' : 'Inactivo',
      'Fecha Creación': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
    }));

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }
}
