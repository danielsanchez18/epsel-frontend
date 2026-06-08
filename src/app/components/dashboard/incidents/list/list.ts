import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { IncidentService } from '@core/services/incidents/incident.service';
import { IncidentResponseDTO, IncidentStatus, IncidentPriority, IncidentType } from '@interfaces/incidents/incident.interface';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardIncidentsTable } from '../table/table';
import { ComponentDashboardIncidentsEmpty } from '../empty/empty';
import { ComponentDashboardIncidentsKpis } from '../kpis/kpis';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-incidents-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentDashboardIncidentsTable,
    ComponentDashboardIncidentsEmpty,
    ComponentDashboardIncidentsKpis
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardIncidentsList implements OnInit {
  private incidentService = inject(IncidentService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);

  incidents: IncidentResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';
  
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  // KPI counts
  kpiTotal = 0;
  kpiOpen = 0;
  kpiInProgress = 0;
  kpiResolved = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      priority: [''],
      type: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadKpis();
  }

  loadKpis(): void {
    this.incidentService.search(0, 1000).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const all = res.data.content ?? [];
          this.kpiTotal = all.length;
          this.kpiOpen = all.filter(i => i.status === 'OPEN').length;
          this.kpiInProgress = all.filter(i => i.status === 'IN_PROGRESS').length;
          this.kpiResolved = all.filter(i => i.status === 'RESOLVED').length;
        }
      }
    });
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    const values = this.filterForm.value;
    const status = values.status ? values.status as IncidentStatus : undefined;
    const priority = values.priority ? values.priority as IncidentPriority : undefined;
    const type = values.type ? values.type as IncidentType : undefined;
    const startDate = values.startDate || undefined;
    const endDate = values.endDate || undefined;

    this.incidentService.search(
      page,
      this.pageSize,
      status,
      priority,
      type,
      undefined,
      undefined,
      startDate,
      endDate
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          let items = res.data.content ?? [];

          if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            items = items.filter(item => 
              item.incidentNumber.toLowerCase().includes(query) ||
              (item.customerName && item.customerName.toLowerCase().includes(query)) ||
              item.title.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query)
            );
          }

          this.incidents = items;
          this.totalPages = res.data.totalPages ?? 0;
          this.totalElements = res.data.totalElements ?? 0;
          this.currentPage = page;
        } else {
          this.resetList();
        }
        this.isLoading = false;
      },
      error: () => {
        this.resetList();
        this.isLoading = false;
      }
    });
  }

  private resetList(): void {
    this.incidents = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadData(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadData(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      priority: '',
      type: '',
      startDate: '',
      endDate: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadData(0);
  }

  onPageChange(page: number): void {
    this.loadData(page);
  }

  handleExport(options: ExportOptions): void {
    const filename = `incidencias_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.incidents, options.format, filename);
    } else {
      const values = this.filterForm.value;
      const status = values.status ? values.status as IncidentStatus : undefined;
      const priority = values.priority ? values.priority as IncidentPriority : undefined;
      const type = values.type ? values.type as IncidentType : undefined;
      const startDate = values.startDate || undefined;
      const endDate = values.endDate || undefined;
      
      this.incidentService.search(
        0,
        10000,
        status,
        priority,
        type,
        undefined,
        undefined,
        startDate,
        endDate
      ).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            let items = res.data.content ?? [];
            if (this.searchQuery.trim()) {
              const query = this.searchQuery.toLowerCase().trim();
              items = items.filter(item => 
                item.incidentNumber.toLowerCase().includes(query) ||
                (item.customerName && item.customerName.toLowerCase().includes(query)) ||
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
              );
            }
            this.doExport(items, options.format, filename);
          }
        },
        error: (err) => {
          console.error('Error fetching all incidents for export', err);
        }
      });
    }
  }

  private doExport(data: IncidentResponseDTO[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(i => {
      let estado: string = i.status;
      if (estado === 'OPEN') estado = 'Abierta';
      else if (estado === 'IN_PROGRESS') estado = 'En Progreso';
      else if (estado === 'RESOLVED') estado = 'Resuelta';
      else if (estado === 'CLOSED') estado = 'Cerrada';

      let prioridad: string = i.priority;
      if (prioridad === 'LOW') prioridad = 'Baja';
      else if (prioridad === 'MEDIUM') prioridad = 'Media';
      else if (prioridad === 'HIGH') prioridad = 'Alta';
      else if (prioridad === 'CRITICAL') prioridad = 'Crítica';

      let tipo: string = i.type;
      if (tipo === 'LEAK') tipo = 'Fuga';
      else if (tipo === 'NO_WATER') tipo = 'Sin Agua';
      else if (tipo === 'LOW_PRESSURE') tipo = 'Baja Presión';
      else if (tipo === 'WATER_QUALITY') tipo = 'Calidad Agua';
      else if (tipo === 'BILLING') tipo = 'Facturación';
      else if (tipo === 'OTHER') tipo = 'Otro';

      return {
        'Número Incidencia': i.incidentNumber || '',
        'Título': i.title || '',
        'Estado': estado,
        'Prioridad': prioridad,
        'Tipo': tipo,
        'Cliente': i.customerName || 'Anónimo',
        'Suministro': i.supplyNumber || 'N/A',
        'Fecha Reporte': i.reportedDate ? new Date(i.reportedDate).toLocaleString() : '',
        'Fecha Resolución': i.resolvedDate ? new Date(i.resolvedDate).toLocaleString() : 'N/A'
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }
}
