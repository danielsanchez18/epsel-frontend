import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardPropertiesTable } from '../table/table';
import { ComponentDashboardPropertiesEmpty } from '../empty/empty';
import { PropertyService } from '@services/properties/property.service';
import { PropertyResponse, PropertyType } from '@interfaces/properties/properties.interface';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-properties-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentSharedPaginator,
    ComponentDashboardPropertiesTable,
    ComponentDashboardPropertiesEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardPropertiesList implements OnInit {
  private propertyService = inject(PropertyService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);

  properties: PropertyResponse[] = [];
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
      type: ['']
    });
  }

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(page: number = 0): void {
    this.isLoading = true;

    const typeFilter = this.filterForm.value.type || undefined;

    this.propertyService
      .getAll(page, this.pageSize, this.sort, this.searchQuery || undefined, typeFilter)
      .subscribe({
        next: (res: any) => {
          this.properties = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            '[ComponentPropertiesList] Error loading properties',
            err.message,
          );
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProperties(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadProperties(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadProperties(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      type: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadProperties(0);
  }

  handleExport(options: ExportOptions): void {
    const filename = `predios_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.properties, options.format, filename);
    } else {
      // Export all records
      const typeFilter = this.filterForm.value.type || undefined;
      
      this.propertyService.getAll(0, 10000, this.sort, this.searchQuery || undefined, typeFilter)
        .subscribe({
          next: (res: any) => {
            this.doExport(res.data.content, options.format, filename);
          },
          error: (err) => {
            console.error('Error fetching all properties for export', err);
          }
        });
    }
  }

  private doExport(data: any[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(p => {
      let tipo = p.type;
      if (tipo === 'RESIDENTIAL') tipo = 'Residencial';
      else if (tipo === 'COMMERCIAL') tipo = 'Comercial';
      else if (tipo === 'INDUSTRIAL') tipo = 'Industrial';
      else if (tipo === 'STATE') tipo = 'Estatal';

      return {
        'Código de Predio': p.propertyCode || '',
        'Tipo': tipo,
        'Dirección': p.address || '',
        'Cliente': p.customer?.name || p.customer?.businessName || '',
        'Documento Cliente': p.customer?.documentNumber || '',
        'Estado': p.isActive ? 'Activo' : 'Inactivo',
        'Fecha Creación': p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }
}
