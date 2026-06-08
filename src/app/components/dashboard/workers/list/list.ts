import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardWorkersTable } from '../table/table';
import { UserService } from '@services/users/user.service';
import { UserResponse } from '@interfaces/users/user.interface';
import { ComponentDashboardWorkersEmpty } from '../empty/empty';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-workers-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentDashboardWorkersTable,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentSharedPaginator,
    ComponentDashboardWorkersEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardWorkersList implements OnInit {
  private userService = inject(UserService);
  private exportService = inject(ExportService);
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

  handleExport(options: ExportOptions): void {
    const filename = `trabajadores_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.users, options.format, filename);
    } else {
      // Export all records
      const formValues = this.filterForm.value;
      const activeFilters: any = {};
      Object.keys(formValues).forEach(key => {
        if (formValues[key]) activeFilters[key] = formValues[key];
      });

      const searchParams = { ...activeFilters };
      if (this.searchQuery.trim()) searchParams.search = this.searchQuery;
      
      this.userService.getAll(searchParams, 0, 10000, 'createdAt,desc')
        .subscribe({
          next: (res: any) => {
            this.doExport(res.data.content, options.format, filename);
          },
          error: (err) => {
            console.error('Error fetching all workers for export', err);
          }
        });
    }
  }

  private doExport(data: any[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(w => {
      return {
        'Documento': w.documentNumber || '',
        'Nombre Completo': `${w.name} ${w.lastName}`,
        'Email': w.email || '',
        'Teléfono': w.phone || '',
        'Rol': w.role?.name || '',
        'Estado': w.isActive ? 'Activo' : 'Inactivo',
        'Fecha Registro': w.createdAt ? new Date(w.createdAt).toLocaleDateString() : ''
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }
}
