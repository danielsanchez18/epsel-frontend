import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardSuppliesEmpty } from '@components/dashboard/supplies/empty/empty';

import { SupplyService } from '@core/services/supplies/supply.service';
import {
  SupplyResponseDTO,
  SupplyStatus,
} from '@core/interfaces/supplies/supply.interface';
import { ServiceZoneService } from '@core/services/settings/service-zone.service';
import { ComponentDashboardSuppliesTable } from '../table/table';
import { ServiceZoneResponse } from '@interfaces/settings/settings.interface';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-supplies-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentSharedPaginator,
    ComponentDashboardSuppliesTable,
    ComponentDashboardSuppliesEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardSuppliesList implements OnInit {
  private supplyService = inject(SupplyService);
  private zoneService = inject(ServiceZoneService);
  private exportService = inject(ExportService);
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

  handleExport(options: ExportOptions): void {
    const filename = `suministros_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.supplies, options.format, filename);
    } else {
      // Export all records
      const statusFilter = this.filterForm.value.status || undefined;
      const zoneIdFilter = this.filterForm.value.zoneId || undefined;
      
      this.supplyService.findAll(0, 10000, this.searchQuery.trim() || undefined, statusFilter as SupplyStatus, zoneIdFilter)
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.doExport(res.data.content ?? [], options.format, filename);
            }
          },
          error: (err) => {
            console.error('Error fetching all supplies for export', err);
          }
        });
    }
  }

  private doExport(data: any[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(s => {
      let estado = s.status;
      if (estado === 'ACTIVE') estado = 'Activo';
      else if (estado === 'INACTIVE') estado = 'Inactivo';
      else if (estado === 'SUSPENDED') estado = 'Suspendido';
      else if (estado === 'CUT') estado = 'Cortado';

      return {
        'Código Suministro': s.supplyCode || '',
        'Cliente': s.customerName || '',
        'Documento Cliente': s.customerDocumentNumber || '',
        'Predio': s.propertyCode || '',
        'Zona': s.zoneName || '',
        'Estado': estado,
        'Tarifa Base': s.baseTariff || 0,
        'Fecha Alta': s.connectionDate ? new Date(s.connectionDate).toLocaleDateString() : '',
        'Última Lectura': s.lastReading || '-'
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }
}
