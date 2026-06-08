import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardReadingsEmpty } from '@components/dashboard/readings/empty/empty';
import { ComponentDashboardReadingsTable } from '../table/table';

import { MeterReadingService } from '@services/readings/meter-reading.service';
import {
  MeterReadingResponseDTO,
  ReadingStatus,
} from '@interfaces/readings/meter-reading.interface';
import { ServiceZoneService } from '@core/services/settings/service-zone.service';
import { ServiceZoneResponse } from '@interfaces/settings/settings.interface';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-readings-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentSharedPaginator,
    ComponentDashboardReadingsTable,
    ComponentDashboardReadingsEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardReadingsList implements OnInit {
  private readingService = inject(MeterReadingService);
  private zoneService = inject(ServiceZoneService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);

  readings: MeterReadingResponseDTO[] = [];
  zones: ServiceZoneResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  sort: string = 'updatedAt,asc';
  isLoading = false;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      zoneId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadZones();
    this.loadReadings();
  }

  loadZones(): void {
    this.zoneService.getAll(0, 100).subscribe({
      next: (res: any) => {
        this.zones = res.data.content;
      },
    });
  }

  loadReadings(page: number = 0): void {
    this.isLoading = true;

    const values = this.filterForm.value;
    const selectedZoneId = values.zoneId || undefined;
    const selectedStatus = values.status || undefined;
    const startDate = values.startDate || undefined;
    const endDate = values.endDate || undefined;

    this.readingService
      .search(
        this.searchQuery.trim() || undefined,
        selectedZoneId,
        selectedStatus as ReadingStatus,
        startDate,
        endDate,
        page,
        this.pageSize,
        this.sort,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.readings = res.data.content ?? [];
            this.totalPages = res.data.totalPages ?? 0;
            this.totalElements = res.data.totalElements ?? 0;
            this.currentPage = page;
          } else {
            this.readings = [];
            this.totalPages = 0;
            this.totalElements = 0;
          }
          this.isLoading = false;
        },
        error: () => {
          this.readings = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadReadings(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadReadings(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadReadings(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      zoneId: '',
      startDate: '',
      endDate: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadReadings(0);
  }

  handleExport(options: ExportOptions): void {
    const filename = `lecturas_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.readings, options.format, filename);
    } else {
      const values = this.filterForm.value;
      const selectedZoneId = values.zoneId || undefined;
      const selectedStatus = values.status || undefined;
      const startDate = values.startDate || undefined;
      const endDate = values.endDate || undefined;
      
      this.readingService.search(
        this.searchQuery.trim() || undefined,
        selectedZoneId,
        selectedStatus as ReadingStatus,
        startDate,
        endDate,
        0,
        10000,
        this.sort
      ).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.doExport(res.data.content ?? [], options.format, filename);
          }
        },
        error: (err) => {
          console.error('Error fetching all readings for export', err);
        }
      });
    }
  }

  private doExport(data: MeterReadingResponseDTO[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(r => {
      let estado: string = r.status;
      if (estado === 'RECORDED') estado = 'Registrada';
      else if (estado === 'VALIDATED') estado = 'Validada';
      else if (estado === 'CANCELLED') estado = 'Cancelada';
      else if (estado === 'BILLED') estado = 'Facturada';

      return {
        'Suministro': r.supplyNumber || '',
        'Lectura Anterior': r.previousReading || 0,
        'Lectura Actual': r.currentReading || 0,
        'Consumo': r.consumption || 0,
        'Estado': estado,
        'Fecha Lectura': r.readingDate ? new Date(r.readingDate).toLocaleDateString() : '',
        'Observaciones': r.observations || ''
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }
}
